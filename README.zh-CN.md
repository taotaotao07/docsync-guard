# DocSync Guard

**在合并 PR 前发现过期翻译文档。**

DocSync Guard 是一个零 API key 的 CLI 和 GitHub Action，面向维护多语言 Markdown 文档的开源维护者。

它不负责翻译文档。它负责检查维护风险：

- 缺失的翻译章节
- 可能过期的源文档章节
- 损坏的本地链接
- 缺失的图片路径
- 术语漂移

## 当前状态

DocSync Guard 目前处于 v0.1 规划和项目骨架阶段。v0.1 会保持纯规则、低侵入、默认不阻塞 CI。

## 计划中的 CLI

```bash
docsync check
docsync check --config docsync.yml
docsync check --format markdown --output docsync-report.md
docsync check --fail-on broken_links,missing_sections
```

## v0.1 不做什么

DocSync Guard v0.1 不使用 AI、不调用 OpenAI API、不自动翻译、不改写文档，也不默认阻塞 CI。

完整 v0.1 范围见 [SPEC.md](./SPEC.md)。
