# متتبع الميزانية — Budget Tracker

Cross-platform desktop budget tracker for small companies. Built with Tauri 2 + React + TypeScript.

- Arabic / RTL UI, designed for elderly and low-tech users.
- Local on-disk persistence (no account, no cloud).
- Built-in **undo-tree versioning**: every change is a snapshot; alternate branches survive editing after undo.
- Runs on Windows, Linux, and macOS.

> Mobile (Android/iOS) and an optional paid sync server are planned for follow-up milestones.

---

## Quick start (no native build needed)

The whole UI runs in a browser too — useful for fast iteration, e2e tests, and contributors who don't want to set up the Rust/Tauri toolchain.

```sh
pnpm install
pnpm dev          # opens on http://localhost:1420
```

In browser-only mode the data is persisted to `localStorage` instead of disk. Everything else is identical.

---

## Native desktop app

The native shell is **Tauri 2**. It needs the Rust toolchain plus a few system libraries.

### One-time setup

**Rust** (all OSes, user-space, no sudo):

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

**Linux system deps** (Fedora 41+):

```sh
sudo dnf install -y webkit2gtk4.1-devel gtk3-devel libsoup3-devel \
                    librsvg2-devel openssl-devel patchelf
```

(Other distros and macOS/Windows: see <https://v2.tauri.app/start/prerequisites/>.)

### Run the native window

```sh
pnpm tauri dev
```

### Build native installers

```sh
pnpm tauri build
```

Produces:

| OS      | Artifact                                                      |
|---------|---------------------------------------------------------------|
| Linux   | `src-tauri/target/release/bundle/{deb,rpm}/...`              |
| macOS   | `src-tauri/target/release/bundle/{dmg,app}/...`              |
| Windows | `src-tauri/target/release/bundle/{msi,nsis}/...`             |

To also produce a Linux **AppImage**, install [`linuxdeploy`](https://github.com/linuxdeploy/linuxdeploy) and run `pnpm tauri build --bundles deb,rpm,appimage`.

---

## Verify

```sh
pnpm verify   # ESLint + tsc --noEmit + Vitest (52 unit tests)
pnpm e2e      # Playwright (8 browser e2e tests; needs `pnpm e2e:install` once)
```

Both should be green before opening a PR.

## Where is my data?

A single JSON file is written atomically to:

| OS      | Path                                                       |
|---------|------------------------------------------------------------|
| Linux   | `~/.config/budget-tracker/data.json`                       |
| macOS   | `~/Library/Application Support/budget-tracker/data.json`   |
| Windows | `%APPDATA%\budget-tracker\data.json`                       |

The file contains the entire undo-tree, so undo, redo, and "restore version" survive across restarts.

## Project layout

```
src/
  lib/         pure logic — history (undo-tree), reducer, persist, format
  components/  reusable UI primitives (Sidebar, Card, TxRow, AddTxModal, …)
  screens/     Dashboard, Transactions, Categories, History
src-tauri/     Rust shell + window/fs config
e2e/           Playwright tests (run against the web build)
```

See [`CLAUDE.md`](./CLAUDE.md) for design preferences (colors, typography, locale rules).

## Roadmap

1. **Now** — Desktop (this repo).
2. **Next** — Mobile (Android + iOS), reusing `src/lib/*` and most components via React Native or Capacitor.
3. **Later** — Optional paid sync server for accounts and cross-device backup.
