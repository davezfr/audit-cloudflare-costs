# Layer 4 — Audit bounded agent delegation

Fact baseline: **2026-10-07**. Recheck current official documentation for the actual provider, connector, negotiated MCP version and deployed executor before relying on platform behavior. The linked MCP specification is version **2025-11-25**; do not assume every integration implements it.

Audit an existing or explicitly planned agent-assisted cost-response integration. Remain read-only: inspect source, configuration metadata, supplied records and historical tests. Do not send alerts, wake or invoke an agent, call pause/resume operations, install integrations, or build or run a watchdog to obtain evidence.

The restricted tool surface, independent deterministic stop and human-controlled recovery below are this skill's **engineering audit rules**, not promises made by Cloudflare, MCP or an agent vendor. Use the verdicts and evidence levels in [evidence-and-report.md](evidence-and-report.md). A concrete unsafe planned design can be a **SOURCE GAP**; state its deployment status and prerequisites. Being unlaunched, lacking audit credentials, or having no historical test is not itself a high-severity defect. Use **UNKNOWN** for missing evidence. An absent optional agent layer is not a defect.

## Contents

- [Scope and authority: L4-01–L4-04](#scope-and-authority)
- [Independent containment and cost: L4-05–L4-07](#independent-containment-and-cost)
- [Reports, data and evidence: L4-08–L4-10](#reports-data-and-evidence)
- [Official sources](#official-sources)

## Scope and authority

### L4-01 — Establish whether agent delegation exists

- **Inspect:** Search the project's integration registry, relevant source and environment configuration, MCP/tool registrations, alert receivers, webhooks, pause APIs and integration/design documents. Trace an actual alert-to-agent-to-executor relationship; inspect likely shared adapters within the authorized scope. Record the integration as **connected**, **planned**, **absent**, or **unknown** when evidence cannot distinguish them.
- **Evidence:** Identify provider, agent/client, connector, callable tools, trigger, target project/environment and implementation or explicit design record. Classify the trigger as an operational-metric alert, a budget-notification email, or another documented channel, and record its data freshness using L1-06. Distinguish declared configuration, deployed integration and observed use. To claim absence, state the reasonable search scope and account for inaccessible external configuration; one unsuccessful keyword search is insufficient.
- **Failure:** Show a concrete mismatch between the claimed integration and its reachable implementation, or a planned design that relies on a capability not supported by the verified interface. If fast-spend containment depends only on a budget email waking an agent, apply [L1-06](billing-and-alerts.md#l1-06--compare-data-freshness-with-time-to-damaging-spend) and establish the affected paid path: a delayed notification cannot supply timely containment.
- **Boundary:** With sufficient absence evidence, mark **L4-01–L4-10 NOT_APPLICABLE** together and do not require adding an agent. A mention of Grok, Meta, dots or another provider is only a search lead; it proves neither integration nor supported wake-up, MCP, webhook or pause functionality. Incomplete inventory remains UNKNOWN. Do not infer that every notification channel is available for every Cloudflare alert type.

### L4-02 — Inspect the complete effective tool surface

- **Inspect:** Enumerate all operations reachable by the cost-response agent, including other MCP servers, generic HTTP/API dispatch, shell/code execution, browser sessions, delegated agents and tool-discovery changes. Check that effective authority permits only bounded queries and server-allowlisted pause actions on designated targets. Exclude deletion, recovery/resume, deployment, configuration-edit tools, credential creation/rotation and queue purging.
- **Evidence:** Map exposed names and schemas to handler implementations, authorization checks and downstream operations. Inspect server-side operation/target allowlists and existing rejection records or tests, including alternate dispatch paths. A fixed pause handler may perform its defined stop-state write; it must not expose general configuration mutation to the agent.
- **Failure:** Demonstrate a reachable forbidden operation, an indirect escape through a generic tool or delegation, or a claimed restriction enforced only by prompts. A tool named `safe_pause`, a description saying “read-only”, or an annotation does not establish a permission boundary.
- **Boundary:** Reuse [L3-11](pause-readiness.md#l3-11--inspect-action-boundaries-without-using-write-privileges) for underlying API scopes. MCP tool annotations are untrusted unless their server is trusted, and metadata alone still does not prove handler enforcement. [MCP tools][mcp-tools] If a connector's effective surface cannot be read, leave that scope UNKNOWN; do not call a forbidden operation to discover whether it succeeds.

### L4-03 — Keep direct credentials behind the executor

- **Inspect:** Locate the cost-response integration's Cloudflare API Tokens and project keys in a controlled execution service. Check secret references, storage/access policy and injection into downstream requests. Trace possible exposure through tool arguments/results, error messages, model or agent context, prompts, memory and third-party agent-platform configuration; none should receive these direct credentials.
- **Evidence:** Cite redacted secret references, the executor's credential-loading path, actual permission metadata and sanitized tool contracts. Distinguish the direct Cloudflare credential from the identity used by a trusted client to authenticate to a restricted MCP/pause service. Inspect who can use each identity, its audience, effective scopes and target limits without retrieving token values.
- **Failure:** Show a direct Cloudflare/account token or project key entering the agent-visible or third-party configuration path, or an agent able to bypass the restricted service using those credentials. Apply **L3-11** to the actual authority: Cloudflare's Worker deletion endpoint accepts `Workers Scripts Write`. [Cloudflare API][cf-delete]
- **Boundary:** A restricted MCP/OAuth client identity is not evidence that a direct Cloudflare account token was exposed; verify the actual credential flow. MCP authorization separates the MCP access token from an upstream API token and forbids token passthrough. [MCP authorization][mcp-auth] A session ID alone is not authentication. [MCP security][mcp-security] Never request full keys or print suspected secrets during this audit.

### L4-04 — Treat alert content as data and validate targets

- **Inspect:** Trace alert payloads, log text, URLs, query parameters and tool results as untrusted data. Check that these fields cannot become privileged instructions, arbitrary tool names, executable code, outbound destinations or unchecked resource selectors. Inspect webhook authentication/replay handling and server-side schema, operation, account/project/environment/resource and URL-destination validation.
- **Evidence:** Show how the executor derives the permitted scope from authenticated identity and fixed server policy, validates every argument, rejects unexpected fields and binds the action to the designated project. Inspect existing injection and wrong-target tests, including cross-project, cross-tool and data-exfiltration cases; do not replay them against a live integration.
- **Failure:** Demonstrate how attacker-controlled text or a parameter can redirect an action, choose another project, invoke another tool, or send sensitive data to an unintended destination. A schema that accepts any string, client-only checking or a prompt saying “ignore malicious logs” does not establish server enforcement.
- **Boundary:** MCP requires input validation and access controls, while official agent guidance explains how untrusted text can influence downstream tool calls. [MCP tools][mcp-tools] [Agent safety][agent-safety] Use structured fields and server checks as engineering controls; neither JSON shape nor a guardrail classifier proves semantic authorization or eliminates injection risk. Missing implementation remains UNKNOWN.

## Independent containment and cost

### L4-05 — Keep the definite stop independent of agent availability

- **Inspect:** Trace a clearly defined limit breach through the existing **Layer 3** rule directly to its pause executor, without waiting for an agent to wake, interpret the event or approve the stop. Inspect the agent's offline, timeout, malformed-output, exception and authentication-failure defaults, plus existing heartbeat/watchdog or availability records.
- **Evidence:** Identify the deterministic predicate, direct action path, timeout/failure state and deployed or historical evidence at the stated level. Verify that an agent's silence or analysis cannot veto, delay indefinitely or clear a stop already required by that predicate. Refer to [L3-04](pause-readiness.md#l3-04--inspect-the-monitors-own-failure-modes) for the detector/executor's own dependencies and survival.
- **Failure:** Show an identified high-cost limit breach whose only stop path depends on model availability or discretionary model output, or a fallback that continues costly admission after the declared stop condition. A definite flaw in a planned flow can be SOURCE GAP without implying that live spending exists.
- **Boundary:** Agent assistance may explain events or request a separately allowlisted pause within policy. Absence of an agent heartbeat record is UNKNOWN, not proof the deterministic stop is broken. Audit existing survival evidence; do not add a paid service, start an agent, manufacture an outage or run a watchdog. Do not require an automatic stop system for a project to which Layer 3 is not applicable.

### L4-06 — Reserve recovery for a human decision

- **Inspect:** Check that the agent's complete effective authority cannot resume work, reset the stop latch, approve its own recovery, raise a budget to reopen admission, or reach an equivalent operation indirectly. Locate the human approval requirement and the separate authorized recovery path.
- **Evidence:** Cite the action boundary and existing approval/audit records that bind a recovery decision to the intended project and stop event. Reuse [L3-13](pause-readiness.md#l3-13--inspect-controlled-recovery) for recovery prerequisites, backlog handling and safeguards instead of duplicating that mechanism here.
- **Failure:** Show an agent-callable recovery operation, self-approval, automatic reopening based on its recommendation, or a tool that can undo the pause through another configuration/state path.
- **Boundary:** An agent may draft a recovery recommendation; it must not hold the means to enact or approve recovery. If an existing authorized policy intentionally permits automatic recovery, report its departure from this human-approval engineering rule and the L3-13 cost implications accurately; do not silently change that policy. Missing historical approvals do not prove the approval gate is absent, and this audit never resumes work.

### L4-07 — Bound agent work and repeated notifications

- **Inspect:** Account for agent wake-ups, model calls/tokens, tool calls, parallel sessions, retries, alert deliveries, report notifications and duplicate pause requests. Trace repeated or correlated alerts to stable event/project identity and inspect deduplication, rate/concurrency limits, deadlines, attempt limits and aggregate work/spend ceilings. Include retry policies in external platforms and SDKs.
- **Evidence:** Establish a conservative bound per incident and reporting window, plus the aggregate guard for many distinct alerts. Inspect duplicate handling in both the trigger and executor and the stop condition for failed notifications, unavailable models and uncertain pause outcomes. Reuse [L2-18](execution-limits.md#l2-18--bound-logs-and-the-protection-machinery-itself) and **L3-04** for shared monitoring costs and resilience.
- **Failure:** Show an alert storm that starts unbounded paid agent work, retries that replenish their own budget, or repeated pause/notification failures generating new alerts indefinitely. Deduplication alone does not bound unique events; backoff alone does not cap total spend. An aggregate cap does not establish deduplication or rate limiting: if source or existing records prove that repeated delivery of the same event starts avoidable paid work or exceeds the intended rate/concurrency bound, report that control gap at a severity proportionate to the evidenced bounded exposure.
- **Boundary:** Accept effective existing provider limits when their scope and adequacy are evidenced; do not require every bound to be custom-built. MCP's rate-limit requirement does not itself establish a monetary cap or cross-event deduplication. [MCP tools][mcp-tools] Unknown model pricing or volume prevents a verified cost estimate, not useful source analysis.

## Reports, data and evidence

### L4-08 — Require an evidence-based disposition report

- **Inspect:** Review actual reports or implemented templates for project/environment, statistical window, latest data timestamp, absolute work/cost quantities, relative change and baseline, decision, action timestamps, authoritative readback, remaining tasks and unresolved outcomes. Include units, sampling/delay limitations and separation of verified facts from unverified claims.
- **Evidence:** Match an existing report to its bounded metric inputs, action identifier and readback records. Apply [L3-12](pause-readiness.md#l3-12--require-evidence-after-an-action) to the action's state and remaining work; retain its distinctions between an accepted request, changed state, blocked new work and drained work.
- **Failure:** Show a report declaring containment from a successful tool response alone, treating stale/missing data as zero, using only a relative spike with no absolute baseline, or hiding remaining queued/external work behind “all stopped”. A template containing only “handled” or “已处理” without operational evidence is insufficient. A deficient planned template can be a SOURCE GAP at that evidence level.
- **Boundary:** Do not require currency totals when current prices or allocation are unknown; report supported units and uncertainty. No historical report leaves operational reporting UNKNOWN rather than proving the template failed. Inspect existing reports or code without waking an agent to generate a new one.

### L4-09 — Minimize information sent to third parties

- **Inspect:** Map every model/provider, external MCP server, notification destination, trace store and memory sink receiving cost-response data. Inspect field selection, aggregation and redaction before egress, including exception paths and URLs. Send only necessary sanitized identifiers, metrics and decision context; exclude keys, customer records/payloads and sensitive logs from third-party agent inputs and outputs.
- **Evidence:** Cite serialization/redaction code, actual destination configuration, permitted field schemas and bounded sanitized records of what was sent. Check available retention/access configuration where it affects this flow. Treat integration documents and provider privacy statements as claims to assess, not substitutes for the implementation or outbound-data evidence.
- **Failure:** Show a reachable path forwarding raw customer data, credentials or sensitive log content to a third-party agent/tool, including through error reporting or a report link. A prompt requesting a short summary does not prevent the earlier transfer of an entire raw payload.
- **Boundary:** Missing source, runtime settings or records leaves the relevant egress claim UNKNOWN; the use of a third-party model alone is not a finding. Official agent guidance describes unintended private-data sharing as a risk, not proof that it occurred in this project. [Agent safety][agent-safety] Keep the audit's own evidence redacted and avoid retrieving sensitive payloads merely to demonstrate their presence.

### L4-10 — Trace actions and inspect existing end-to-end tests

- **Inspect:** Locate durable records linking alert ID, trigger/wake-up, agent run, policy/version and decision, executor identity, allowlisted action, exact target, timestamps, result and authoritative readback. Inspect existing isolated end-to-end test evidence for **synthetic alert → wake-up → decision → designated pause → readback**, plus relevant rejection, duplicate and offline behavior.
- **Evidence:** Correlate the chain using stable identifiers and record environment, revision/deployed version, test time, bounded test scope and observed results. Use [L3-14](pause-readiness.md#l3-14--grade-only-evidence-that-already-exists): distinguish source tests, recorded passing tests, deployed configuration and production observations. Logs need enough traceability for attribution without recording raw credentials or private reasoning.
- **Failure:** Show an implemented audit trail that loses the target/action linkage, attributes actions to an unverifiable identity, or an existing claimed end-to-end test that demonstrably exercises only a mock or stops before the asserted readback. Grade the exact unsupported claim or source defect rather than inventing an operational failure.
- **Boundary:** No history or unreadable tests means UNKNOWN for end-to-end operation; it does not prove that an unlaunched design cannot work. List a concrete pending isolated acceptance test with expected observations and a cost bound when useful. This audit does not send the synthetic alert, invoke the agent, call pause/resume, deploy code, or build/run the proposed monitoring system.

## Official sources

Use these primary sources for the limited provider/protocol facts identified above. Apply the remaining requirements as project-specific engineering checks; none establishes that a named provider exposes a particular integration or that this project's controls work.

| Source | Supported fact or guidance |
| --- | --- |
| [Cloudflare Delete Worker API][cf-delete] | Worker deletion accepts `Workers Scripts Write`; an “Edit/Write” label is not pause-only authority. |
| [MCP Tools, 2025-11-25][mcp-tools] | Tool schemas/annotations, server input validation and access controls, invocation rate limiting, output sanitization and client audit/timeout guidance. |
| [MCP Authorization, 2025-11-25][mcp-auth] | Audience validation, secure token handling and separation of MCP authorization from upstream API authorization. |
| [MCP Security Best Practices][mcp-security] | Token-passthrough risks, session authentication boundaries, SSRF protections and scope minimization. |
| [OpenAI Safety in building agents][agent-safety] | Prompt-injection and private-data leakage risks; structured data and isolation reduce risk but do not eliminate it. This is design guidance, not a requirement to adopt Agent Builder or a particular model. |

[cf-delete]: https://developers.cloudflare.com/api/resources/workers/subresources/scripts/methods/delete/
[mcp-tools]: https://modelcontextprotocol.io/specification/2025-11-25/server/tools
[mcp-auth]: https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization
[mcp-security]: https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices
[agent-safety]: https://developers.openai.com/api/docs/guides/agent-builder-safety
