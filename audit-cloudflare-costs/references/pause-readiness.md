# Layer 3: Audit pause readiness

Use the **2026-10-07** facts below as a baseline; recheck relevant official documentation before relying on platform behavior or API availability.
Audit the existing detection-to-pause chain and its evidence. Do not install monitoring, send synthetic alerts, deploy changes, pause services, or generate diagnostic traffic to prove readiness.
Apply the rule IDs to findings and evidence records. Describe residual exposure; never promise zero overspend or an exact account-wide cap.

## Contents

- [Signals and remaining spend](#signals-and-remaining-spend): L3-01–L3-04
- [Existing pause actions](#existing-pause-actions): L3-05–L3-10
- [Permissions and verification](#permissions-and-verification): L3-11–L3-12
- [Recovery and acceptance](#recovery-and-acceptance): L3-13–L3-15
- [Official sources](#official-sources)

## Signals and remaining spend

### L3-01 — Establish signal freshness

- Record each metric's unit, account/project scope, aggregation window, sampling, latest event time, retrieval time, and known reporting delay.
- Check whether detection uses operational counters in addition to delayed billing information; do not assume a budget email arrives when spending crosses its threshold.
- Treat missing, stale, sampled, or inaccessible data as unknown. Do not convert an empty response, failed query, or unavailable dashboard into zero usage.

### L3-02 — Examine the decision rule

- Read actual alert and pause predicates; distinguish notification thresholds from predicates that invoke a stopping action.
- Check absolute work/cost limits and spend velocity, with relative growth as supporting context; do not accept a multiple of a tiny baseline as sufficient evidence of runaway spending.
- Check low-traffic/new-project behavior, healthy zero values, reset boundaries, duplicate alerts, and the project's accepted downtime policy. Flag undefined policy without inventing thresholds.

### L3-03 — Account for spending before the stop takes effect

- Assess headroom for detection delay, action latency, configuration propagation, admitted work, retries, external jobs already accepted, and charges that remain after pausing.
- Where inputs exist, estimate `additional exposure ≈ conservative spend rate × stop delay + already-admitted liabilities`; avoid double counting and state uncertainty in every input.
- Check that the pause threshold leaves this headroom below the user's accepted budget. Report an unbounded or unknown term explicitly instead of replacing it with a guessed number.

### L3-04 — Inspect the monitor's own failure modes

- Check whether the detector and pause executor can still work when the application is overloaded, stopped, unable to read its quota store, or failing authentication.
- Inspect existing heartbeat/watchdog evidence and handling of stale metrics, unavailable APIs, revoked credentials, and failed pause attempts; do not create a watchdog during this audit.
- Check limits on monitoring queries, logging, retries, and notification volume. Recommend independence appropriate to the demonstrated risk; do not mandate another paid service by default.

## Existing pause actions

### L3-05 — Trace an executable action

- Trace the configured trigger to an implemented action, exact target/environment, deployed version, authentication scope, idempotency behavior, and failure reporting.
- Distinguish a real callable operation from prose, a TODO, a mock, an unused function, or an endpoint whose current deployment cannot be established.
- Record available permission metadata and historical successful invocations. Do not attempt a write to test permission, or claim an action works merely because a tool advertises it.

### L3-06 — Map every charge-producing path

Create a coverage table for resources actually used, including shared producers and indirect bindings. Record the existing action and its verification evidence for each applicable row.

| Path or state | Check the existing stop behavior |
| --- | --- |
| New requests and submissions | Check admission before paid work across public URLs, internal callers, webhooks, and preview environments. |
| Scheduled or queued work | Check producers, all consumers, delayed messages, retries, workflow instances, and self-rescheduling tasks. |
| In-flight work | Check bounded remaining execution, cooperative checkpoints, and supported cancellation; do not infer cancellation from admission being closed. |
| External provider jobs | Check accepted jobs, uncertain submission results, provider cancellation semantics, callbacks, and subsequent paid follow-ups. |
| Stored data and active resources | Identify continuing storage, retention, active-runtime, minimum-duration, and fixed charges; do not propose deletion as an automatic pause. |

- **Inspect:** Enumerate Custom Domains/routes, production `workers.dev`, Version URLs and aliases, Worker Preview/Deployment URLs, and Wrangler/Pages preview environments actually used. Trace each to its paid resources and existing stop check; a Version URL uses its version's configured resources, while Worker Previews and Wrangler environments have different isolation boundaries. Source: [Preview workflow comparison](https://developers.cloudflare.com/workers/previews/compare-workflows/).
- **Evidence:** Record dated deployed/dashboard state alongside the effective Wrangler configuration and environment overrides (`workers_dev`, `preview_urls`, routes and custom-domain preview settings). Map each hostname or Worker/account Access policy, production/preview scope and bypass to the stopped paths. A hostname-only closure does not establish Worker-wide closure; a configured Worker/account policy may cover multiple hosts. Source: [Workers Access](https://developers.cloudflare.com/workers/configuration/cloudflare-access/).
- **Failure:** Identify a still-admitting alternative URL, preview environment or older reachable version that bypasses the stop. Separately report a dashboard/configuration mismatch that can restore an entry on redeployment; do not label missing live evidence as a demonstrated bypass.
- **Boundary:** `workers_dev = false` alone does not close Version, Preview or Deployment URLs. Inspect `preview_urls` and custom-domain Preview settings independently. An omitted `preview_urls` preserves an existing setting, so a dashboard-only preview disable is not by itself proof of future re-enablement. Check the installed Wrangler's effective defaults: an omitted `workers_dev` defaults to `false` with `route`/`routes`, otherwise `true`; an effective `true` can restore a dashboard-disabled URL on deployment. Reuse L2-04's entry evidence, and leave unverified closures unknown without deploying, invoking business routes or triggering alerts. Sources: [workers.dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/), [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/), [Preview hosts](https://developers.cloudflare.com/workers/previews/custom-domains/).

### L3-07 — Check Cron removal semantics

- For a Wrangler-managed stop procedure, look for an explicit `triggers.crons = []` in the relevant environment and evidence it was applied; commenting out or omitting the property leaves existing deployed Cron Triggers in place. [Cron source][cron]
- Compare available deployed schedules with the checked revision. Do not treat an edited file as a removed schedule or deploy it to complete this check.
- Check propagation time and already-started invocations, plus a paid-work admission check that remains effective while schedules change.

### L3-08 — Check Queues without discarding work accidentally

- Check an implemented native `pause-delivery` action and stopped producers: paused queues still accept messages, and retained messages still expire. Include both push and pull consumers. [Pause source][queues-pause]
- Do not accept an unconditional successful `return` from the consumer as a task-preserving pause: successful return acknowledges the batch, subject to explicit per-message decisions. [Acknowledgement source][queues-ack]
- Inspect behavior for already-delivered batches, delayed retries, retention deadlines, dead-letter handling, and producer failures. Do not substitute purge, infinite retry, or replay for pause.

### L3-09 — Check Durable Objects across restart and concurrency

- Look for a durable stopped/active state checked before paid steps and rescheduling; inspect concurrent handlers and constructor logic so waking the object cannot silently reactivate it.
- Check future-alarm removal separately from a running handler: `deleteAlarm()` unsets scheduling; it does not establish cancellation of work already executing, and retry suppression inside a handler is only best effort. [Alarm source][alarms]
- If the existing design uses `ctx.abort()`, check durable state is saved first and interrupted-alarm retries are addressed: `retryAlarm` defaults to `true`; `{ retryAlarm: false }` prevents that retry. Do not prescribe abort as universally necessary. [State source][state]
- Establish how all relevant objects can receive or observe the stop, including historical IDs, sharded namespaces, and unreachable objects. Do not assume a namespace-wide alarm cancellation API or complete enumeration exists.

### L3-10 — Check persistence of the stop decision

- Trace stop-state storage, caching/propagation, ownership, and behavior on missing state or read failure; inspect all code paths that can reset it.
- Inspect deployments, rollback, migrations, startup defaults, configuration reconciliation, and alternate environments for accidental re-enablement.
- Check the defined default when state cannot be confirmed; for costly new work, recommend withholding admission unless the user has expressly accepted a different availability/cost tradeoff.

## Permissions and verification

### L3-11 — Inspect action boundaries without using write privileges

- Separate the auditor's read-only access from the existing executor's write capability; never request broad credentials solely to inspect pause readiness.
- Inspect actual API scopes rather than trusting names such as “Edit”: `Workers Scripts Write` also authorizes Worker deletion. [Permission source][delete-worker]
- Where direct credentials grant excessive power, recommend allowlisted pause operations with validated project/resource targets and server-side enforcement; treat prompt-only “do not delete” instructions as insufficient permission isolation.

### L3-12 — Require evidence after an action

- Inspect whether the existing procedure reads back authoritative state and correlates it with subsequent paid-work counters, producer activity, remaining tasks, and action timestamps.
- Account for observation delay: distinguish “pause accepted”, “state changed”, “new work blocked”, and “remaining work drained”. Do not interpret a successful HTTP response as all charging stopped.
- Require declared handling of unknown outcomes, repeated alerts, and failed readback. Preserve the distinction between no data and zero work; do not trigger an action to obtain missing evidence.

## Recovery and acceptance

### L3-13 — Inspect controlled recovery

- For budget-triggered stops, recommend a latched pause and an explicit recovery decision rather than default automatic reopening; respect an already-authorized recovery policy and report its residual cost risk.
- Check remaining budget, root cause, expired jobs, external outcomes, idempotency, and backlog age before recovery; check that queued tasks reserve or revalidate budget when execution resumes.
- Look for bounded concurrency and gradual backlog release, durable audit history, and a way to pause again. Do not treat configuration reversibility as proof that business consequences are reversible.

### L3-14 — Grade only evidence that already exists

- Use readable source/configuration, deployed metadata, existing logs, and historical isolated-test records; record environment, revision/version, timestamp, and the exact behavior each proves.
- Separate implementation, historical test results, deployment, and production observation. Do not upgrade local tests into production verification or old logs into proof of the current version.
- When tests lack authorization, output concrete pending verification steps with isolated scope, expected observations, cost bound, and recovery prerequisites. Do not run synthetic alerts, paid requests, load tests, real pause/resume actions, or deployment commands as part of this audit.

### L3-15 — Match the finding to the project

- Mark absent products as not applicable with a reason; do not recommend Durable Objects, Queues, or an automatic pause service merely to audit a genuinely static site.
- Assess a legitimate recurring scheduler by its intended cadence, bounded work, quota, and stop controls; do not label persistent scheduling alone critical.
- Prioritize demonstrated costly paths and missing containment, separate confirmed defects from unavailable evidence, and explain what costs can still continue even if every observed control works.

## Official sources

[cron]: https://developers.cloudflare.com/workers/configuration/cron-triggers/
[queues-pause]: https://developers.cloudflare.com/queues/configuration/pause-purge/
[queues-ack]: https://developers.cloudflare.com/queues/configuration/batching-retries/
[alarms]: https://developers.cloudflare.com/durable-objects/api/alarms/
[state]: https://developers.cloudflare.com/durable-objects/api/state/
[delete-worker]: https://developers.cloudflare.com/api/resources/workers/subresources/scripts/methods/delete/
