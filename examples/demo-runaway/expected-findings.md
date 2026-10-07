# Expected observations — open after completing the audit

This answer key belongs to the **SYNTHETIC `demo-runaway` source exercise**.
It is not a production audit, an incident account, a deployment export, or a
successful test record. No application code, service, alert, pause, or recovery
operation was run to produce this key; verification was limited to static parsing
and reference checks.

The exercise has six scenario classes and at least eight atomic observations.
An audit may merge observations with a shared cause or choose different finding
IDs, priorities, and severities. It need not reproduce this numbering or invent
a monetary loss. Credit requires the relevant source path, its existing controls,
and a correctly bounded conclusion.

## Evidence and verdict calibration

All established gaps below are **SOURCE gaps**, including the explicitly planned
agent design. Their runtime consequences are conditional on the fictional
application being initialized and wired as described. `plan.json` describes
intended credential permissions; it does not prove a real token or its scopes.

The application begins with admission closed when durable state is missing. Its
pause state is durable; stopping the one known report object clears its future
alarm. The queue has finite message retries and concurrency one. Payload sizes,
input keys, output keys, and DO identities are bounded. A report failure does not
by itself prove an infinite bill, and a recurring Cron or an alarm API call is
not by itself a defect.

Real account plan, deployed source/bindings, actual Cron/event subscriptions,
prices, invoices, usage, notification delivery, and end-to-end action results
remain **UNKNOWN**. The synthetic historical Cron fragment supplies the exercise's
conditional premise; it is not `DEPLOYED_CONFIG` or a genuine historical release
record. Missing execution evidence for the planned agent is not automatically a
GAP. Unused products should not generate mandatory infrastructure findings.

## Expected SOURCE gaps

| Atomic observation | Expected rule mapping | Expected verdict and source evidence |
| --- | --- | --- |
| Report retries are reset during self-rescheduling | **L2-08, L2-10** | **GAP — SOURCE.** `src/export-job.js`: `alarm()` increments `job.retries`, while `scheduleNext()` persists `{ ...job, retries: 0 }` before the next `setAlarm()`. The intended three-attempt one-shot task is stated in `evidence/scenario.json`. |
| The status client keeps its polling schedule when a page is hidden | **L2-15** | **GAP — SOURCE.** `web/status.js` installs a 3,000 ms interval and has no visibility-state handling. Trace `/api/status` through `src/worker.js` to the report DO and its storage reads. |
| The aggregate daily allowance uses a racy read/modify/write | **L2-05, L2-07** | **GAP — SOURCE.** `src/quota.js:reserveWorkUnits()` reads the shared KV value, checks it, and writes the updated number without an atomic reservation. Report, queue, and Cron callers share that key without a common serialized admission authority. |
| Successful R2 output creates another matching input event | **L2-12**, related **L2-08** | **GAP — SOURCE under the supplied synthetic subscription.** `config/r2-notifications.synthetic.json` selects object-create events for `incoming/` plus `.json`. `src/r2-consumer.js` accepts `incoming/DEMO_RESULT.json` and writes that same key after successful processing. |
| The Cron stop procedure comments configuration instead of explicitly removing schedules | **L3-07** | **GAP — SOURCE procedure.** Step 3 of `ops/pause-runbook.md` and the commented block in `wrangler.toml` omit an explicit empty Cron list. `evidence/last-applied-wrangler.synthetic.toml` supplies a fictional previously configured schedule. Actual deployed schedules remain UNKNOWN. |
| The planned agent receives a broad Cloudflare credential directly | **L4-03**, related **L4-02, L3-11** | **GAP — planned SOURCE design.** `planned-agent/plan.json` proposes write permissions across all accessible accounts. `adapter.js` puts `plan.cloudflare_token.value` into the agent's high-priority instruction text. The only value present is an unusable `DEMO_*_DO_NOT_USE` placeholder. |
| The planned agent may reopen app admission without a human recovery decision | **L4-06**, related **L4-02, L3-13** | **GAP — planned SOURCE design.** `createTools()` exposes `resume_project`; a model-selected tool is executed directly and maps to `POST /ops/resume`, which reopens the durable control state. This conflicts with the explicit owner recovery decision in the runbook. |
| Externally supplied alert text becomes high-priority operational instruction text | **L4-04** | **GAP — planned SOURCE design.** `handleDeliveredSignal()` appends `signal.alertText` directly to `systemInstruction`, supplied as `system` to `agent.run()`. A character bound and authentic alert transport do not make the alert body an authorized instruction. |

### 1. Report retry state

Trace: authenticated `POST /api/start` → the fixed report DO → `alarm()` → shared
admission reservation → R2 input read → a transient failure → `scheduleNext()` →
new alarm. On each such application reschedule, the next handler sees zero
retries again; the intended third-attempt terminal branch is not reached by that
chain. A missing report input is one permitted failure condition.

State the outer controls accurately: a sequential, up-to-date allowance can hold
the report after work units run out, and the durable pause can stop it. The
intended per-root retry limit is still ineffective. Do not claim that native
alarm failure retries themselves are unlimited, or that a sleeping alarm is
continuous billable DO duration. Preserve retry/root state and verify a bounded
failure sequence in a separately authorized isolated check as acceptance evidence.

### 2. Hidden-page polling

The client stops on terminal/quota-held states, three successive errors,
`pagehide`, or the explicit stop button; it prevents overlapping requests and
uses a timeout. None of those handles an ordinary hidden tab while the report
still says `running`. Each authorized poll executes the Worker and reads the DO.

The explicit foreground schedule is 20 requests per minute per active watcher
if every timer tick runs; this is arithmetic, not measured traffic. Browser
background throttling and suspension mean that exact rate must not be asserted
for all hidden tabs. The finding is the absence of application visibility handling.
Pause and resume normal polling around visibility changes and verify terminal,
error, navigation, and multiple-client behavior without real traffic.

### 3. Aggregate KV reservation

Two callers can read the same remaining allowance, both pass the check, both
write the same new count, and both proceed. The fixed report DO serializes its
own work and the queue serializes consumer delivery, but neither serializes
admission across the report, queue, and scheduled Worker paths. KV write failures
prevent work in the affected call; that does not establish atomic reservation
when concurrent reads and writes succeed.

The daily counter is a UTC R2-operation allowance. It is not represented as a
currency cap in the fixture, so do not invent a separate finding merely because
it excludes status reads, platform overhead, or invoice-period fees. Verify a
single authoritative reservation and rejection at the last-unit boundary across
the independent callers; do not require a particular database product.

### 4. Successful event loop

Trace: scheduled producer writes `incoming/DEMO_INPUT.json` → matching synthetic
R2 object-create rule → queue consumer → R2 read and successful write to
`incoming/DEMO_RESULT.json` → the same rule → the same successful handler again.
The output is explicitly accepted as input. New successful events are distinct
from a retry of one failed Queue message.

The fixed output key and bounded payload prevent unbounded object-count growth;
the immediate exposure is repeated operations and invocations. Native queue
retry limits and low error rates do not terminate this success cycle. The shared
allowance and pause can interrupt it, with the allowance weakness described
above. Describe this as an unintended cycle with outer controls, not an observed
infinite production loop. Verify an output filter/prefix or a durable root-task
stop condition in isolated acceptance evidence.

### 5. Cron removal

Under the exercise's simulated prior-schedule premise, omitting/commenting the
Cron property is not the explicit schedule-removal action required by L3-07.
The source runbook has a valid readback step; its presence does not repair the
preceding action. It also supplies no result proving that a schedule was removed.

The app gate still rejects downstream work while paused, so distinguish continuing
scheduled invocations/control reads from uncontrolled R2 production during a
successful application pause. The acceptance target is an explicit empty Cron
configuration in the selected environment, authorized application of that change,
authoritative schedule readback, and bounded observations covering propagation
and already-started work. None is executed by the audit.

### 6–8. Planned agent boundaries

The adapter is not reachable from `src/worker.js`; there is no registered webhook,
real agent endpoint, model key, or deployed host. Its design can nevertheless be
reviewed from the proposed call chain: delivered signal → deterministic rule
pause where required → bounded model call with alert text and token in its
system field → chosen query/pause/resume operation → app state readback → a
minimal record.

Keep three distinct causes visible even when merging related permissions findings:
credential possession/scope, autonomous recovery authority, and promotion of
alert data into trusted instructions. Suggested acceptance evidence is a
server-enforced query/pause-only broker with credentials held outside the agent,
an owner-only recovery path, and isolated checks that arbitrary alert text
cannot change the permitted action set. These are desired properties, not a
request to deploy a watchdog or test a live alert.

## Additional observations and grading boundaries

- The adapter performs its fixed rule pause before model admission or invocation.
  An agent timeout cannot prevent that already-attempted action. **L4-05 is not
  an expected GAP merely because a planned agent is present.** Actual rule routing,
  credential availability, and host deployment remain UNKNOWN.
- A durable transaction bounds planned model calls per UTC day. There is one
  model call with no retry, one model-selected operation, and a fixed state
  readback. The proposed host's enforcement is unverified. Do not invent an
  unbounded model/tool loop from the word “agent” (**L4-07**).
- Records retain only a small decision history and distinguish an application
  response/readback from stopped charging. This is SOURCE implementation, not
  proof of delivery, successful pause, or end-to-end acceptance (**L4-08/L4-10**).
  Raw alerts, customer payloads, and prompts are not logged. Sending the intended
  token to the agent also intersects minimization concerns (**L4-09**), but may
  reasonably be merged with the credential finding.
- Queue retries and at-least-once delivery can add bounded repeat operations.
  The consumer makes no exactly-once claim. A reviewer may discuss replay safety
  as an additional observation, but should not confuse it with the separate
  success-event cycle or assign an unsupported independent monetary loss.
- Pausing execution retains small objects and control data. The fixed key and
  object identities bound cardinality in this source scope; no arbitrary upload,
  customer dataset, D1, Workflow, WebSocket, or external rendering API is present.
  Do not require controls for those absent paths.
- A real read-only audit should recheck applicable provider semantics with current
  primary references. This key supplies source expectations and stable rule IDs;
  it does not freeze a provider price, retry default, or capability forever.
