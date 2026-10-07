# Layer 1: billing boundaries and alerts

Baseline: 2026-10-07. Verify current official behavior before relying on it. Inspect
existing settings; do not create alerts or send test notifications.

## Contents

- Scope and current plan (L1-01 to L1-03)
- Alerts and detection (L1-04 to L1-06)
- Budget accounting (L1-07 to L1-08)
- Source discipline

## Scope and current plan

### L1-01 — Map deployment, account, and environments

Inspect account IDs, bindings, environments, deployed versions, framework adapters,
and deployment workflows. Map each app to its billed account. Compare source and
deployment metadata where available. Record shared resources and separate preview,
development, and production usage. A proxied domain or dependency alone does not
prove Workers Paid is enabled.

Require actual configuration or account metadata for plan claims. Use UNKNOWN when
mapping/subscriptions cannot be read. Do not inspect unrelated accounts or accept
README statements as proof of current cloud state.

### L1-02 — Separate free-plan hard quotas and paid included usage

Check each product's current plan and after-limit behavior: reject, bypass to another
backend, incur overage, or require upgrade. Identify fixed fees, included usage,
metered units, retained storage, and external services that can still charge.

At baseline, Workers Free has a daily request quota; D1/KV free operations fail at
relevant daily limits, while paid included usage does not stop spend. Reverify
[Workers limits](https://developers.cloudflare.com/workers/platform/limits/),
[D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), and
[KV pricing](https://developers.cloudflare.com/kv/platform/pricing/).
Do not conflate a zone's Free/Pro plan with account developer-product subscriptions.

### L1-03 — Inspect currently available caps and coverage

Discover account-wide and product-level controls available to this account/plan.
Verify enablement, periods, amounts, product exclusions, enforcement delay/tolerance,
residual charges, and affected services. Seeing an option is not enablement proof.

The [2026-10-02 announcement](https://blog.cloudflare.com/enterprise-for-all-update/)
described account hard caps under development. Treat it as history, not a permanent
present-tense fact. An announcement alone leaves actual enforcement UNKNOWN.

For AI Gateway projects, inspect [Spend limits](https://developers.cloudflare.com/ai-gateway/features/spend-limits/)
where applicable: gateway coverage, recognized costs, dimensions, fallback routes,
and direct-provider bypasses. At baseline, costs are estimated and enforcement is
eventually consistent; in-flight concurrency may overshoot. Do not call this a
precise cross-product cap or require adding the product to unrelated projects.

## Alerts and detection

### L1-04 — Verify existing budget policies

Read selected-account policies or supplied exports. Record name, enabled/effective
state, threshold/currency, period, destination, and covered fees. At baseline Budget
alerts combine account-wide metered spend, exclude recurring plan fees, and notify
once per rule per billing cycle. Verify against [Budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/)
and the [default-alert update](https://developers.cloudflare.com/changelog/post/2026-06-15-budget-alerts-default-on/).

Default-on does not prove a suitable policy is active here. Source-only policies,
another account's screenshot, and pending rules are not live protection. If unreadable,
use UNKNOWN, not "no alerts". Account totals require separate project attribution.

### L1-05 — Inspect destination and historical delivery evidence

Check intended owners and available destination/delivery records. Distinguish policy
configured, destination validated, message sent, and receipt/handling observed. A
recipient field does not prove delivery. Do not send a synthetic alert in this audit.

If history is missing, keep delivery UNKNOWN and identify the smallest useful record.
Do not fail unrelated source controls. Prefer a role or redacted destination over
publishing email addresses in the report.

### L1-06 — Compare data freshness with time to damaging spend

Read documented/observed processing timestamps. At baseline budget alerts process
the previous day's usage and fire the following day; reverify with the default-alert
update above. Polling delayed billing data more often does not make it fresher.

Identify detection of high-cost minute/hour-scale failures via execution controls
or runtime metrics. Inspect missing/stale-data behavior. An export proves only its
window; missing data is not zero usage. Cross-reference layer 3. Flag reliance on
delayed mail only when a relevant fast-spend path is established; do not require
high-frequency monitoring for a tiny static site.

## Budget accounting

### L1-07 — Reconcile units, shared allowances, and budget scope

Use the supplied budget or leave amounts unspecified. Establish coverage of fixed
fees, metered Cloudflare usage, retained storage, known taxes, and external providers.
Do not invent taxes/exchange rates. Use actual billing periods, not assumed calendar
months; do not grant every project the same account allowance independently.

Use [Billable Usage](https://developers.cloudflare.com/billing/manage/billable-usage/)
for current scope. When inputs are missing, report measured units and unknown prices
or allowances instead of a dollar total. Base threshold recommendations on explicit
assumptions and headroom for in-flight work, detection delay, and residual costs.

### L1-08 — Check monitoring and audit costs

Inventory used paid logs, traces, polling, exports, monitoring Workers, AI analysis,
storage growth, and external observability. Inspect frequency, window bounds,
sampling, duplicate-error suppression, retention, and retries. Sampled logs are not
an exact ledger. Check [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
when used; pricing can change independently from Worker requests.

Keep the audit low-impact: use control-plane summaries, bounded metric queries, and
source. Do not scan application tables, huge namespaces, or all log payloads merely
to assess costs.

## Source discipline

Use linked official docs for applicable rules, not social billing anecdotes. Record
what was actually checked. Without browsing or account access, distinguish the
dated baseline from present verification and complete source/configuration analysis.
