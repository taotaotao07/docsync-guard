# DocSync Guard

**Catch stale translated Markdown docs before they merge.**

DocSync Guard is a zero-API-key CLI and GitHub Action for open-source maintainers who keep multilingual Markdown documentation in sync.

It does not translate or rewrite your docs. It reports maintenance risks:

- missing translated sections
- possibly stale source sections
- broken local links
- missing local image paths
- terminology drift

## Quick Start

Create `docsync.yml`:

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

Run locally:

```bash
docsync check --config docsync.yml
docsync check --config docsync.yml --format markdown --output docsync-report.md
docsync check --config docsync.yml --format json --output docsync-report.json
```

Try the included demo from this repository:

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
      - uses: taotaotao07/docsync-guard@v0.1.0
        with:
          config: docsync.yml
```

The action prints a terminal report in the job log and writes a Markdown report to the GitHub Actions step summary. It does not comment on pull requests or fail CI by default.

## Reports

Example reports are available in [examples/basic/reports](./examples/basic/reports):

- [terminal.txt](./examples/basic/reports/terminal.txt)
- [summary.md](./examples/basic/reports/summary.md)
- [report.json](./examples/basic/reports/report.json)

The demo intentionally reports one missing section, one stale section, one broken link, one broken image path, and three terminology drift warnings.

## Section Hash Cache

Stale section checks use an optional committed `.docsync-cache.json` baseline. If the cache file is not present, DocSync Guard skips stale section reporting instead of guessing.

Example:

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

v0.1 reads this cache but does not automatically update or commit it.

## v0.1 Non-Goals

DocSync Guard v0.1 does not use AI, call OpenAI APIs, auto-translate content, rewrite documentation, comment on pull requests, check remote URLs, or block CI by default.

See [SPEC.md](./SPEC.md) for the full v0.1 scope.
