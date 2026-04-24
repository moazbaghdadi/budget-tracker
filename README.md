# متتبع الميزانية — Budget Tracker

Cross-platform desktop budget tracker for small companies. Built with Tauri 2 + React + TypeScript.

- Arabic / RTL UI, designed for elderly and low-tech users.
- Local on-disk persistence (no account, no cloud).
- Built-in **undo-tree versioning**: every change is a snapshot; alternate branches survive editing after undo.
- Runs on Windows, Linux, and macOS.

> Mobile (Android/iOS) and an optional paid sync server are planned for follow-up milestones.

## Quick start

```sh
# install deps
pnpm install

# run in browser (fast iteration; no native window)
pnpm dev

# run as a native desktop app
pnpm tauri dev
```

## Verify

```sh
pnpm verify   # ESLint + tsc --noEmit + Vitest
pnpm e2e      # Playwright (requires `pnpm e2e:install` once)
```

## Build native installers

```sh
pnpm tauri build
```

Produces `.deb`/`.AppImage` on Linux, `.dmg` on macOS, and `.msi`/`.exe` on Windows under `src-tauri/target/release/bundle/`.

## Where is my data?

A single JSON file is written atomically to:

| OS      | Path                                                   |
|---------|--------------------------------------------------------|
| Linux   | `~/.config/budget-tracker/data.json`                   |
| macOS   | `~/Library/Application Support/budget-tracker/data.json` |
| Windows | `%APPDATA%\budget-tracker\data.json`                   |

The file contains the entire undo-tree, so undo/redo and "restore version" survive across restarts.

## Project layout

```
src/
  lib/         pure logic (history, reducer, persist, format)
  components/  reusable UI primitives ported from the design prototype
  screens/     Dashboard, Transactions, Categories, History
  i18n/ar.ts   Arabic strings
src-tauri/     Rust shell (window + filesystem plugin)
e2e/           Playwright tests
```

See [`CLAUDE.md`](./CLAUDE.md) for design preferences (colors, typography, locale rules).
