# Demo: a small Cloudflare report service

This is a **SYNTHETIC teaching fixture for a source-only audit**. It is not an
application template, a deployable project, a real account export, or evidence of
an incident. Audit the files as the complete source of one fictional project.

Do not install dependencies, build, run a development server, send requests,
connect an account, deploy, or perform the operating procedures in this fixture.
The Wrangler account and resource identifiers are intentionally invalid
`DEMO_*_DO_NOT_USE` values. External addresses use `.example.invalid`. There are
no usable credentials, dependency scripts, deployment workflows, or test results.

## Scenario and scope

The service has one report job and two fixed sets of small R2 objects. An operator
can request a report, while a scheduled producer maintains a separate input for
the object-processing path. A browser displays report status. The application
has an admission switch, a daily work-unit allowance, and an operating procedure.

`planned-agent/` is a proposed operations integration. It is **not imported by
the Worker or registered as a webhook**. Include that design in a Layer 4 review
as planned SOURCE evidence; do not describe it as an installed or active agent.

| Files | What they represent |
| --- | --- |
| `wrangler.toml` | Current fictional source configuration, intentionally nondeployable |
| `src/worker.js` | HTTP routes, scheduled producer, and queue entry point |
| `src/control.js`, `src/export-job.js` | Fixed-identity durable control state and report lifecycle |
| `src/quota.js`, `src/r2-consumer.js` | Shared admission units and object handling |
| `web/` | Small status client; no embedded credentials |
| `config/r2-notifications.synthetic.json` | Fictional notification subscription used by this scenario |
| `evidence/` | Explicitly synthetic scope and historical configuration, not cloud readbacks |
| `ops/pause-runbook.md` | Current fictional pause and owner recovery procedure to inspect |
| `planned-agent/` | Proposed adapter, interface contracts, and credential profile |

Read the source, configuration, and operating procedure before writing your
report. If an `expected-findings.md` answer key is distributed with the exercise,
open it only after completing that report.

## Evidence limits

The provider plan, budget, deployed version, real schedules, real event filters,
alert delivery, current usage, invoices, and end-to-end pause/recovery results
are all **UNKNOWN**. The fixture supplies no live or historical execution
records. A `SYNTHETIC` file describes the exercise and must not be promoted to
`DEPLOYED_CONFIG`, `LIVE_METRICS`, or a successful `TEST_RECORD`.

Use conditional conclusions: explain what the supplied source would do if wired
as the scenario describes. Trace each relevant path to its operations and
controls, distinguish established SOURCE gaps from missing runtime evidence,
and leave money estimates unset. Missing execution evidence for a planned
integration is not, by itself, a failed control.

The allowance counts R2-operation admission units. Its stated purpose is to limit
aggregate application work; it is not a currency budget or a ceiling on Worker,
DO, KV, Queue, storage, monitoring, or fixed subscription charges. Status and
control reads are outside that allowance and should remain visible in the audit.

All object keys, payload bounds, resource identities, and intended pause targets
are explicit so the exercise can be reviewed without executing it.
