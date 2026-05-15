# Security policy

## Reporting a vulnerability

For security issues, **do not open a public GitHub issue**. Use one of:

1. **GitHub Private Vulnerability Reporting** — click [Report a vulnerability](../../security/advisories/new) on the Security tab. This is the preferred channel.
2. **Email** — send to **moaz.baghdadi@codetiquette.com** with the subject prefix `[security]`. PGP-encrypted mail is fine but not required.

You should receive an acknowledgement within 5 business days. If you don't, please re-send.

## Supported versions

Only the latest released version receives security fixes. The app is offline-only today; this policy will be updated when the optional sync server on the roadmap lands.

## In-scope

- Local data corruption or unintended file read/write via the persistence or attachments code paths
- Trust-anchor issues in the auto-update flow (the signed manifest is the verifier)
- Anything in the Tauri Rust shell that could escalate beyond the WebView sandbox

## Out-of-scope

- Issues only reachable by a user with physical access to an unlocked machine
- Third-party dependency issues with no impact in this app's usage of them (please report upstream first)
- Findings that require disabling platform code-signing checks to reproduce
