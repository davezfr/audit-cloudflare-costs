# audit-cloudflare-costs

**v0.2.1 · Cloudflare 费用风险只读审计 / Read-only Cloudflare cost-risk audit**

[中文说明](#中文说明) · [English](#english) · [变更记录 / Changelog](CHANGELOG.md) · [MIT License](LICENSE)

## 中文说明

### 三分钟上手

1. **下载并解压本仓库。**
2. **复制完整的 `audit-cloudflare-costs` 文件夹。** Claude Code 放到 `~/.claude/skills/`；Codex CLI 或 IDE 扩展放到 `~/.agents/skills/`。保留文件夹内的全部内容。
3. **在要检查的项目里打开客户端，发送下面这一句话。**

Claude Code：

```text
/audit-cloudflare-costs 帮我检查这个项目的 Cloudflare 费用风险
```

Codex CLI / IDE 扩展：

```text
$audit-cloudflare-costs 帮我检查这个项目的 Cloudflare 费用风险
```

这是客户端对话里的输入。Claude Code 用 `/`，Codex 用 `$`。想先看看效果，可以使用仓库自带的 [demo](#先用-demo-看看效果)。项目级安装、复制命令和长提示见下方进阶章节；安装路径与调用方式按 [Claude Code 官方文档](https://code.claude.com/docs/en/skills) 和 [OpenAI 官方文档](https://learn.chatgpt.com/docs/build-skills) 核对，基准日期为 **2026-10-07**。

`audit-cloudflare-costs` 是给 AI 助手使用的审计指令和检查清单，用于检查已有 Cloudflare 项目的付费路径、费用限制、自动暂停能力，以及已有或明确计划的 Agent 接管方案。

**实测情况。** v0.2.1 已在 Claude Code、Codex 和 ChatGPT 中分别对 demo 项目做过只读审计，三者都找出了预先埋下的 8 个问题。不同模型对严重程度的判断和问题的合并方式会有出入，请以报告中的代码位置和证据为准，严重程度仅供参考。

### 一句话就会采用的默认行为

上面的一句话与进阶长提示使用**同一组默认行为**，无需反复添加限制条件才能得到以下结果：

- **只读审计。** 不修改项目、不安装依赖、不部署、不暂停或恢复服务、不发送通知，不调用业务接口、告警入口或接管 Agent。
- **跟随你的语言。** 中文提问默认用中文回答；你明确指定其他语言时按要求输出。
- **先给摘要。** 报告开头先用三到五行说明结论、优先要做的事和重要待验证项，便于非程序员阅读。
- **预算缺失只问一次。** 在开头询问月预算金额、币种、费用范围，以及能否接受暂时停机；可以回答“跳过”。之后继续检查，不猜预算、阈值或可承受损失。
- **没有云端权限也继续。** 先审查可取得的代码、配置与说明，无法确认的线上状态、价格或历史执行结果列为“待验证”。无需为了开始审计先登录云账户或安装工具。
- **默认返回精简 Markdown。** 先在对话中给出便于阅读和行动的结果；完整报告和文件保存方式见下一节。

安装技能不会自动授予 Cloudflare、外部付费服务或 Agent 的凭据和权限。它提供审计结论和后续建议，不会自动封顶账单、搭建监控或持续盯账单；审计完成也不代表建议已经实施。

### 精简报告、完整报告与保存

| 你的请求 | 输出方式 |
| --- | --- |
| 一句话启动，未指定报告模式 | 在对话中返回精简报告（compact） |
| 明确要求“完整”“详细”或 `full` 报告 | 返回完整报告（full） |
| 要求保存报告，未指定模式 | 保存完整 Markdown 报告 |
| 明确要求保存精简版，或同时保存两版 | 按指定模式保存 |

默认精简版保留固定 **8 个章节**。中文报告有发现时以 **2,500–4,000 字**为目标；未发现缺口时以 **1,000–1,600 字**为目标；发现很多时可适当放宽，不为凑字数制造问题。只有明确要求完整、详细、`full`，或要求保存报告时，才进入完整报告或相应保存流程。

两种模式的章节依次为：**给非程序员的摘要、审计范围与证据、四层覆盖、付费路径清单、优先发现、待验证项、规则判定、下一步**。完整报告展开逐条规则判定与每项优先发现的 12 个字段；格式和证据要求见 [报告规范](audit-cloudflare-costs/references/evidence-and-report.md)。

**精简版改变的是展示篇幅，全部 51 条规则、判定标准、严重程度标准和证据标准都不变。** 两种模式都区分已证明缺口、证据不足、不适用与有效控制，不把代码配置当成线上生效证明，也不把缺数据当成零费用。

保存时使用实际审计日期：单份报告命名为 `cloudflare-cost-audit-YYYY-MM-DD.md`；同时保存两版时，精简版使用这个文件名，完整版使用 `cloudflare-cost-audit-YYYY-MM-DD-full.md`。**v0.2.1 只输出 Markdown，不生成 HTML 报告。**

### 检查什么

共 **51 条规则，分四层**。只检查项目实际使用的资源和已有或明确计划的方案；不适用时说明原因，不为凑齐层级要求新增基础设施。

| 层级 | 规则 | 主要问题 |
| --- | --- | --- |
| 第一层 账单提醒 | L1-01–L1-08，共 8 条 | 谁在付钱、哪些费用计入、提醒是否覆盖正确范围、信息有多及时？ |
| 第二层 代码限制 | L2-01–L2-18，共 18 条 | 请求、批量工作、重试、队列、定时任务、存储和外部 API 是否有实际约束？ |
| 第三层 自动暂停 | L3-01–L3-15，共 15 条 | 已有检测和停止动作能否覆盖新增工作、后台任务和备用入口；停止后还可能产生什么费用？ |
| 第四层 Agent 接管 | L4-01–L4-10，共 10 条 | 已有或计划中的接管是否有明确授权、受限能力、成本约束、验证与恢复边界？只检查方案，不调用 Agent。 |

项目存在自定义域名、`workers.dev`、版本地址或预览环境时，审计分别核对入口、保护范围、配置与可取得的已部署状态。检查步骤和官方资料见 [第二层规则](audit-cloudflare-costs/references/execution-limits.md) 与 [第三层规则](audit-cloudflare-costs/references/pause-readiness.md)。

### 先用 demo 看看效果

`examples/demo-runaway` 是一个虚构、未部署的演示项目。安装技能后，在本仓库根目录打开客户端，就可以只读检查它，无需安装依赖或运行项目。

Claude Code 提示如下；Codex 将开头改为 `$audit-cloudflare-costs`：

```text
/audit-cloudflare-costs 帮我检查 examples/demo-runaway 的 Cloudflare 费用风险。这是虚构、未部署的演示项目，只阅读文件，不安装依赖、构建、运行测试、启动服务、部署、调用 API、触发告警或调用 Agent。本次跳过月预算与停机偏好。报告完成前不要读取 expected-findings.md 或 examples/reports/，没有证据的线上状态与历史执行结果写待验证。
```

这条提示采用默认精简报告。完成后，再对照 [预期发现](examples/demo-runaway/expected-findings.md) 和下列示例，检查证据、规则关联与待验证边界：

- [demo 精简报告](examples/reports/demo-report-compact.md)
- [demo 完整报告](examples/reports/demo-report-full.md)
- [demo 与预期发现对照](examples/reports/demo-comparison.md)

旧版审计材料保存在 [v0.2.0 归档](examples/reports/v0.2.0/)，相关过程与验证范围见 [历史验证说明](examples/reports/v0.2.0/validation-notes.md)。示例文件与报告都不是实际部署、账单或运行效果的证明。

### 仓库结构

| 路径 | 用途 |
| --- | --- |
| `audit-cloudflare-costs/` | 可安装的完整技能文件夹，包含 `SKILL.md`、`references/`、`agents/` 和资源文件 |
| `examples/demo-runaway/` | 供只读审计练习的虚构项目 |
| `examples/reports/` | v0.2.1 精简报告、完整报告与预期发现对照；独立试跑完成后再读 |
| `examples/reports/v0.2.0/` | 保留的 v0.2.0 历史报告、对照和验证说明 |
| `README.md`、`LICENSE`、`CHANGELOG.md` | 仓库说明、许可证与版本记录；不需要复制到技能目录 |

### 进阶：详细安装

以下路径用于本地 Claude Code，以及 Codex CLI / IDE 扩展。复制**完整的 `audit-cloudflare-costs` 文件夹**并保留内部目录，不能只复制 `SKILL.md`。项目级供相应项目使用；用户级供本机该用户的多个项目使用。

| 客户端 | 项目级安装位置 | 用户级安装位置 | 在客户端对话中调用 |
| --- | --- | --- | --- |
| Claude Code | `<项目根目录>/.claude/skills/audit-cloudflare-costs/` | `~/.claude/skills/audit-cloudflare-costs/` | `/audit-cloudflare-costs` |
| Codex CLI / IDE 扩展 | `<项目根目录>/.agents/skills/audit-cloudflare-costs/` | `~/.agents/skills/audit-cloudflare-costs/` | `$audit-cloudflare-costs` |

下载或解压仓库后，在**含本 README 的仓库根目录**打开终端。下面的命令适用于 macOS/Linux 的常见 shell，只做文件复制。默认安装到 Claude Code 的用户级位置；安装 Codex 时把 `.claude` 改为 `.agents`，安装到一个项目时把 `"$HOME"` 改为该项目已存在的绝对路径，例如 `"/Users/me/projects/my-app"`。

```sh
# 用户级保留 "$HOME"；项目级改成已存在的项目绝对路径。
audit_target_root="$HOME"
# Claude Code 使用 .claude；Codex 使用 .agents。
audit_client_dir=".claude"
audit_skill_dest="$audit_target_root/$audit_client_dir/skills/audit-cloudflare-costs"

if [ ! -f "audit-cloudflare-costs/SKILL.md" ]; then
  printf '%s\n' '请先进入本仓库根目录；未复制任何文件。'
elif [ ! -d "$audit_target_root" ]; then
  printf '%s\n' '目标项目目录不存在；请检查 audit_target_root。'
elif [ -e "$audit_skill_dest" ] || [ -L "$audit_skill_dest" ]; then
  printf '%s\n' "目标已存在，未覆盖：$audit_skill_dest"
else
  mkdir -p "$audit_target_root/$audit_client_dir/skills" &&
    cp -R "audit-cloudflare-costs" "$audit_skill_dest"
fi
```

也可以用文件管理器复制到上表路径。已有同名技能时先比较内容并保留备份；上述命令会停止，不覆盖旧版本。选择一种作用域安装，避免无意保留多个同名版本。`/audit-cloudflare-costs` 和 `$audit-cloudflare-costs` 都是聊天输入，不是终端命令。

### 进阶：指定范围与长提示

一句话已经包含默认行为。以下长提示适合需要明确记录项目与环境范围的情况；重申默认项不会改变审计标准或权限。把“当前项目”换成项目路径，必要时说明生产、预览或开发环境。

Claude Code：

```text
/audit-cloudflare-costs 请只读审计当前项目的 Cloudflare 费用风险。先确认项目和环境范围，按“账单提醒、代码限制、自动暂停、Agent 接管”四层检查。不要修改、安装依赖、部署、调用业务接口、触发告警或调用接管 Agent。没有云权限就继续审代码，把无法确认的线上状态列为待验证。预算如果缺失只问一次，我可以跳过。请用中文输出默认精简 Markdown 报告，并先给面向非程序员的三到五行摘要（结论、优先要做的事、重要待验证项）。
```

Codex CLI / IDE 扩展：

```text
$audit-cloudflare-costs 请只读审计当前项目的 Cloudflare 费用风险。先确认项目和环境范围，按“账单提醒、代码限制、自动暂停、Agent 接管”四层检查。不要修改、安装依赖、部署、调用业务接口、触发告警或调用接管 Agent。没有云权限就继续审代码，把无法确认的线上状态列为待验证。预算如果缺失只问一次，我可以跳过。请用中文输出默认精简 Markdown 报告，并先给面向非程序员的三到五行摘要（结论、优先要做的事、重要待验证项）。
```

需要展开或保存时，在一句话或长提示后加上“输出完整报告”“请保存报告”，或“同时保存精简版和完整版”。报告模式只影响展示与保存，不改变 51 条规则及其审计标准。

### 官方来源与资料基准

资料基准为 **2026-10-07**。安装路径和调用语法已按以下官方页面核对：

- [Claude Code：Extend Claude with skills](https://code.claude.com/docs/en/skills) — 本地用户级 / 项目级技能路径，以及 `/skill-name` 调用方式。
- [OpenAI：Build skills](https://learn.chatgpt.com/docs/build-skills) — Codex 的 `.agents/skills` 本地发现路径，以及 CLI / IDE 扩展中的 `$` 技能引用方式；原 [Codex skills 地址](https://developers.openai.com/codex/skills/)目前重定向到此页。

Cloudflare 和其他厂商的价格、限制、权限和产品行为会变化，每次审计都应重新核对影响结论的当前官方资料；基准日期不代表这些事实永久有效。

本项目采用 [MIT License](LICENSE)。

## English

### Start in three minutes

1. **Download and extract this repository.**
2. **Copy the complete `audit-cloudflare-costs` folder** into `~/.claude/skills/` for Claude Code, or `~/.agents/skills/` for Codex CLI or the IDE extension. Keep all files inside the folder.
3. **Open your client in the project you want to inspect and send one line.**

Claude Code:

```text
/audit-cloudflare-costs Help me check this project's Cloudflare cost risks
```

Codex CLI / IDE extension:

```text
$audit-cloudflare-costs Help me check this project's Cloudflare cost risks
```

These are conversation inputs: Claude Code uses `/`; Codex uses `$`. To see the workflow first, use the included [demo](#try-the-demo). Detailed installation and longer prompts appear in the advanced sections. The local paths and invocation syntax were checked against the [Claude Code documentation](https://code.claude.com/docs/en/skills) and [OpenAI documentation](https://learn.chatgpt.com/docs/build-skills), with a reference baseline of **2026-10-07**.

`audit-cloudflare-costs` is an instruction and checklist package for an AI assistant to inspect an existing Cloudflare project's billable paths, cost limits, automatic pause mechanisms, and existing or explicitly planned agent takeover arrangements.

**Tested.** v0.2.1 was run read-only against the demo in Claude Code, Codex, and ChatGPT; all three found the 8 seeded issues. Models may differ in severity and in how they group findings, so rely on the cited code locations and evidence; treat severity as guidance.

### Defaults that already apply to the one-line prompt

The one-line and advanced prompts use **the same defaults**:

- **Read-only audit.** No project edits, dependency installation, deployment, service pause or resume, notifications, business endpoint calls, alert triggers, or takeover agent calls.
- **Your language.** Answer in the language you use unless you request another language.
- **Summary first.** Open with three to five lines stating the conclusion, priority actions, and important unknowns for readers who do not program.
- **Ask about a missing budget once.** Ask at the start for the monthly amount, currency, cost coverage, and tolerance for temporary downtime. You may skip. Continue without invented budgets, thresholds, or acceptable losses.
- **Continue without cloud access.** Inspect available source, configuration, and documentation. Mark unsupported deployed state, current prices, and historical execution claims as unknown. Starting the audit does not require cloud login or additional tools.
- **Compact Markdown by default.** Return a readable, actionable report in the conversation. Full reports and file saving follow the choices below.

Installing the skill does not grant credentials or permissions for Cloudflare, external paid services, or an agent. The skill provides findings and follow-up recommendations. It does not cap the bill, install monitoring, or keep watching the account, and completing an audit does not implement its recommendations.

### Compact reports, full reports, and saving

| Request | Output |
| --- | --- |
| One-line invocation without a report mode | Compact report in the conversation |
| Explicit request for a full or detailed report | Full report |
| Request to save the report without specifying a mode | Saved full Markdown report |
| Explicit request to save compact, or to save both | Save the requested mode or modes |

The compact report retains **eight fixed sections**. Reports written in Chinese target **2,500–4,000 characters** when findings are present, or **1,000–1,600** when no gaps are found. Do not invent issues to fill the length target. Use the full report or a saving workflow only when explicitly asked for a full/detailed report or for a saved report.

Both modes use these sections: **non-programmer summary; scope and evidence; four-layer coverage; billable paths; prioritized findings; unknowns; rule judgments; next steps**. The full report expands every rule judgment and the twelve fields of each prioritized finding. See the [report specification](audit-cloudflare-costs/references/evidence-and-report.md).

**Compact mode changes presentation length; all 51 rules, judgment standards, severity standards, and evidence standards remain unchanged.** Both modes distinguish demonstrated gaps, unknowns, not-applicable rules, and effective controls. Repository configuration is not proof of deployment, and missing data is not zero usage.

Use the actual audit date when saving. A single report is named `cloudflare-cost-audit-YYYY-MM-DD.md`. When saving both modes, compact uses that name and full uses `cloudflare-cost-audit-YYYY-MM-DD-full.md`. **Version 0.2.1 produces Markdown only, with no HTML report.**

### Coverage

There are **51 rules across four layers**. Apply them to resources actually used and to existing or explicitly planned arrangements. Explain why a rule is not applicable; do not require new infrastructure just to fill a layer.

| Layer | Rules | Main question |
| --- | --- | --- |
| 第一层 账单提醒 — Billing alerts | L1-01–L1-08; 8 rules | Which account pays, what is measured, and how timely and complete are alerts? |
| 第二层 代码限制 — Code limits | L2-01–L2-18; 18 rules | Are requests, fan-out, retries, background work, storage, and paid APIs bounded? |
| 第三层 自动暂停 — Automatic pause | L3-01–L3-15; 15 rules | Can the existing stop mechanism reach relevant paths, and what spending remains afterward? |
| 第四层 Agent 接管 — Agent takeover | L4-01–L4-10; 10 rules | Does an existing or planned arrangement have clear authority, restricted capabilities, cost bounds, verification, and recovery? The audit does not call the agent. |

Where present, custom domains, `workers.dev`, version URLs, and preview environments are reviewed separately for entry points, protection scope, configuration, and available deployed-state evidence. See the sourced [execution](audit-cloudflare-costs/references/execution-limits.md) and [pause](audit-cloudflare-costs/references/pause-readiness.md) checklists.

### Try the demo

`examples/demo-runaway` is a fictional, undeployed teaching project. After installing the skill, open your client in the repository root and inspect its files without installing dependencies or running the project.

For Codex CLI / IDE extension:

```text
$audit-cloudflare-costs Help me check the Cloudflare cost risks in examples/demo-runaway. This is a fictional, undeployed teaching project. Read files only; do not install, build, test, start services, deploy, invoke APIs, trigger alerts, or call an agent. Skip monthly budget and downtime preferences for this audit. Do not read expected-findings.md or examples/reports/ until the report is complete. Mark unsupported live state and historical execution claims as unknown.
```

For Claude Code, replace `$audit-cloudflare-costs` with `/audit-cloudflare-costs`. This prompt uses compact mode. Complete your audit before consulting the [expected findings](examples/demo-runaway/expected-findings.md) or these examples:

- [Compact demo report](examples/reports/demo-report-compact.md)
- [Full demo report](examples/reports/demo-report-full.md)
- [Demo comparison with expected findings](examples/reports/demo-comparison.md)

Previous audit materials are retained in the [v0.2.0 archive](examples/reports/v0.2.0/), with process details and validation scope in [historical validation notes](examples/reports/v0.2.0/validation-notes.md). Fixtures and reports are not deployment, billing, or runtime-effectiveness evidence.

### Repository layout

| Path | Purpose |
| --- | --- |
| `audit-cloudflare-costs/` | Complete installable skill, including `SKILL.md`, references, agent metadata, and assets |
| `examples/demo-runaway/` | Fictional project for a source-only audit exercise |
| `examples/reports/` | v0.2.1 compact report, full report, and comparison; read after your own independent audit |
| `examples/reports/v0.2.0/` | Retained v0.2.0 reports, comparison, and validation notes |
| `README.md`, `LICENSE`, `CHANGELOG.md` | Repository documentation; keep these outside the installed skill folder |

### Advanced: detailed installation

Copy the **entire `audit-cloudflare-costs` folder**, preserving its internal directories. These locations are for local Claude Code and for Codex CLI / IDE extension. Project scope serves the corresponding project; user scope serves multiple projects for that user on the machine.

| Client | Project location | User location | Invoke in the client conversation |
| --- | --- | --- | --- |
| Claude Code | `<project-root>/.claude/skills/audit-cloudflare-costs/` | `~/.claude/skills/audit-cloudflare-costs/` | `/audit-cloudflare-costs` |
| Codex CLI / IDE extension | `<project-root>/.agents/skills/audit-cloudflare-costs/` | `~/.agents/skills/audit-cloudflare-costs/` | `$audit-cloudflare-costs` |

After downloading or extracting the repository, open a terminal in the **repository root containing this README**. These macOS/Linux shell commands only copy files. They default to a user-level Claude Code installation. For Codex, change `.claude` to `.agents`; for project scope, replace `"$HOME"` with the absolute path to an existing project.

```sh
audit_target_root="$HOME"
audit_client_dir=".claude"
audit_skill_dest="$audit_target_root/$audit_client_dir/skills/audit-cloudflare-costs"

if [ ! -f "audit-cloudflare-costs/SKILL.md" ]; then
  printf '%s\n' 'Open the repository root first; no files were copied.'
elif [ ! -d "$audit_target_root" ]; then
  printf '%s\n' 'The target project directory does not exist; check audit_target_root.'
elif [ -e "$audit_skill_dest" ] || [ -L "$audit_skill_dest" ]; then
  printf '%s\n' "Destination already exists; not overwritten: $audit_skill_dest"
else
  mkdir -p "$audit_target_root/$audit_client_dir/skills" &&
    cp -R "audit-cloudflare-costs" "$audit_skill_dest"
fi
```

A file manager works too. If the destination already exists, compare it and keep a backup before deciding how to update; these commands leave it untouched. Choose one scope to avoid unintended duplicate versions. Invoke `/audit-cloudflare-costs` or `$audit-cloudflare-costs` in the client conversation, not in the shell.

### Advanced: scope and longer prompts

The one-line prompt already applies the defaults. Use a longer prompt when you want to record the intended project and environment explicitly. Replace “this project” with a path, and specify production, preview, or development when relevant.

```text
$audit-cloudflare-costs Audit this project's Cloudflare cost risks in read-only mode. Confirm the project and environment scope. Review billing alerts, code limits, automatic pause, and any existing or planned agent takeover. Do not edit, install dependencies, deploy, invoke business APIs, trigger alerts, or call the takeover agent. Continue from source if cloud access is unavailable and mark unsupported live state as unknown. Ask about a missing budget at most once; I may skip. Return the default compact Markdown report in English, with a three-to-five-line summary covering the conclusion, priority actions, and important unknowns for a non-programmer.
```

For Claude Code, replace `$audit-cloudflare-costs` with `/audit-cloudflare-costs`. Repeating defaults does not change the audit standards or permissions. Append “return the full report,” “save the report,” or “save both compact and full reports” when needed. Report mode changes presentation and saving, while retaining all 51 rules and their standards.

### Official sources and reference date

The reference baseline is **2026-10-07**. Local installation paths and invocation syntax were checked against these official sources:

- [Claude Code: Extend Claude with skills](https://code.claude.com/docs/en/skills) — Local personal/project skill paths and `/skill-name` invocation.
- [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills) — Codex discovery under `.agents/skills` and `$` skill mentions in CLI / IDE extension. The earlier [Codex skills URL](https://developers.openai.com/codex/skills/) currently redirects to this page.

Recheck current official documentation for consequential provider facts during every audit, including prices, limits, permissions, and product behavior. The reference date is not a permanent guarantee.

Released under the [MIT License](LICENSE).
