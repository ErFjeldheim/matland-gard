# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| older   | :x:                |

Only the `main` branch receives security updates. Production runs whatever is currently deployed from `main`.

## Reporting a Vulnerability

Please report security issues privately by emailing **security@matlandgard.no** (or the project owner's public email listed on https://matlandgard.no/om-oss).

Please **do not** open a public GitHub issue for suspected vulnerabilities.

Include:
- A clear description of the issue and its impact
- Steps to reproduce or a proof-of-concept
- Affected commit / branch / version if known

We aim to acknowledge reports within 3 business days and ship a fix or mitigation as soon as practical. Critical issues will be prioritized.

## Disclosure Process

1. Reporter emails the address above.
2. Maintainer acknowledges and triages within 3 business days.
3. Fix is developed privately on a `security/*` branch.
4. Once shipped to production, a public advisory may be published.
5. Reporter is credited (unless they prefer to remain anonymous).
