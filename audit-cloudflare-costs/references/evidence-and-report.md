# Evidence and report contract

Use this contract in every audit. Translate the report into the user's language.

## Contents

- Verdicts and severity
- Chinese terminology
- Evidence requirements
- Report template
- Fixed finding fields
- Calibration and completion

## Verdicts and severity

Keep verdict, evidence level, and finding severity separate.

| Verdict | Use only when |
| --- | --- |
| PASS | Evidence supports the specific control at the stated scope/evidence level |
| GAP | A relevant control is demonstrably absent or ineffective on an identified path |
| UNKNOWN | Access, deployment mapping, provider semantics, or execution evidence is insufficient |
| NOT_APPLICABLE | Sufficient inventory evidence shows the product/path does not apply |

Use evidence labels SOURCE, DEPLOYED_CONFIG, SUPPLIED_RECORD, TEST_RECORD, and
LIVE_METRICS, with environment/timestamp where relevant. SOURCE PASS does not prove
deployment. Reading a test proves it exists, not that it passed. A supplied export
is not a live readback.

Assign severity only to established findings:

- **Critical:** observed ongoing uncontrolled paid work, or a confirmed immediately
  exploitable unbounded high-cost path with evidence of practical scale.
- **High:** a reachable paid path has repeatable/unbounded amplification or lacks a
  necessary enforceable limit; explain exposure, plan, and prerequisites.
- **Medium:** bounded exposure, late detection, missing operational verification,
  or a weakness with substantial limiting conditions.
- **Low:** modest inefficiency or maintainability issue with limited cost effect.

Do not assign severity from a keyword, an absent optional product, lack of an
account-wide cap alone, or missing cloud credentials. Prioritize UNKNOWN items by
the evidence needed next. If the plan is unknown, make monetary exposure conditional;
distinguish free-quota availability risk from paid-overage risk.

## Chinese terminology

When the user uses Chinese, use these translations and stable values. Use the full
display labels in detailed evidence and verdict fields. In compact prose, tables
and counts, use the Chinese words without repeating parenthesized English codes.
Keep the stable values in the underlying audit record for later templates. Never
put rule IDs, English status codes, product internals or code identifiers in the
plain-language summary, in either report mode.

| Kind | Stable value | Chinese display label |
| --- | --- | --- |
| Layer | L1 | 第一层 账单提醒 |
| Layer | L2 | 第二层 代码限制 |
| Layer | L3 | 第三层 自动暂停 |
| Layer | L4 | 第四层 Agent 接管 |
| Verdict | PASS | 通过（PASS） |
| Verdict | GAP | 缺口（GAP） |
| Verdict | UNKNOWN | 待验证（UNKNOWN） |
| Verdict | NOT_APPLICABLE | 不适用（NOT_APPLICABLE） |
| Evidence | SOURCE | 源码（SOURCE） |
| Evidence | DEPLOYED_CONFIG | 部署配置（DEPLOYED_CONFIG） |
| Evidence | SUPPLIED_RECORD | 提供的记录（SUPPLIED_RECORD） |
| Evidence | TEST_RECORD | 测试记录（TEST_RECORD） |
| Evidence | LIVE_METRICS | 运行指标（LIVE_METRICS） |

Use 严重（Critical）、高（High）、中（Medium）、低（Low） for severity in full reports;
use 严重、高、中、低 in compact cards. Do not change the severity criteria above.
Keep rule IDs and evidence locations exact. Explain necessary technical terms in
full reports; prefer everyday consequences and remedies in compact reports.

## Evidence requirements

For each material finding, capture:

1. Stable finding ID (`F-01`) and related L1/L2/L3/L4 rule IDs.
2. Concrete title describing behavior and consequence.
3. Application, environment, resource, and affected paid dimension.
4. Evidence: path and symbol/line, sanitized configuration, selected-resource
   control-plane output, or bounded metrics with their time window.
5. Execution chain and costly condition; label assumptions.
6. Existing controls and why they do or do not bound this exposure.
7. Minimal remedy, tradeoff, and acceptance evidence still needed.

Trace callers/downstream work far enough to judge protection. Shared middleware
may protect a handler without a local check; `checkBudget` may protect nothing if
called after paid work.

To claim absence, state search scope and inspect likely shared controls and
environment overrides. Use UNKNOWN when missing files may contain the safeguard.
Merge findings with one root cause across several entry points.

Cite current primary documentation for provider facts and project evidence for
project claims. Treat comments/README assertions as statements to verify. Separate
supplied incident accounts from independently checked billing.

Calculate costs only with supported units, prices, applicable included usage,
periods, and workload bounds. Label estimates. Do not treat percentiles as maxima,
invent traffic, allocate shared free usage separately to each project, or treat
sampled metrics as exact accounting.

Redact credentials and customer payloads. If a cited line contains a secret, use
the path/symbol and a redacted description.

A fictional configuration export or demonstration stub is not a live readback,
runtime measurement, or successful test record. Label its simulated provenance and
the conditions under which the illustrated behavior would apply. For planned agent
integrations, distinguish a demonstrable design GAP from implementation, deployment,
and end-to-end evidence that is merely UNKNOWN. Read expected findings and earlier
reports only after independently completing an explicitly requested demo audit.

## Report template

Version 0.2.1 emits Markdown only. Do not generate HTML. Preserve the eight-section
schema and the twelve-field finding record for future template mapping.

### Select a mode without asking

- **Compact is the default**, even with substantial findings or multiple apps.
  A one-line audit request receives the same defaults as a detailed invocation.
- **Full** is selected when the user explicitly asks for a full/detailed report
  (including “完整版” or “详细报告”), or asks to save the report. A host's automatic
  artifact persistence is not itself a user request for a full report.
- Honor a more specific request, such as saving only a compact report, both versions,
  file-only output, or an explicit output filename. Do not print both versions unless
  requested; when both are requested without a chat preference, show compact in chat.
- For one saved report, use `cloudflare-cost-audit-YYYY-MM-DD.md`. When saving both,
  use that name for compact and `cloudflare-cost-audit-YYYY-MM-DD-full.md` for full.
  Use the audit date in the stated timezone and obey the host's file-saving rules.
- Use one evidence record, finding list and complete rule ledger for both modes.
  Condense presentation, never change verdicts, severity, scope or existing controls.
  Keep the full twelve-field information available for a requested full report;
  do not dump it into chat as an unsolicited appendix or a second report.

For Chinese compact reports with findings, target **2,500–4,000 characters** overall.
Allow modest expansion when many distinct findings make it necessary; cut repetition
before expanding, and never silently omit a material finding. With no established
GAP, retain the **1,000–1,600-character** target. For other languages use comparable
reading effort (roughly 1,000–1,600 English words with findings, 500–800 without).
Do not pad a short, complete report to meet a minimum. For a saved demo comparison,
count the full UTF-8-decoded Markdown string, including spaces, newlines, punctuation,
code, Markdown syntax and URL text; report this Unicode-character count, not bytes
or a CJK-only count. Any other readability metric must be separately labeled.

### Fixed headings

Keep the title, eight section names, and their order fixed for the report language.
Do not drop or reorder sections in compact mode; shorten their content instead.

| Order / stable section key | English heading | Chinese heading |
| --- | --- | --- |
| Title | Cloudflare cost-risk audit | Cloudflare 费用风险审计 |
| 1 / summary | 1. Plain-language summary | 1. 给非程序员的摘要 |
| 2 / scope_and_evidence | 2. Scope and evidence | 2. 审计范围与证据 |
| 3 / layer_coverage | 3. Four-layer coverage | 3. 四层覆盖 |
| 4 / billable_paths | 4. Billable-path inventory | 4. 付费路径清单 |
| 5 / findings | 5. Prioritized findings | 5. 优先发现 |
| 6 / unknowns | 6. Unknowns and missing evidence | 6. 待验证项 |
| 7 / rule_disposition | 7. Rule disposition | 7. 规则判定 |
| 8 / next_actions | 8. Next actions | 8. 下一步 |

### Shared writing rules

- Write the first section as **three to five short lines**, preferably five:
  one-sentence conclusion, three plain-language next actions (one per line), and
  the important unverified matters. No rule IDs, English verdicts, product-internal
  terminology or code identifiers. Do not invent three repairs when fewer exist;
  obtaining evidence can be the appropriate next action.
- Write finding titles as **what can happen**, in everyday language, not the name
  of a missing control. For example: “处理完的文件会被当成新文件再处理，产生重复费用” and
  “两个请求同时进来，每天的总额度可能被多用”. Do not claim endless or actual charges when
  an outer limit or missing runtime evidence does not support that claim.
- Write compact remedies plainly: “把结果存到另一个文件夹，并让处理程序跳过结果文件”.
  Put exact APIs, state transitions, atomicity details and acceptance steps in full
  fields. Do not use “退出处理链”“工作单位”“并发重复领取” in a novice summary.
- Put **each shared limitation once in section 2**: source versus deployment,
  fictional/simulated provenance, absent cloud access, conditional billing exposure,
  unknown budget, and the read-only nature of this audit. Do not repeat these as
  boilerplate in findings, inventories, unknowns or the conclusion. A finding-specific
  precondition or a distinct missing record still belongs with that finding.
- Keep evidence labels and exact locations where needed. A repeated SOURCE label
  is structured metadata, not a reason to repeat an evidence disclaimer paragraph.
- Exclude audit-process information from both user report modes: hashes, “独立初稿”,
  “定向复核”, whether an answer key was read, comparison history, and validation logs.
  If requested for a demo, keep it only in a separate document under `examples/reports/`.
- Cite official provider facts **inside the corresponding finding**, with a short
  Markdown link. Use project locations for project facts. Do not front-load a source
  table. Full mode may add a short source list at the end of section 8, without a ninth
  main section. Reuse a source link instead of repeating a documentation explanation.
- Maintain mixed layer outcomes and all applicable paths. When no agent integration
  or plan exists, give the L4 row and L4-01–L4-10 NOT_APPLICABLE with the inventory
  evidence. Do not require an agent or expand the report just because L4 exists.
- Count each rule ID once, using the single verdict recorded for the audited scope
  in the full ledger under the existing verdict definitions. Sections 3 and 7 and
  both report modes must use the same counts: L1 has 8 rules, L2 has 18, L3 has 15,
  and L4 has 10. Separate source/deployment observations remain in evidence and
  explanations; they are not extra rules or extra counts. This is a presentation
  convention, not a new verdict precedence or a claim that a source PASS proves
  deployment. Never change a verdict to force a preferred total.

### Compact mode: section by section

**1. Plain-language summary:** follow the shared three-to-five-line rule. A reader
should understand the main risk and next action before seeing paths or rule IDs.

**2. Scope and evidence:** use **three to five lines** for the project/environment,
audit date/timezone and skill version; source/configuration/records actually read;
missing cloud permissions and latest metric timestamp if any; budget/downtime when
known or unknown; shared limitations and readonly outcome. Identify a planned agent
as planned here. Do not ask the budget question again or recount the interaction.

**3. Four-layer coverage:** one table with **exactly four data rows**, one per layer.
Each row has a one-sentence conclusion and counts of PASS, GAP, UNKNOWN and
NOT_APPLICABLE. In Chinese, use columns `层 | 一句话结论 | 通过 | 缺口 | 待验证 | 不适用`.
Use the exact four Chinese layer names. Do not label a mixed layer simply PASS.

**4. Billable-path inventory:** list **only paths with a GAP or consequential UNKNOWN**,
one line per path. Name the trigger, possible paid effect, and unresolved issue in
plain words. Omit paths fully supported as PASS or NOT_APPLICABLE. When none apply,
say so briefly; this shortened inventory does not mean other paths were skipped.

**5. Prioritized findings:** use a short card for every distinct established finding,
ordered by impact. **No field table.** Keep each card's body at most **250 Chinese
characters** (or comparably brief in another language). Prefer fewer, clearer
sentences over compressed jargon. Include these elements in this order:

1. `F-xx` and a one-line everyday consequence as the heading.
2. Severity and primary layer, using the exact translated layer name.
3. A concise exact code/evidence location; in Chinese label it `位置`.
4. `为什么花钱` — one or two sentences on the costly behavior and meaningful bounds.
5. `怎么修` — one or two sentences giving the smallest understandable remedy.
6. Rule IDs in a visually secondary final line, using Markdown italics, for example
   `*规则：L2-05、L2-07*`. Put any relevant official-source link on this footer or with
   the supported sentence. Do not use HTML to create small text.

A compact card is a presentation of the unchanged twelve-field finding record.
The location and rule footer preserve traceability; execution chains, detailed
controls and acceptance evidence remain in full mode. Do not remove a material
limiting condition merely to make a title or card shorter. With no GAP, write
“本次未发现有证据支持的缺口” and proceed to missing evidence.

**6. Unknowns and missing evidence:** at most **five important items**, each one line
stating the smallest evidence needed. Do not list every cloud feature or repeat the
scope disclaimer. The full ledger must still account for less urgent UNKNOWN rules.

**7. Rule disposition:** **one line per layer** with the four verdict counts, then
list the rule IDs marked GAP for that layer (use “无” when empty). Keep counts in
PASS / GAP / UNKNOWN / NOT_APPLICABLE order with Chinese names in Chinese reports.
Do not print the full rule-by-rule table or hide it in a default appendix.

**8. Next actions:** at most **five items**, in priority order, one sentence each.
Give practical fixes or requests for evidence. Avoid repeating every finding;
group compatible work without losing the most urgent priorities.

### Output check before sending

- Measure the drafted compact report's complete text with a local string-length
  calculation when available; do not run project code or create a report file just
  to count it. If too long, shorten scope metadata, repeated explanations, locations
  and source-link repetition before cutting useful content. Avoid a long appendix
  of absolute source links: use concise project-relative evidence paths, subject to
  the host's link rules. Keep reusable repository reports free of host-only links.
- Read the summary, titles and remedies as instructions for someone who has never
  programmed. In compact prose, replace terms such as 准入、事务、全局计数、受控执行端、
  并发扣减、重复领取 with the observable consequence or action, such as “先扣额度再处理”
  or “两个请求同时进来时，不能都使用最后一份额度”. Exact technical names belong in
  the location line or the full report. Do not compress sentences into denser jargon.
- Check the eight headings, summary length, four coverage rows, card body lengths,
  at most five unknowns and next actions, and identical counts in sections 3 and 7.
  Check that every established finding appears in the compact cards, with the same
  ID, severity and rule association as the full record.
- Remove duplicated shared limitations and audit-process details. Keep substantive
  provider facts linked at their findings, not in an opening source table. Do not
  show this output checklist or its counts as an extra user-report section.

### Full mode: section by section

Use the same headings and summary as compact mode. Preserve all v0.2.0 evidence
and finding semantics, removing duplicate paragraphs and shared qualifications.
Expand established risks and necessary evidence, not lists of absent products.

**2. Scope and evidence:** record project, environment, meaningful revision and audit
 timestamp/timezone; skill version; selected account/resources and exclusions; actual
 evidence sources with provenance/capture times; latest metrics; missing access;
 supplied budget/currency/period/covered fees and downtime preference; and any shared
 limitations once. State the audit's readonly outcome without a process narrative.
 Do not include checksums or review stages. A missing budget leaves thresholds unset.

**3. Four-layer coverage:** keep four rows with observed controls, proven gaps,
 unknowns, evidence levels and verdict counts. Mixed outcomes remain explicit.

**4. Billable-path inventory:** retain a complete inventory of used paths, including
 trigger/environment, paid operations/plan, existing bounds, exact evidence and any
 uncertainty. Include external services actually reached; distinguish planned paths.
 Do not enumerate unused products. Tables are appropriate for path comparisons.

**5. Prioritized findings:** use **all twelve fixed fields below**, in order, for every
 finding. Keep each root cause in one finding and cross-reference it from other
 layers. Include prerequisites, paid dimension, amplification, material existing
 controls, the smallest remedy and its tradeoffs, and acceptance evidence needed.
 Use “unknown” for an unestablished field; do not fill gaps with invented facts.
 A compact paragraph per field is usually sufficient; avoid repeating source text.

**6. Unknowns and missing evidence:** include the complete consequential evidence list:
 rule/question, reason, smallest readonly evidence needed, and unsupported conclusion.
 Never request full API keys. Keep scope-wide caveats in section 2.

**7. Rule disposition:** account for **all 51 rules individually**, including
 NOT_APPLICABLE, with verdict, evidence level/location and a concise reason.
 Separate mixed source/deployment claims. Do not turn a skipped rule into a pass.

**8. Next actions:** order minimal fixes and evidence collection by impact; include
 bounded acceptance criteria or refer to the finding's acceptance field. Proposals
 do not authorize tests, live operations or deployments. Optionally append a short
 official-source list here; do not add another main heading or repeat a large table.

## Fixed finding fields

Retain the following labels, order and meaning in the underlying record for every
finding and render all twelve fields in full mode. Compact mode uses the card
presentation above, without twelve-field tables. Stable keys describe future
template mapping; they do not require JSON or HTML output. In full mode, Markdown
definition-style paragraphs or a two-column field table are both allowed.

| Order | Stable key | English label | Chinese label | Required content |
| --- | --- | --- | --- | --- |
| 1 | id | ID | 编号 | `F-01`, unique within the report |
| 2 | title | Title | 标题 | Concrete behavior and consequence |
| 3 | severity | Severity | 严重程度 | Established Critical/High/Medium/Low using the criteria above |
| 4 | layers | Layer(s) | 所属层 | Primary layer and any related layers using the exact names |
| 5 | rule_ids | Rule IDs | 规则编号 | Applicable stable `L1-xx` to `L4-xx` IDs |
| 6 | verdict | Verdict | 判定 | Verdict for this finding; do not conflate it with evidence strength |
| 7 | evidence_levels | Evidence level(s) | 证据等级 | One or more of the five evidence levels, with provenance |
| 8 | evidence_locations | Evidence location(s) | 证据位置 | Paths and symbols/lines, or sanitized records with environment/version/time |
| 9 | execution_chain | Execution chain | 执行链 | Trigger to paid effect, conditions, failure/amplification, affected cost unit |
| 10 | existing_controls | Existing controls | 现有控制 | Relevant limits and exactly why they do or do not bound this exposure |
| 11 | minimum_fix | Minimum fix | 最小修复 | Smallest proportionate proposal, including material tradeoffs; not an executed change |
| 12 | acceptance_evidence | Acceptance evidence | 验收证据 | Specific existing or pending evidence, isolated checks and expected observations |

Keep the supplied revision and timestamps with observations. Proposed acceptance
steps are not successful test records or permission to execute them. For L4 findings,
refer to L3-11/L3-12/L3-13 for shared permission, verification and recovery defects;
merge one root cause across layers instead of duplicating findings.

## Calibration and completion

- A demonstrated applicable GAP does not require unbounded spending. Preserve a
  proven gap when another control limits its impact, and grade the bounded
  exposure proportionately. For example, terminal/error stops do not establish
  hidden-tab polling control under L2-15, just as an aggregate model-call cap
  does not establish duplicate-alert handling under L4-07. Do not turn a missing
  record or an irrelevant optional optimization into a finding.
- A finite recurring maintenance task is not a runaway-loop finding merely because
  it uses `setAlarm`; inspect cadence, work bounds, purpose, and spend.
- Auth plus per-user limits may leave total project use unbounded. Explain realistic
  prerequisites rather than inventing attacker/account counts.
- A webhook URL is not delivery proof; an `active` name is not evidence every paid
  step checks it; a successful stop response does not prove external work stopped.
- For a static project, do not demand DOs, queues, database counters, or a complex
  watchdog. Report applicable hosting and entry-point controls.
- For projects with no agent integration or plan, do not demand an agent. When one
  is planned, inspect the design and keep future deployment/test evidence UNKNOWN.
- Finish useful inspection even when cloud-state items are UNKNOWN. Summarize that
  limitation once and specify exact missing evidence in section 6.
