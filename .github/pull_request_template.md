## What this PR does

<!-- One or two sentences. Link to the issue if there is one. -->

## Why

<!-- The user-facing problem this solves, or the design rationale. -->

## How to test

<!-- Steps a reviewer can use to verify. -->

## Checks

- [ ] `pnpm verify` passes locally
- [ ] `pnpm e2e` passes locally (or this PR doesn't touch the UI)
- [ ] If new UI text was added, it lives in `src/i18n/messages.ts` and is translated to all three languages
- [ ] If the disk format changed, the migration story is documented
- [ ] If new dependencies were added, bundle size impact was considered
