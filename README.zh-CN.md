# DocSync Guard

**在合并拉取请求前发现过期翻译文档。**

DocSync Guard 是一个零 API key 的 CLI 和 GitHub Action，面向维护多语言 Markdown 文档的开源维护者。

它不负责翻译或改写文档。它负责报告维护风险：

- 缺失的翻译章节
- 可能过期的源文档章节
- 损坏的本地链接
- 缺失的本地图片路径
- 术语漂移

## 快速开始

创建 `docsync.yml`：

```yaml
source: README.md

targets:
  - path: README.zh-CN.md
    language: zh-CN

rules:
  heading_structure: true
  section_hash: true
  links: true
  images: true
  terminology: true

terms:
  workspace:
    zh-CN: 工作区
  pull request:
    zh-CN: 拉取请求
  release:
    zh-CN: 发布
```

本地运行：

```bash
docsync check --config docsync.yml
docsync check --config docsync.yml --format markdown --output docsync-report.md
docsync check --config docsync.yml --format json --output docsync-report.json
```

在本仓库中试跑内置 demo：

```bash
npm install
npm run build
node dist/cli.js check --config examples/basic/docsync.yml --format terminal
```

## GitHub Action

```yaml
name: DocSync Guard

on:
  pull_request:
    paths:
      - "README.md"
      - "README.zh-CN.md"
      - "docs/**"
      - "docsync.yml"

jobs:
  docsync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: taotaotao07/docsync-guard@v0.1.1
        with:
          config: docsync.yml
```

这个 Action 会在 job 日志里打印 terminal report，并把 Markdown report 写入 GitHub Actions step summary。v0.1 不默认评论拉取请求，也不默认阻塞 CI。

## CI 失败模式

DocSync Guard 会把报告和 CI 失败分开处理。默认情况下，它只报告问题，并以成功状态退出。

宽松模式：

```yaml
fail_on:
  missing_sections: false
  outdated_sections: false
  broken_links: false
  terminology_drift: false
  image_path_broken: false
```

对缺失章节和损坏资源启用严格模式：

```yaml
fail_on:
  missing_sections: true
  outdated_sections: false
  broken_links: true
  terminology_drift: false
  image_path_broken: true
```

GitHub Action 覆盖：

```yaml
- uses: taotaotao07/docsync-guard@v0.1.1
  with:
    config: docsync.yml
    fail_on: broken_links,image_path_broken,missing_sections
```

CLI 覆盖：

```bash
docsync check --config docsync.yml --fail-on broken_links,image_path_broken
```

## 报告示例

示例报告位于 [examples/basic/reports](./examples/basic/reports)：

- [terminal.txt](./examples/basic/reports/terminal.txt)
- [summary.md](./examples/basic/reports/summary.md)
- [report.json](./examples/basic/reports/report.json)

这个 demo 会故意报告一个缺失章节、一个可能过期章节、一个损坏链接、一个缺失图片路径和三个术语漂移 warning。

## Section Hash Cache

过期章节检查依赖可选的 `.docsync-cache.json` 基线文件。这个缓存会记录某个已确认同步状态下的源文档章节 hash。之后再次运行时，DocSync Guard 会把当前源文档章节和这个基线对比，并在源文档发生变化时报告 `outdated_section` 风险。

如果缓存文件不存在，DocSync Guard 会跳过 stale section 报告，不会自行猜测。标题、链接、图片和术语检查仍会正常运行。

示例：

```json
{
  "version": 1,
  "sources": {
    "README.md": {
      "sections": {
        "quick-start": "old-hash"
      }
    }
  }
}
```

推荐工作流：

1. 先判断项目是否需要 stale section 风险检查。如果暂时不需要，可以设置 `rules.section_hash: false`。
2. 在源文档和翻译文档已经确认同步后，为需要追踪的源文档章节准备 `.docsync-cache.json` 基线。
3. 检查准备好的 `.docsync-cache.json` 基线。
4. 随文档更新一起提交 `.docsync-cache.json`。
5. 后续源文档发生变化时，stale section warning 会提示哪些源文档章节已经偏离已提交基线。
6. 翻译文档更新完成后，在同一个文档 PR 中刷新并重新提交 cache 基线。

在 v0.1 中，这个缓存是只读的：DocSync Guard 会读取 `.docsync-cache.json`，但不会自动生成、更新或提交它。这样可以保持 CI 低侵入，避免隐藏的仓库改动。在官方 cache 生成命令出现前，请把 cache 更新视为一个明确的维护者步骤。

已知限制：

- Section hash 检查只是基于规则的同步风险信号，不是语义翻译质量检查。
- 提交 cache 前应该人工检查，因为章节重命名或结构调整可能需要新的基线。
- 如果项目还没有可维护的 cache 基线，建议关闭 `rules.section_hash`。
- v0.1 不建议让 CI 自动提交 cache 变化。

小型 demo 基线见 [examples/basic/CACHE.md](./examples/basic/CACHE.md)。

## v0.1 不做什么

DocSync Guard v0.1 不使用 AI、不调用 OpenAI API、不自动翻译、不改写文档、不评论拉取请求、不检查远程 URL，也不默认阻塞 CI。

完整 v0.1 范围见 [SPEC.md](./SPEC.md)。
