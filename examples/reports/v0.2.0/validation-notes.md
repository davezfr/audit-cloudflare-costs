# 历史验证说明 / Historical validation notes

本文件保存从旧版 `CHANGELOG.md` 移出的过程与验证信息，供查阅历史范围。记录日期为 **2026-10-07**。下列内容描述当时对应版本与样本的记录，未作为 v0.2.1 新审计的验证结论，也不代表当前生产项目受保护。

## v0.2.0 的历史记录

- 当时的技能结构校验通过：frontmatter 仅含 `name`、`description`；四层分别为 8 / 18 / 15 / 10 条，共 51 条；报告固定 8 节，每项优先发现使用 12 个字段。
- 与 v0.1.0 的逐条比较记录为：L1 文件未改；L2 仅 L2-04、L3 仅 L3-06 增补备用入口细节，其余既有规则保留。
- Demo 的 JSON / TOML 与 JavaScript 仅做静态语法检查；没有安装依赖或执行示例代码。15 个审阅文件在当时审计与复核期间字节不变，账户、资源和凭据值均为明显无效的占位符。
- 独立初稿在未看预期答案时完成，识别 8 项预期问题中的 7 项，并提出 2 项额外的有界 Agent 缺口，共 9 项发现。
- 初稿留存并对照预期后，以相同源码和现有 L2-15 定向复核，纠正隐藏标签轮询的漏判。复核后报告共有 10 项发现，包含全部 8 项预期问题及 2 项额外发现；不将这个结果当作独立首轮命中率。
- 复核后报告记录 14 条通过、20 条缺口、17 条待验证、0 条整条不适用；发现严重程度为 4 高、3 中、3 低、0 严重。
- 旧版变更记录另记有静态项目对照：使用简短报告，在确认没有相关 Agent 集成或计划后，将第四层判为不适用。
- 没有连接真实 Cloudflare 账户、调用接管 Agent、执行暂停或恢复、发送合成告警、部署或执行端到端有效性测试。这些记录不证明实际账单封顶，也不是所有模型调用的稳定命中率承诺。

以下历史文件保留当时的证据表、逐项差异及材料标识；两份报告正文未改，对照文档仅修正归档后的预期发现链接：

- [独立初稿](demo-initial-audit.md)
- [复核后完整报告](cloudflare-cost-audit-2026-10-07.md)
- [初稿、终稿与预期发现对照](demo-comparison.md)

归档文件的版本措辞和审计内容按原文保留；对照文档的预期发现相对链接已随目录层级调整。需要从本目录查阅演示项目预期文件时，使用 [当前仓库的预期发现路径](../../demo-runaway/expected-findings.md)。

## v0.1.0 的历史记录

旧版变更记录提到三类历史隔离验证，但未在该记录中逐项展开。本次迁移保留这一事实，不补造验证种类、材料或结果。历史记录只适用于当时对应版本、样本与隔离范围，不能证明当前生产环境的保护状态。

## English

These notes retain process and validation information removed from the previous changelog. They record the historical scope as of **2026-10-07** and make no claim that a new v0.2.1 audit has passed.

The v0.2.0 record describes structural checks, static syntax checks, and a source-only demo audit. The independent initial report found seven of eight expected issues plus two additional findings. A later focused review of the same source corrected the hidden-tab polling miss; the reviewed report contained ten findings. The initial and reviewed reports remain unchanged. The detailed comparison is kept separately; only its relative answer-key link was adjusted after moving it into the historical directory.

No real Cloudflare account, live agent, synthetic alert, pause, resume, deployment, or end-to-end exercise was used. Historical findings and checks do not establish a working production spending cap or guarantee repeatability across model calls. The earlier changelog also mentioned three categories of isolated v0.1.0 validation without enumerating them; this document does not infer missing details.
