# DocSync Guard v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-API-key CLI and GitHub Action that checks multilingual Markdown docs for missing sections, stale source sections, broken local links, broken image paths, and terminology drift.

**Architecture:** The CLI loads `docsync.yml`, parses Markdown into a normalized document model, runs independent rule checkers, then renders terminal, Markdown, or JSON reports. The GitHub Action wraps the CLI, writes a step summary, optionally posts a PR comment, and only fails when configured through `fail_on`.

**Tech Stack:** Node.js, TypeScript, unified/remark for Markdown parsing, yaml for config parsing, commander for CLI flags, Vitest for tests, tsup for builds, GitHub composite or JavaScript action packaging.

---

## File Map

- `package.json`: npm scripts, dependencies, binary declaration.
- `tsconfig.json`: TypeScript compiler settings.
- `src/cli.ts`: command parsing and process exit behavior.
- `src/config.ts`: config loading, defaults, and validation.
- `src/types.ts`: shared config, document, issue, and report types.
- `src/markdown.ts`: Markdown parsing, heading extraction, section splitting, slug generation.
- `src/checks/headings.ts`: missing section detection.
- `src/checks/sectionHash.ts`: source section hash comparison and cache updates.
- `src/checks/links.ts`: local link, anchor, and image checks.
- `src/checks/terms.ts`: terminology drift checks.
- `src/report/terminal.ts`: human local output.
- `src/report/markdown.ts`: PR summary output.
- `src/report/json.ts`: machine-readable output.
- `src/index.ts`: public API for action and future integrations.
- `action.yml`: GitHub Action inputs and runner entrypoint.
- `.github/workflows/demo.yml`: self-test workflow for the demo.
- `examples/basic/`: intentionally imperfect docs and expected report fixture.
- `tests/`: Vitest coverage for config, parsing, checks, reports, and CLI.

## Task 1: Project Tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/index.ts`
- Create: `src/types.ts`

- [ ] Add npm package metadata with binary name `docsync`.
- [ ] Add TypeScript, Vitest, commander, yaml, unified, remark-parse, mdast-util-to-string, and tsup.
- [ ] Add scripts: `build`, `test`, `lint`, `typecheck`, and `dev`.
- [ ] Define shared types for config, targets, rules, issue severity, issue type, and report shape.
- [ ] Run `npm install`.
- [ ] Run `npm test` and confirm the empty test suite/tooling starts cleanly.

## Task 2: Config Loader

**Files:**
- Create: `src/config.ts`
- Create: `tests/config.test.ts`

- [ ] Write tests for loading `docsync.yml`.
- [ ] Write tests for default values when `rules`, `fail_on`, or `report` are missing.
- [ ] Implement YAML loading from a provided path.
- [ ] Validate required fields: `source` and at least one `targets[].path`.
- [ ] Normalize `fail_on` into explicit booleans.
- [ ] Return a useful error when the config file is missing or invalid.
- [ ] Run `npm test -- tests/config.test.ts`.

## Task 3: Markdown Document Model

**Files:**
- Create: `src/markdown.ts`
- Create: `tests/markdown.test.ts`

- [ ] Write tests for extracting headings with depth, text, slug, and line number.
- [ ] Write tests for splitting a Markdown file into sections by heading.
- [ ] Write tests for local link, anchor, and image extraction.
- [ ] Implement Markdown parsing with remark.
- [ ] Implement GitHub-style slug generation for local heading anchors.
- [ ] Run `npm test -- tests/markdown.test.ts`.

## Task 4: Heading Structure Check

**Files:**
- Create: `src/checks/headings.ts`
- Create: `tests/checks/headings.test.ts`

- [ ] Write tests for missing H2 sections.
- [ ] Write tests for missing H3 sections being `info`.
- [ ] Write tests for position-based matching when headings are translated.
- [ ] Implement heading comparison using heading depth and order.
- [ ] Emit `missing_section` issues with configured target path.
- [ ] Run `npm test -- tests/checks/headings.test.ts`.

## Task 5: Link And Image Checks

**Files:**
- Create: `src/checks/links.ts`
- Create: `tests/checks/links.test.ts`

- [ ] Write tests for missing relative file links.
- [ ] Write tests for broken local anchors.
- [ ] Write tests for missing local image paths.
- [ ] Ignore remote `http` and `https` links in v0.1.
- [ ] Resolve relative links from the Markdown file location, not process cwd.
- [ ] Emit `broken_link`, `broken_anchor`, and `broken_image` issues.
- [ ] Run `npm test -- tests/checks/links.test.ts`.

## Task 6: Terminology Check

**Files:**
- Create: `src/checks/terms.ts`
- Create: `tests/checks/terms.test.ts`

- [ ] Write tests for expected target term present.
- [ ] Write tests for expected target term missing when the source term appears.
- [ ] Write tests for common configured drift variants when supported by config.
- [ ] Implement source term scanning and target translation verification.
- [ ] Emit `terminology_drift` issues as warnings by default.
- [ ] Run `npm test -- tests/checks/terms.test.ts`.

## Task 7: Section Hash Cache

**Files:**
- Create: `src/checks/sectionHash.ts`
- Create: `tests/checks/sectionHash.test.ts`

- [ ] Write tests for generating stable hashes from normalized section content.
- [ ] Write tests for detecting changed source sections.
- [ ] Write tests that changed source plus unchanged target emits `outdated_section`.
- [ ] Implement `.docsync-cache.json` read/write.
- [ ] Keep this rule warning-only unless `fail_on.outdated_sections` is true.
- [ ] Run `npm test -- tests/checks/sectionHash.test.ts`.

## Task 8: Report Renderers

**Files:**
- Create: `src/report/terminal.ts`
- Create: `src/report/markdown.ts`
- Create: `src/report/json.ts`
- Create: `tests/report.test.ts`

- [ ] Write tests for summary counts by issue type.
- [ ] Write tests for terminal output containing target sections.
- [ ] Write tests for Markdown table output.
- [ ] Write tests for stable JSON shape matching `SPEC.md`.
- [ ] Implement renderers without color by default for CI readability.
- [ ] Run `npm test -- tests/report.test.ts`.

## Task 9: CLI

**Files:**
- Create: `src/cli.ts`
- Create: `tests/cli.test.ts`

- [ ] Add `docsync check` command.
- [ ] Support `--config`, `--format`, `--output`, `--fail-on`, and `--quiet`.
- [ ] Load config, run enabled checks, render selected report format.
- [ ] Write report output when `--output` is provided.
- [ ] Exit `0` by default even with warnings and errors.
- [ ] Exit `1` only when matching configured `fail_on` issue types exist.
- [ ] Run `npm test -- tests/cli.test.ts`.

## Task 10: GitHub Action

**Files:**
- Create: `action.yml`
- Create: `src/action.ts`
- Create: `.github/workflows/demo.yml`

- [ ] Add inputs: `config`, `format`, `comment`, and `fail_on`.
- [ ] Run the same core checker as the CLI.
- [ ] Write Markdown report to `$GITHUB_STEP_SUMMARY`.
- [ ] Keep PR comments disabled by default.
- [ ] Add optional PR comment only when `comment: true` and token permissions exist.
- [ ] Run the demo workflow locally where possible with a built action entrypoint.

## Task 11: Demo And Release Proof

**Files:**
- Create: `examples/basic/README.md`
- Create: `examples/basic/README.zh-CN.md`
- Create: `examples/basic/docs/setup.md`
- Create: `examples/basic/docsync.yml`
- Create: `examples/basic/expected-report.md`
- Modify: `README.md`
- Modify: `README.zh-CN.md`
- Modify: `CHANGELOG.md`

- [ ] Add a demo source README with Installation, Quick Start, Configuration, and API Reference.
- [ ] Add a translated README missing API Reference.
- [ ] Add one broken local link.
- [ ] Add one terminology drift example.
- [ ] Generate and commit `examples/basic/expected-report.md`.
- [ ] Update README with demo output and Action usage.
- [ ] Tag `v0.1.0` only after CLI, Action, and demo all work.

## Verification

- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Run `node dist/cli.js check --config examples/basic/docsync.yml --format markdown --output examples/basic/docsync-report.md`.
- [ ] Confirm default run exits `0`.
- [ ] Confirm `--fail-on broken_links,missing_sections` exits `1` for the demo.
- [ ] Confirm README examples match actual command behavior.
