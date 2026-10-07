const INTERNAL_ORIGIN = "https://bindings.example.invalid";

export function controlStub(env) {
  return env.CONTROL.get(env.CONTROL.idFromName("DEMO_PROJECT_CONTROL"));
}

export function reportStub(env) {
  return env.REPORT_JOB.get(env.REPORT_JOB.idFromName("DEMO_SINGLE_REPORT"));
}

export async function callBinding(stub, path, method = "GET") {
  // This URL labels a binding request; it is not a public network destination.
  const response = await stub.fetch(`${INTERNAL_ORIGIN}${path}`, { method });
  if (!response.ok) throw new Error("Binding operation failed");
  return response.json();
}

export async function isActive(env) {
  try {
    return (await callBinding(controlStub(env), "/state")).active === true;
  } catch {
    return false;
  }
}

export class ProjectControl {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (request.method === "GET" && path === "/state") {
      return Response.json({ active: (await this.ctx.storage.get("active")) === true });
    }
    if (request.method === "POST" && (path === "/pause" || path === "/resume")) {
      await this.ctx.storage.put("active", path === "/resume");
      return Response.json({ active: path === "/resume" });
    }
    return new Response("Not found", { status: 404 });
  }
}

export async function pauseApplication(env) {
  // Persist admission state first; then remove this scenario's one report alarm.
  await callBinding(controlStub(env), "/pause", "POST");
  await callBinding(reportStub(env), "/pause", "POST");
  return readApplicationState(env);
}

export async function readApplicationState(env) {
  return {
    control: await callBinding(controlStub(env), "/state"),
    report: await callBinding(reportStub(env), "/status"),
    queueDelivery: "UNKNOWN_REQUIRES_CONTROL_PLANE_READBACK",
    deployedCrons: "UNKNOWN_REQUIRES_CONTROL_PLANE_READBACK",
    newWorkCounters: "UNKNOWN_REQUIRES_RUNTIME_EVIDENCE",
    residualCharges: ["already-admitted operations", "retained storage", "platform and subscription charges"],
  };
}
