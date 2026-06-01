# DocSync Guard v0.1 Spec

## 1. Project Identity

Repo name:

```text
docsync-guard
```

CLI name:

```bash
docsync
```

Product name:

```text
DocSync Guard
```

One-liner:

> DocSync Guard helps open-source maintainers catch stale translated Markdown docs before they merge.

Chinese positioning:

> DocSync Guard helps open-source maintainers detect outdated translations, missing sections, broken links, and terminology drift before merging PRs.

## 2. v0.1 Principle

v0.1 is a pure rules-based tool.

It does not use AI.
It does not require an OpenAI API key.
It does not auto-translate content.
It does not rewrite documentation.
It does not block CI by default.

v0.1 only detects and reports documentation sync risks.

## 3. Target User

Primary user:

- Open-source maintainers with multilingual Markdown documentation.

Typical pain:

- English README changed, translated README was not updated.
- New sections were added to source docs but missing in target docs.
- Links or image paths work in source docs but break in translated docs.
- The same term is translated inconsistently.
- Maintainers want a lightweight PR report before merging.

## 4. v0.1 Deliverables

v0.1 must ship exactly these five things:

1. CLI: `docsync check`
2. Config file: `docsync.yml`
3. Reports: terminal, markdown, json
4. GitHub Action: terminal report and GitHub Actions step summary
5. Demo repo or demo folder showing one real check result

## 5. CLI Design

Basic command:

```bash
docsync check
```

With config:

```bash
docsync check --config docsync.yml
```

Output format:

```bash
docsync check --format terminal
docsync check --format markdown
docsync check --format json
```

Output file:

```bash
docsync check --format markdown --output docsync-report.md
docsync check --format json --output docsync-report.json
```

Suggested flags:

```bash
docsync check --config docsync.yml
docsync check --format json
docsync check --output docsync-report.md
docsync check --fail-on broken_links,missing_sections
docsync check --quiet
```

## 6. Config Format

Default config file name:

```text
docsync.yml
```

Example:

```yaml
source: README.md

targets:
  - path: README.zh-CN.md
    language: zh-CN
  - path: README.ja.md
    language: ja

rules:
  heading_structure: true
  section_hash: true
  links: true
  images: true
  terminology: true

terms:
  workspace:
    zh-CN: 工作区
    ja: ワークスペース
  pull request:
    zh-CN: 拉取请求
    ja: プルリクエスト
  release:
    zh-CN: 发布
    ja: リリース

fail_on:
  missing_sections: true
  broken_links: true
  outdated_sections: false
  terminology_drift: false
  image_path_broken: true

report:
  format: markdown
  output: docsync-report.md
```

## 7. Check Rules

### 7.1 Heading Structure Check

Goal:

Detect whether translated Markdown files are missing major source sections.

Input:

- Source Markdown file
- Target Markdown file

Logic:

- Parse Markdown headings.
- Compare heading hierarchy.
- Match headings by normalized text when possible.
- Allow translated headings through section position and optional aliases.
- Report missing or suspiciously unmatched sections.

Severity:

- Missing H1/H2 section: warning by default
- Missing H3+ section: info by default
- Can become CI failure if `fail_on.missing_sections = true`

### 7.2 Section Hash Check

Goal:

Detect whether source sections changed after target sections were last synced.

Logic:

- Split source Markdown into sections.
- Generate a stable hash for each source section.
- Store previous source section hashes in a sync metadata file or embedded report cache.
- On future runs, compare current source section hash with previous known hash.
- If source changed and target did not change, report possible outdated section.

Possible metadata file:

```text
.docsync-cache.json
```

Important limitation:

DocSync Guard v0.1 does not claim semantic staleness. It only reports rule-based sync risk.

### 7.3 Link Check

Goal:

Detect broken Markdown links in source and target docs.

Check:

- Relative file links
- Anchor links
- Local docs links
- Image paths if image rule is enabled

Severity:

- Broken local link: error
- Broken anchor: warning
- Can fail CI if `fail_on.broken_links = true`

v0.1 does not need to check remote HTTP status by default. Remote URL checking can be added later.

### 7.4 Image Path Check

Goal:

Detect missing local images in translated Markdown files.

Severity:

- Missing local image: error
- Can fail CI if `fail_on.image_path_broken = true`

### 7.5 Terminology Check

Goal:

Detect inconsistent translations of important project terms.

Logic:

- Search source terms.
- Check whether configured target translation appears in corresponding target document.
- Detect multiple variants if configured.

Severity:

- Terminology mismatch: warning
- Does not fail CI by default

## 8. Report Types

### 8.1 Terminal Report

Default local output.

```text
DocSync Guard Report

Source:
- README.md

Targets:
- README.zh-CN.md

Summary:
- Sync status: attention needed
- Missing sections: 2
- Outdated sections: 3
- Broken links: 1
- Broken image paths: 0
- Terminology drift: 2
```

### 8.2 Markdown Report

Used for PR summary / PR comment.

```markdown
## DocSync Guard Report

Source: `README.md`
Target: `README.zh-CN.md`

### Summary

| Check | Result |
|---|---:|
| Missing sections | 2 |
| Possibly outdated sections | 3 |
| Broken links | 1 |
| Broken image paths | 0 |
| Terminology drift | 2 |
```

### 8.3 JSON Report

Used for CI and future integrations.

```json
{
  "source": "README.md",
  "targets": [
    {
      "path": "README.zh-CN.md",
      "language": "zh-CN",
      "summary": {
        "missing_sections": 2,
        "outdated_sections": 3,
        "broken_links": 1,
        "broken_images": 0,
        "terminology_drift": 2
      },
      "issues": [
        {
          "type": "missing_section",
          "severity": "warning",
          "section": "Installation"
        },
        {
          "type": "broken_link",
          "severity": "error",
          "path": "./docs/setup.md"
        }
      ]
    }
  ]
}
```

## 9. Warning / Error Policy

DocSync Guard separates issue severity from CI failure.

Issue severity:

- `info`: useful notice
- `warning`: likely maintenance risk
- `error`: objectively broken file/path/link

Default severity:

| Issue type | Default severity |
| --- | --- |
| Missing H1/H2 section | warning |
| Missing H3+ section | info |
| Possibly outdated section | warning |
| Broken local link | error |
| Broken anchor | warning |
| Broken image path | error |
| Terminology drift | warning |

Default CI behavior:

```text
Do not fail CI.
```

CI only fails if configured through `fail_on`.

## 10. GitHub Action Behavior

Action name:

```text
DocSync Guard
```

Default behavior:

- Run check
- Print terminal report
- Write markdown report to GitHub Step Summary
- Do not comment on PR by default
- Do not fail CI by default

Optional CI failure:

```yaml
with:
  fail_on: broken_links,missing_sections
```

## 11. Non-Goals for v0.1

v0.1 will not include:

- AI translation
- OpenAI API integration
- Automatic rewrite of target docs
- Semantic similarity scoring
- Web dashboard
- SaaS account system
- Remote URL checking by default
- Full natural language translation quality evaluation
- Perfect heading alignment across all languages

## 12. v0.2 Candidates

Possible v0.2 features:

1. Optional AI-generated maintainer-friendly PR comment
2. Optional stale section summary
3. Remote URL checking
4. Better heading alias support
5. Monorepo docs discovery
6. GitHub issue auto-generation
7. Release docs sync check
8. Suggested translation TODO comments

v0.2 AI feature principle:

- Optional
- API-key based
- Never required for core checks
- Never auto-overwrites documentation
- Only generates review summaries or suggestions

## 13. Success Criteria for v0.1

v0.1 is successful if it can demonstrate:

- A working CLI
- A working GitHub Action
- A real markdown report
- A JSON output for automation
- A demo showing stale translated docs detection
- Clear README
- Clear CONTRIBUTING guide
- At least one tagged release

Minimum public proof:

```text
v0.1.0 release
README.md
README.zh-CN.md
docsync.yml
GitHub Action demo screenshot
docsync-report.md example
CHANGELOG.md
LICENSE
CONTRIBUTING.md
```

## 14. Recommended First Demo

Create a demo with:

```text
README.md
README.zh-CN.md
docs/setup.md
assets/architecture.png
docsync.yml
```

Expected report:

```text
README.zh-CN.md needs attention.

Missing sections:
- API Reference

Possibly outdated sections:
- Configuration

Broken links:
- ./docs/missing-setup.md

Terminology drift:
- workspace: expected 工作区, found 工作空间
```

## 15. Final v0.1 Definition

DocSync Guard v0.1 is:

> A zero-API-key CLI and GitHub Action that checks multilingual Markdown docs for missing sections, stale source sections, broken links, broken image paths, and terminology drift.

It is not an AI writing tool.

It is a maintainer workflow tool.
