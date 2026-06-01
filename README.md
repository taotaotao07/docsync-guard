# DocSync Guard

**Catch stale translated Markdown docs before they merge.**

DocSync Guard is a zero-API-key CLI and GitHub Action for open-source maintainers who keep multilingual Markdown documentation in sync.

It does not translate your docs. It checks for maintenance risks:

- missing translated sections
- stale source sections
- broken local links
- missing image paths
- terminology drift

## Status

DocSync Guard is currently in v0.1 planning and scaffold stage. The v0.1 scope is intentionally rules-based, low-intrusion, and non-blocking by default.

## Planned CLI

```bash
docsync check
docsync check --config docsync.yml
docsync check --format markdown --output docsync-report.md
docsync check --fail-on broken_links,missing_sections
```

## Planned GitHub Action

```yaml
- uses: taotaotao07/docsync-guard@v0.1
  with:
    config: docsync.yml
```

The action prints a terminal report in the job log and writes a Markdown report to the GitHub Actions step summary. It does not comment on pull requests or fail CI by default.

## v0.1 Non-Goals

DocSync Guard v0.1 does not use AI, call OpenAI APIs, auto-translate content, rewrite documentation, or block CI by default.

See [SPEC.md](./SPEC.md) for the full v0.1 scope.
