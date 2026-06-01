# Contributing

Thanks for helping improve DocSync Guard.

The v0.1 project rule is simple: keep the tool small, rules-based, and useful in real maintainer workflows.

## Before Opening a PR

- Read [SPEC.md](./SPEC.md).
- Keep v0.1 changes focused on CLI, config, reports, GitHub Action behavior, or demo coverage.
- Do not add AI translation, OpenAI API integration, dashboards, account systems, or automatic documentation rewriting in v0.1.
- Add or update tests for behavior changes.
- Update README examples when command behavior changes.

## Development Principles

- Prefer deterministic checks over semantic guesses.
- Separate issue severity from CI failure.
- Do not fail CI unless the user explicitly configures `fail_on`.
- Keep reports readable for maintainers reviewing pull requests.
