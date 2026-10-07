# Optional HTML report

Read this only when the user asks for an HTML, web, browser or visual report
(for example “生成 HTML 报告”“网页版报告”“可视化报告”). Markdown remains the default.
The HTML file is a presentation of the same report: same evidence, verdicts,
severity, findings, counts and wording rules as the Markdown report it replaces.

## Contents

- How to produce the file
- Data schema
- Checks before saving

## How to produce the file

1. Finish the audit and draft the report exactly as for Markdown. Use the compact
   report unless the user asked for a full or detailed report.
2. Read `assets/report-template.html` from this skill's directory. Do not modify its
   markup, styles or script. Replace **only** the JSON inside
   `<script id="report-data" type="application/json"> … </script>` with the report data
   described below.
3. Serialize valid JSON (UTF-8). Inside JSON strings, write every `<` as `<`
   so the data block cannot close the script tag. Do not put HTML in any field; the
   template renders all values as plain text.
4. Save the result as `cloudflare-cost-audit-YYYY-MM-DD.html` in the audited project's
   root unless the user named another path or filename. For a requested full report
   alongside a compact one, use `cloudflare-cost-audit-YYYY-MM-DD-full.html` for full.
   This report file is the only file the audit may create; it does not change the
   read-only contract for the project. Follow the host's file-writing rules. If the
   environment cannot write files, say so and return the Markdown report instead.
5. In chat, show the plain-language summary, the finding count by severity and the
   saved file path. Tell the user to open the file in a browser. Do not paste the full
   Markdown report as well unless asked.

The template has no network access, external fonts or scripts. It supports light
and dark mode, phone widths and printing.

## Data schema

Schema id: `audit-cloudflare-costs/report@1`. All text fields are plain strings in the
user's language. Keep compact-mode length and plain-language rules: the same
summary, card titles and remedies you would write in Markdown.

| Key | Type | Section | Content |
| --- | --- | --- | --- |
| `schema` | string | — | `audit-cloudflare-costs/report@1` |
| `lang` | string | — | `zh-CN` or `en`; selects the template's interface labels |
| `mode` | string | — | `compact` or `full` |
| `title` | string | header | `Cloudflare 费用风险审计` / `Cloudflare cost-risk audit` |
| `project` | string | header | Audited application or path |
| `environment` | string | header | Short environment note, e.g. `生产` or `虚构演示项目，未部署` |
| `audit_date` | string | header | `YYYY-MM-DD` |
| `timezone` | string | header | Stated timezone |
| `skill_version` | string | header | Version of this skill |
| `summary` | string[] | 1 | Three to five plain-language lines |
| `scope` | string[] | 2 | Three to five lines: scope, evidence read, missing access, budget, read-only outcome |
| `layers` | object[4] | 3, 7 | Exactly four objects, in layer order (below) |
| `billable_paths` | object[] | 4 | `{ "text", "status" }`; status `GAP` or `UNKNOWN` (`PASS`/`NOT_APPLICABLE` allowed in full mode) |
| `findings` | object[] | 5 | One object per established finding, ordered by impact (below) |
| `unknowns` | object[] | 6 | `{ "item", "evidence_needed" }`; at most five in compact mode |
| `rule_disposition` | object[] | 7 | Full mode only: `{ "rule_id", "verdict", "reason" }` for every rule; empty array in compact mode |
| `next_actions` | string[] | 8 | At most five in compact mode, ordered by impact |

Layer object:

| Key | Content |
| --- | --- |
| `name` | Exact layer name, e.g. `第一层 账单提醒` |
| `conclusion` | One-sentence conclusion |
| `pass`, `gap`, `unknown`, `not_applicable` | Integer rule counts; they must match the rule ledger |
| `gap_rules` | Rule IDs judged GAP in this layer |

Finding object (stable keys from the fixed finding fields):

| Key | Compact mode | Full mode |
| --- | --- | --- |
| `id` | `F-01` | same |
| `title` | One-line everyday consequence | same |
| `severity` | `critical`, `high`, `medium` or `low` | same |
| `layers` | Primary layer first, exact names | same, plus related layers |
| `rule_ids` | Rule IDs | same |
| `verdict` | `GAP` | same |
| `evidence_locations` | Short path:line strings | same |
| `why` | 为什么花钱: one or two sentences | same |
| `fix` | 怎么修: one or two sentences | same |
| `links` | Optional `{ "label", "url" }` to official sources; `https` only | same |
| `evidence_levels` | omit | Evidence levels with provenance |
| `execution_chain` | omit | Execution chain |
| `existing_controls` | omit | Existing controls |
| `minimum_fix` | omit | Minimum fix |
| `acceptance_evidence` | omit | Acceptance evidence |

Full-mode fields appear in a collapsed “technical details” block on each card.

## Checks before saving

- The JSON parses, and the data block is the only part of the template you changed.
- Every established finding from the Markdown draft is present, with the same severity.
- Layer counts add up to 8, 18, 15 and 10 rules (51 in total) and match `gap_rules`.
- No secrets, tokens, customer data or full log payloads appear in any field.
- No field contains HTML, Markdown emphasis or code fences; plain text only.
- `scope` and `billable_paths` use the same plain language as the summary: no evidence-level
  codes, version-control details or internal identifiers; keep those for the full report.
