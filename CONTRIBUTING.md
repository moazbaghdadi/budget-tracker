# Contributing

Thanks for considering a contribution. This is a small project run by a solo maintainer; PRs are welcome but I'm picky about scope creep — see the [Roadmap](README.md#roadmap) for what's on the table.

## Quick start

```sh
pnpm install
pnpm dev          # browser-only mode at http://localhost:1420 (localStorage persistence)
```

For the native window (Tauri): see [README.md § Native desktop app](README.md#native-desktop-app) — it requires the Rust toolchain.

## Before opening a PR

1. **Discuss first.** For anything beyond a typo fix, open an issue describing what you want to change. Code-first PRs for big features risk being closed on scope alone.
2. **Read [CLAUDE.md](CLAUDE.md).** It documents the design preferences (typography, colors, i18n conventions, locale rules) this project optimizes for. Drift from those is the most common reason a PR can't be merged as-is.
3. **Verify locally**:
   ```sh
   pnpm verify   # ESLint + tsc --noEmit + Vitest
   pnpm e2e      # Playwright (requires `pnpm e2e:install` once)
   ```
   Both must be green.
4. **One concern per PR.** Bug fix + unrelated refactor = two PRs.

## Translations

The app currently ships in English, Arabic, and German. Adding a new language is one of the easiest ways to contribute:

- Dictionaries live in `src/i18n/messages.ts`. The Arabic dictionary is the master; all other languages are typed as `Record<keyof typeof ar, string>` so missing keys fail the build.
- Add the new language code to `LANGS`, add the corresponding dictionary, and optionally extend `src/i18n/LangProvider.tsx` if the new language needs locale-specific date/number formatting.

Issues and PRs for new languages are especially welcome.

## Project conventions

- TypeScript strict mode; avoid `any`.
- Inline styles in components; no CSS-in-JS library.
- Never hard-code UI text — route through `useT()`.
- Commit messages are short and imperative. One commit per logical step.
- Tauri code paths must not break the browser-only path (`pnpm dev`).
- All new colors use `oklch()` to stay harmonious with the palette in `CLAUDE.md`.

## Reporting bugs

Use the [Bug report](.github/ISSUE_TEMPLATE/bug_report.yml) issue template. Include the app version, OS, and the steps to reproduce.

## Security

Don't open public issues for security findings — see [SECURITY.md](SECURITY.md).
