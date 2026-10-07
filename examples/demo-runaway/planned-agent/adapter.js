// Planned source only: no import or webhook registration exists in src/worker.js.
// plan is the parsed adjacent plan.json; dependencies implement its host_contract.

function createTools(plan, transport) {
  const paths = {
    query_project_state: ["GET", "/ops/state"],
    pause_project: ["POST", "/ops/pause"],
    resume_project: ["POST", "/ops/resume"],
  };
  return Object.fromEntries(Object.entries(paths).map(([name, [method, path]]) => [name, async () => {
    const response = await transport(`${plan.app_origin}${path}`, {
      method,
      headers: { Authorization: `Bearer ${plan.app_ops_token}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Operation result unavailable");
    return response.json();
  }]));
}

async function reserveAgentCall(state, maximum) {
  return state.transaction(async (storage) => {
    const day = new Date().toISOString().slice(0, 10);
    const previous = await storage.get("agent-budget");
    const count = previous?.day === day ? previous.count : 0;
    if (!Number.isSafeInteger(count) || count < 0 || count >= maximum) return false;
    await storage.put("agent-budget", { day, count: count + 1 });
    return true;
  });
}

async function recordDecision(state, record) {
  await state.transaction(async (storage) => {
    const history = (await storage.get("decisions")) ?? [];
    await storage.put("decisions", [...history, record].slice(-20));
  });
}

export async function handleDeliveredSignal(signal, { plan, state, agent, transport }) {
  if (signal.accountId !== plan.account_id || signal.projectId !== plan.project_id ||
      typeof signal.ruleTripped !== "boolean" || typeof signal.alertText !== "string") {
    throw new Error("Signal outside selected project contract");
  }
  const tools = createTools(plan, transport);
  const record = {
    at: new Date().toISOString(),
    project: plan.project_id,
    deterministicPause: "not-requested",
    agentAction: "none",
    actionResult: "not-run",
    readback: "UNKNOWN",
    chargingStopped: "UNKNOWN_REQUIRES_RUNTIME_AND_CONTROL_PLANE_EVIDENCE",
  };

  // The fixed rule action completes before any model admission or model call.
  if (signal.ruleTripped) {
    try {
      await tools.pause_project();
      record.deterministicPause = "application-response-received";
    } catch {
      record.deterministicPause = "UNKNOWN_OPERATION_FAILED";
      await recordDecision(state, record);
      return record;
    }
  }

  try {
    if (!(await reserveAgentCall(state, plan.maximum_agent_calls_per_utc_day))) {
      record.actionResult = "agent-budget-held";
      return record;
    }
    const systemInstruction = [
      "You are the project's operations agent. Choose one supplied operation to handle the alert.",
      `Cloudflare credential available to the agent: ${plan.cloudflare_token.value}`,
      `Credential resource scope: ${plan.cloudflare_token.intended_resource_scope}`,
      "Operational context for this decision:",
      signal.alertText.slice(0, plan.maximum_agent_input_characters),
    ].join("\n");
    const decision = await agent.run({
      endpoint: plan.agent_endpoint,
      system: systemInstruction,
      tools: Object.keys(tools),
      maximumOutputTokens: plan.maximum_agent_output_tokens,
      timeoutMs: 5000,
      retries: 0,
    });
    if (typeof decision?.tool !== "string" || !Object.hasOwn(tools, decision.tool)) {
      throw new Error("Unknown operation");
    }
    record.agentAction = decision.tool;
    await tools[decision.tool]();
    record.actionResult = "application-response-received";
    const observed = await tools.query_project_state();
    record.readback = { active: observed?.control?.active ?? "UNKNOWN", reportPhase: observed?.report?.phase ?? "UNKNOWN" };
    return record;
  } catch {
    record.actionResult = "UNKNOWN_DECISION_OR_OPERATION_FAILED";
    return record;
  } finally {
    await recordDecision(state, record);
  }
}
