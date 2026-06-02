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
      - uses: taotaotao07/docsync-guard@v0.1.1
        with:
          config: docsync.yml
```

The action prints a terminal report in the job log and writes a Markdown report to the GitHub Actions step summary. It does not comment on pull requests or fail CI by default.

## CI Failure Modes

DocSync Guard separates reporting from CI failure. By default, it reports issues and exits successfully.

Relaxed mode:

```yaml
fail_on:
  missing_sections: false
  outdated_sections: false
  broken_links: false
  terminology_drift: false
  image_path_broken: false
```

Strict mode for missing sections and broken resources:

```yaml
fail_on:
  missing_sections: true
  outdated_sections: false
  broken_links: true
  terminology_drift: false
  image_path_broken: true
```

GitHub Action override:

```yaml
- uses: taotaotao07/docsync-guard@v0.1.1
  with:
    config: docsync.yml
    fail_on: broken_links,image_path_broken,missing_sections
```

CLI override:

```bash
docsync check --config docsync.yml --fail-on broken_links,image_path_broken
```

## Reports

Example reports are available in [examples/basic/reports](./examples/basic/reports):

- [terminal.txt](./examples/basic/reports/terminal.txt)
- [summary.md](./examples/basic/reports/summary.md)
- [report.json](./examples/basic/reports/report.json)

The demo intentionally reports one missing section, one stale section, one broken link, one broken image path, and three terminology drift warnings.

## Section Hash Cache

Stale section checks use an optional committed `.docsync-cache.json` baseline. The cache records the source section hashes from a known-good documentation state. On later runs, DocSync Guard compares the current source sections with that baseline and reports `outdated_section` risks when the source changed.

If the cache file is not present, DocSync Guard skips stale section reporting instead of guessing. Heading, link, image, and terminology checks still run normally.

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

Recommended workflow:

1. Decide whether your project needs stale section risk checks. If not, set `rules.section_hash: false`.
2. After source and translated docs are intentionally in sync, prepare a `.docsync-cache.json` baseline for the source sections you want to track.
3. Review the prepared `.docsync-cache.json` baseline.
4. Commit `.docsync-cache.json` with the documentation update.
5. When source docs change later, stale section warnings show which source sections moved away from the committed baseline.
6. After translated docs are updated, refresh and recommit the cache baseline in the same docs PR.

For v0.1, the cache is read-only: DocSync Guard reads `.docsync-cache.json`, but it does not automatically generate, update, or commit the file. This keeps CI low-intrusion and avoids hidden repository changes. Until a first-party cache generation command exists, treat cache updates as an explicit maintainer step.

Known limitations:

- Section hash checks are rule-based sync risk signals, not semantic translation quality checks.
- Cache entries should be reviewed before committing because renamed or reorganized sections may need a fresh baseline.
- Projects without a maintained cache baseline should disable `rules.section_hash`.
- CI should not auto-commit cache changes in v0.1.

See [examples/basic/CACHE.md](./examples/basic/CACHE.md) for a small demo baseline.

## v0.1 Non-Goals

DocSync Guard v0.1 does not use AI, call OpenAI APIs, auto-translate content, rewrite documentation, comment on pull requests, check remote URLs, or block CI by default.

See [SPEC.md](./SPEC.md) for the full v0.1 scope.
