# Security Policy

## Supported Versions

DocSync Guard is pre-1.0. Security fixes are provided for the latest released version.

| Version | Supported |
| --- | --- |
| Latest release | Yes |
| Older releases | No |

## Reporting a Vulnerability

Please do not open a public issue for a sensitive vulnerability.

Report security concerns by emailing the maintainer listed on the GitHub profile for this project. Include:

- a short description of the issue
- steps to reproduce
- affected files or commands
- any relevant terminal output

If the issue is valid, the maintainer will coordinate a fix and publish release notes after the fix is available.

## Scope

DocSync Guard is a local CLI and GitHub Action. Security reports are most useful when they involve:

- unsafe file handling
- unexpected writes outside the repository
- command execution risks
- untrusted Markdown or config input handling
- GitHub Action behavior that could expose secrets or modify repository state

DocSync Guard v0.1 does not call remote AI APIs, auto-translate content, or auto-commit repository changes.
