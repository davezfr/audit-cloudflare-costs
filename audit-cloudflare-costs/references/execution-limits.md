# Layer 2 — Bound each paid execution path

Fact baseline: **2026-10-07**. Recheck linked official documentation for the account's plan, deployed runtime, storage backend and installed SDK before relying on product semantics. Do not copy prices, default limits or future availability from memory.

## Contents

- [Entry points and admission: L2-01–L2-04](#entry-points-and-admission)
- [Budgets and repeated work: L2-05–L2-09](#budgets-and-repeated-work)
- [Background execution: L2-10–L2-12](#background-execution)
- [Product cost drivers: L2-13–L2-18](#product-cost-drivers)

Apply only to services and reachable work present in the project. Record an unused service as not applicable with inventory evidence. Record unavailable code, configuration or telemetry as unknown, rather than as a missing control. A finding needs a reachable cost-producing path, the ineffective or absent bound, and evidence for both. A missing preferred identifier, optimization or architecture is not sufficient. Use existing source, configuration, traces and test results; propose bounded validation when evidence is unavailable. Do not generate paid traffic, mutate data or change deployment settings during this audit.

## Entry points and admission

### L2-01 — Trace every billable path

- **Inspect:** Follow HTTP/RPC handlers, middleware, cron, queue consumers, DO alarms, workflow steps, callbacks, build hooks and external schedulers into paid operations. Include `waitUntil`, service bindings, generated adapters and external APIs. Record origin, downstream fan-out, meter, billing account/provider and controlling gate.
- **Evidence:** Cite caller-to-callee source and effective environment bindings; distinguish configured resources from actually reachable operations. Identify all paths to a shared paid helper, including internal and alternate public entry points.
- **Failure:** Show a concrete route that bypasses the claimed control, or a paid dependency omitted from cost accounting. Trace its effect rather than counting API names found by search.
- **Boundary:** Do not require backend quotas for a verified direct-static-only project. Missing generated code or inaccessible dependencies leave the relevant path unknown; they do not prove a bypass.

### L2-02 — Bound the work admitted by one operation

- **Inspect:** Check server-side item count, bytes, decoded dimensions, document pages, query range, pagination, tokens, model choice and generated outputs, as relevant. Include limits after decompression/decoding, externally fetched content, nested batches and caller-controlled multipliers.
- **Evidence:** Locate validation before costly decoding, storage or provider calls; establish a conservative maximum number of billable units for one accepted operation and show boundary cases in existing tests.
- **Failure:** Demonstrate how one accepted request can create arbitrary work, or how a frontend-only check, trusted `Content-Length` or unchecked nested input can be bypassed.
- **Boundary:** Select limits from legitimate workloads and stated budgets. A platform body-size ceiling, streaming implementation or timeout does not by itself bound downstream work; do not label streaming unsafe solely because it avoids buffering.

### L2-03 — Check runtime limits without overstating their coverage

- **Inspect:** Read effective `limits.cpu_ms` and `limits.subrequests`, invocation type, plan support and normal execution data. Follow redirects and repeated downstream calls where relevant. Check SDK/provider timeouts separately.
- **Evidence:** Separate repository configuration, deployed configuration and observed enforcement. Inspect existing deployed-test evidence; local development does not enforce these Wrangler runtime limits.
- **Failure:** Show a disproportionate or unbounded execution path that lacks an effective applicable guard. Report an unsafe assumption if CPU limits are treated as limits on database operations, provider spend or monthly requests.
- **Boundary:** Network waiting does not consume Worker CPU, and the runtime permits some CPU-limit flexibility. A configured ceiling is not an exact monetary cap. Do not prescribe one universal CPU value or confuse local success with production enforcement. Sources: [Wrangler limits](https://developers.cloudflare.com/workers/wrangler/configuration/#limits), [Worker CPU](https://developers.cloudflare.com/workers/platform/limits/#cpu-time).

### L2-04 — Bound abuse across identities and entry points

- **Inspect:** Verify authentication and authorization before costly work where the product requires identity; check per-user/tenant quotas, public anonymous allowances, signup abuse, API keys and the aggregate project guard. Check edge protections and alternate origins from the inventory. Include Custom Domains/routes, production `workers.dev`, Version URLs and aliases, Worker Preview/Deployment URLs, and Wrangler/Pages preview environments where used. Compare effective `workers_dev`, `preview_urls`, routes and environment overrides with dated dashboard/deployment state; trace each entry's paid-resource bindings.
- **Evidence:** Trace how trusted actor identity is derived and how each entry point reaches the same relevant budget. Include multiple users, changing IPs and internal callers in the control model. Record WAF host/path coverage and each Access policy's actual hostname, Worker or account target, production/preview coverage and bypass policies. Hostname-scoped protection does not establish other hosts' coverage; Worker/account Access may cover them when its target and traffic scope include them. Source: [Workers Access](https://developers.cloudflare.com/workers/configuration/cloudflare-access/).
- **Failure:** Show that caller-supplied identity, IP rotation, account creation or an alternate entry point can evade the only effective protection on a high-cost path. Distinguish a reachable bypass from unknown live state or possible re-enablement on a later deployment.
- **Boundary:** Login is not mandatory for every product and cannot replace an aggregate budget. IP limits, challenges and WAF are useful complementary controls. Returning `429` after Worker execution starts does not erase that invocation; do not equate blocking expensive downstream work with free requests. Version URLs use the uploaded version's configured resources; they do not create an isolated environment. At this baseline, Version URLs are not generated for Workers implementing a Durable Object; merely binding to a DO is a different case. Establish applicability before treating `preview_urls` as a reachable entry. Disabling `workers_dev` alone does not disable Version, Preview or Deployment URLs. Current `preview_urls` covers Version URLs and `workers.dev` Preview URLs; omission preserves an existing setting, and `workers_dev` determines the initial default only when no setting exists. Inspect custom-domain preview enablement separately. If the dashboard disables `workers.dev` but effective Wrangler configuration enables it (explicit `true`, or omitted with no `route`/`routes`), a later Wrangler deploy can restore it; omitted `workers_dev` with `route`/`routes` defaults to `false`. Explicit `preview_urls = true` can likewise conflict with a dashboard-disabled setting; omission alone does not prove re-enablement. Do not deploy or probe URLs to settle unknowns. Sources: [workers.dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/), [Version URLs](https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/), [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/), [Preview hosts](https://developers.cloudflare.com/workers/previews/custom-domains/).

## Budgets and repeated work

### L2-05 — Reserve aggregate budget before spending

- **Inspect:** Find the authoritative ledger and the transaction/conditional update or serialized authority that reserves cost units before work starts. Follow concurrent admission across instances, users and environments; include pending reservations and child work.
- **Evidence:** Explain why two callers cannot both consume the last unit. Check existing race tests and reservation-to-task linkage, not just a function named `checkQuota`. Verify that user and project constraints both remain enforced.
- **Failure:** Show read-then-write races, instance-local counters used globally, post-payment charging, or multiple independent ledgers each admitting against the entire budget.
- **Boundary:** Meter units must reflect paid work: twenty images need twenty image units, and differing models may require different weights. For a declared high-cost stop-on-budget policy, an unavailable ledger should stop new paid work; document any explicit fail-open business policy and its exposure rather than silently overriding it.

### L2-06 — Preserve budget semantics across time and recovery

- **Inspect:** Check window boundaries, timezone, rollover, reservation expiry, retries, restarts, refunds and reconciliation. Map project allowances to the account budget and other projects; include fixed costs and residual storage when estimating an affordable allowance.
- **Evidence:** State which budget/window is enforced, when pending work is counted and how a task spanning a reset is handled. Trace what happens if the external task outlives its reservation or the local result is lost.
- **Failure:** Show a reset or premature refund that grants fresh allowance for already committed work, a lease expiring while billable work continues, or failure recovery restoring consumed quota without proof it was unused.
- **Boundary:** A daily quota does not equal a billing-period cap. Estimates require current rates and stated assumptions; unknown budget or unit cost means adequacy is unverified. Do not invent the user's tolerable loss or automatically align all application windows to a calendar month.

### L2-07 — Separate throughput limits from accurate accounting

- **Inspect:** Determine the scope and consistency of rate limiters, semaphores and counters. Check whether concurrency limits actually cover all consumers and instances, and whether cumulative quotas are enforced elsewhere.
- **Evidence:** Document location/process/account scope, consistency, overshoot tolerance and cumulative-work bound. Ordinary Workers KV read-modify-write is not an atomic global reservation.
- **Failure:** Show a per-location or per-instance allowance being represented as a strict global cap, or continuous work that can exhaust the budget despite low concurrency.
- **Boundary:** The Workers Rate Limiting binding is per Cloudflare location and eventually consistent, not an accurate accounting ledger. It can supplement a strict authority; its presence is not itself a defect. A KV-backed cache with admission serialized elsewhere may be sound. Sources: [Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [KV consistency](https://developers.cloudflare.com/kv/concepts/how-kv-works/).

### L2-08 — Bound root tasks, fan-out and retry multiplication

- **Inspect:** Follow one business task across batches, pages, child jobs, retries, SDK retries and re-enqueues. Look for durable root identity, total work/attempt budget, deadline, progress cursor and terminal handling; check bounds at each new paid step.
- **Evidence:** Compute a conservative bound or identify the exact unbounded edge. Combine effective retry policies across layers, explicitly distinguishing attempts from retries and accounting for retrying whole batches.
- **Failure:** Show new IDs, counter resets, swallowed errors or batch splitting replenishing the same root task's allowance; or backoff/concurrency being the only restraint on indefinite paid work.
- **Boundary:** A field need not be named `maxRetries`: inspect equivalent state transitions, platform defaults and external policies. Deliberately recurring services can be valid with bounded cycles, aggregate budget and an effective disable state; they need not have a finite lifetime.

### L2-09 — Make duplicate and uncertain results safe

- **Inspect:** Verify stable business idempotency keys, atomic claims, replay retention, concurrent duplicate handling and provider idempotency. Follow the crash window after an external service accepts work but before local success is recorded.
- **Evidence:** Trace `pending`, completed, failed and outcome-unknown states or equivalent logic. Inspect existing duplicate-delivery and crash-recovery tests, provider request identifiers and reconciliation paths.
- **Failure:** Show duplicate billing after concurrent delivery, expired deduplication or blind retry of an accepted external task. A local `done` check alone does not establish safe recovery.
- **Boundary:** A timeout is not proof of provider cancellation. Do not promise exactly-once execution merely because a key exists; if a provider cannot deduplicate or report task status, identify the uncertainty and the proposed hold/review policy.

## Background execution

### L2-10 — Inspect DO alarm state transitions

- **Inspect:** Follow constructor, `alarm()`, every `setAlarm()` call, durable enable/work state and failure exits. Check empty-work behavior, deadlines, future schedule selection and object re-instantiation.
- **Evidence:** Describe why a one-shot task terminates, or why a recurring service remains within its stated budget and can be disabled. Inspect whether the constructor checks existing scheduling before setting an alarm.
- **Failure:** Show unintended rescheduling after terminal/disabled state, reinitialization of root budget, or an unbounded self-scheduling failure chain. Platform automatic failure retries were capped at six at the baseline; new `setAlarm()` calls can extend work beyond that event's retries.
- **Boundary:** `setAlarm()` in a constructor is allowed with care; banning it is a project convention, not a platform rule. A call or recurring alarm alone is not a bug. `getAlarm()` may return null inside a running handler, so inspect context before diagnosing a missing schedule. Source: [Alarms](https://developers.cloudflare.com/durable-objects/api/alarms/).

### L2-11 — Audit queue delivery and acknowledgement

- **Inspect:** Check batch processing order, per-message `ack()`/`retry()`, thrown errors, consumer retry policy, DLQ behavior, redrive tools and provider/SDK retries. Trace repeated paid side effects after partial batch success.
- **Evidence:** Establish which messages may be delivered again and how completed work is recognized. Verify the actual default when no explicit retry setting exists, and whether a DLQ consumer can recreate the original loop.
- **Failure:** Show successful expensive messages retried without idempotency when another message fails, unlimited re-enqueue/redrive, or a consumer that returns successfully while assuming its unprocessed batch remains pending.
- **Boundary:** Explicitly acknowledged messages are not redelivered with batch failures; successful consumer return acknowledges otherwise unmarked messages. Acknowledge only after the required durable success condition, not preemptively to save cost. Native queue retries are finite, but application-created messages can restart the chain. Source: [Queue batching and retries](https://developers.cloudflare.com/queues/configuration/batching-retries/).

### L2-12 — Detect loops made entirely of successful events

- **Inspect:** Match outputs to event subscription filters and downstream triggers: R2 writes, callbacks, database change events, workflow launches and queue producers. Preserve original business identity across newly created event IDs.
- **Evidence:** Draw or describe the concrete cycle and its stop condition, prefix/bucket separation, per-root work budget or explicit processed marker.
- **Failure:** Show output qualifying as new input indefinitely, such as processing an R2 upload and writing the result back into the same unfiltered subscription. Success/error-rate monitoring and per-message retry limits do not bound new successful events.
- **Boundary:** Sharing a bucket is not itself a defect if filters and transitions exclude outputs. R2 `object-create` includes overwrites; verify effective prefix/suffix rules before concluding a loop exists. Source: [R2 events](https://developers.cloudflare.com/r2/buckets/event-notifications/).

## Product cost drivers

### L2-13 — Measure database and key operations correctly

- **Inspect:** Check query shape, filters/indexes, pagination, repeated scans, polling writes, upserts and cleanup jobs. Inspect available query plans and existing `rows_read`/`rows_written` metadata; trace keys inside KV batches.
- **Evidence:** Estimate scanned/written rows or touched keys per root operation using documented assumptions and available cardinalities. Include index maintenance and repeated unchanged writes.
- **Failure:** Show a hot path scanning an unbounded dataset, a cleanup loop repeatedly scanning the same range, or an estimate equating one batch/API call with one billable row or key.
- **Boundary:** D1 reads count scanned rows; `INSERT`, `UPDATE` and `DELETE` contribute writes, and indexes have storage/write costs as well as read benefits. `LIMIT` alone need not bound scanning. Missing telemetry is unknown; do not run production queries or add indexes to verify it. Sources: [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/).

### L2-14 — Account for DO duration and storage backend

- **Inspect:** Determine SQLite versus legacy KV storage; review WebSocket acceptance, handlers, timers, pending I/O, idle eligibility and object cardinality. Inspect whether activity unnecessarily prevents hibernation.
- **Evidence:** Separate request, wall-clock duration and storage meters. Use available active-object duration and lifecycle evidence; estimate cost across objects rather than multiplying overlapping requests within the same object as independent durations.
- **Failure:** Show low CPU used to justify negligible cost while objects remain active or ineligible for hibernation, or unbounded creation/activity of objects without a relevant budget.
- **Boundary:** Hibernation-eligible idle objects do not incur duration charges even before actual hibernation. A dormant scheduled alarm is not proof of continuous duration billing; retained storage remains a separate meter. Source: [DO pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/).

### L2-15 — Reduce repeated reads and unnecessary Worker invocations

- **Inspect:** Check polling intervals, hidden tabs, completion/error states, backoff and client count; trace server work per poll. Review shared-result caching, cache keys, cache misses, SSR/middleware and `run_worker_first` routing.
- **Evidence:** Estimate requests and downstream operations from explicit client/time assumptions. Identify assets served directly versus requests that run Worker code; review existing cache behavior evidence.
- **Failure:** Show unnecessary endless polls, per-client recomputation of identical expensive results, or routes assumed free that actually invoke paid code.
- **Boundary:** Client-side backoff reduces normal traffic but does not enforce server quotas. Direct Workers Static Assets requests are free at the baseline; Worker-invoking requests are metered separately. Caching is not guaranteed admission control and must preserve authorization. Source: [Static Assets billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/).

### L2-16 — Bound stored data and storage operations

- **Inspect:** Check upload allowance, object growth, copies, listings, incomplete uploads, retention and storage class for resources actually used. Count list pages and multipart operations; trace background cleanup cost and its own work limits.
- **Evidence:** State admitted bytes/objects, growth assumptions, retained baseline and planned retention. Inspect existing lifecycle configuration without changing or deleting data.
- **Failure:** Show arbitrary storage accumulation or repeated expensive operations while the project budget tracks only compute; distinguish acute runaway operations from gradual storage growth.
- **Boundary:** R2's free egress does not make storage or operations free. Infrequent Access has retrieval and minimum-duration billing; verify current class semantics before suggesting retention changes. Stopping execution does not remove retained-data costs. Source: [R2 pricing](https://developers.cloudflare.com/r2/pricing/).

### L2-17 — Carry bounds into external paid services

- **Inspect:** Check provider-side caps, model/output limits, per-project keys, submitted asynchronous work and fallback providers. Verify any gateway spend limit's scope, pricing coverage, refresh latency and concurrent overshoot.
- **Evidence:** Match each external account and endpoint to a quota/reservation and provider policy. Separate enabled server-side enforcement from a dashboard setting, SDK parameter or future feature assumption.
- **Failure:** Show a fallback, direct API route or asynchronous resubmission bypassing the only budget gate, or Cloudflare CPU/request limits incorrectly treated as a cap on the provider's bill.
- **Boundary:** Use that provider's current official documentation. Do not introduce a gateway solely to satisfy this rule, assume every provider offers a hard cap, or treat estimated gateway spend as an exact cross-provider invoice cap.

### L2-18 — Bound logs and the protection machinery itself

- **Inspect:** Trace logging per item/retry, verbose payloads, sampling, error deduplication, metric writes, audit polls and alert delivery retries. Include observability or notification providers in the cost map.
- **Evidence:** Estimate log/metric/notification volume from the same workload bound; inspect effective sampling and retention settings and any existing evidence that the limit itself stays observable.
- **Failure:** Show a retry or success loop multiplying observability writes without a bound, or a monitor whose retries can become a new paid loop.
- **Boundary:** Keep enough evidence to diagnose stop conditions; do not recommend disabling all logs. An absent custom log cap is not a finding when effective provider limits and expected volume are adequate. Verify the actual observability meter and plan; see [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/).
