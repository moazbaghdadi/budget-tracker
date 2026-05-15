# Project: متتبع الميزانية — Design Preferences

## Language & Locale
- **Trilingual: English (LTR, default), Arabic (RTL), German (LTR)** — runtime-switchable via the sidebar footer (button order: EN, AR, DE — same order as `LANGS` in `src/i18n/messages.ts`)
- Default on first launch: **English**. No browser detection — every fresh install starts in English; the user can switch from the sidebar. Choice persisted in `localStorage['budget-tracker:lang']`
- All UI strings live in the typed dictionary at `src/i18n/messages.ts`. Access them via `useT()` from `src/i18n/LangProvider.tsx` — never hard-code text in JSX. The Arabic dictionary defines the `MessageKey` master; German and English are typed as `Record<keyof typeof ar, string>` so missing keys break the build
- Seed data (default categories, sample transactions in `src/lib/reducer.ts`) intentionally stays Arabic; English/German users rename the defaults as needed
- Use Arabic terminology consistent with the Excel file (التبرعات، رسوم العضوية، الإيجار والمرافق، etc.)
- **Numbers in the English UI: en-US locale** (1,234.00)
- **Numbers in the Arabic UI: English numerals** (1,234.00) — never Arabic-Indic (١٬٢٣٤٫٠٠)
- **Numbers in the German UI: de-DE locale** (1.234,00)
- `src/lib/format.ts` exports `fmt`/`fmtA`/`fmtDate`/`fmtMonth` that all take a `Lang` parameter (default `'en'`). `useT()` exposes pre-bound variants (`fmtMoney`/`fmtMoneyAbs`/`fmtDate`/`fmtMonth`) that read the active language automatically
- English currency: `€` + narrow NBSP (U+202F) + number, e.g. `€ 1,234.00`
- Arabic currency: same as English — `€` + narrow NBSP + number
- German currency: number + narrow NBSP + `€`, e.g. `1.234,00 €`
- English dates: `April 1, 2026` (en-US, month-first); months: `April 2026`
- Arabic dates: `1 أبريل 2026`; German dates: `1. April 2026`

## Typography
- Latin (English, German): **IBM Plex Sans** (weights 400, 500, 600, 700) — the default
- Arabic: **IBM Plex Sans Arabic** (same weights) — applied via `html[data-lang='ar']` override
- Both fonts are loaded in `index.html`. CSS variable `--app-font` defaults to IBM Plex Sans and switches to IBM Plex Sans Arabic only when `html[data-lang='ar']` (set at document root by LangProvider and by the boot snippet in `src/main.tsx`)
- Body font uses `var(--app-font)`; a global `button, input, textarea, select { font-family: inherit }` rule cascades it into form elements. Do NOT set inline `fontFamily` in components
- Minimum font size: 14px for body, 13px for labels/captions

## Color Palette
- **Primary (Teal):** `oklch(42% 0.11 195)` — headers, sidebar, active states
- **Teal dark:** `oklch(32% 0.10 195)` — sidebar background
- **Teal light:** `oklch(93% 0.04 195)` — teal tints, hover backgrounds
- **Income (Green):** `oklch(52% 0.13 155)` / light: `oklch(96% 0.04 155)`
- **Expense (Red):** `oklch(55% 0.14 25)` / light: `oklch(96% 0.04 25)`
- **Background:** `oklch(97% 0.006 200)`
- **Surface:** `#ffffff`
- **Border:** `oklch(90% 0.01 195)`
- **Text:** `oklch(18% 0.01 195)`
- **Text muted:** `oklch(52% 0.02 195)`

## Target Users
- Elderly people and users with low technical knowledge
- Prioritize **large text, large touch targets (min 44px)**, clear labels
- Avoid jargon — use simple, familiar Arabic words
- Always confirm destructive actions (e.g. delete) with `window.confirm()`

## Responsive Breakpoints
| Breakpoint | Layout |
|---|---|
| Mobile `< 640px` | Bottom nav, stacked cards, FAB button, bottom-sheet modals |
| Tablet `640–1100px` | Icon-only sidebar, 2-col cards, centered modals, card list |
| Desktop `> 1100px` | Full labeled sidebar (240px), 4-col stats, data tables, centered modals |

## App Structure (3 screens)
1. **لوحة التحكم** / **Übersicht** (Dashboard) — balance hero, monthly/yearly stats, recent transactions, category bar chart (desktop)
2. **المعاملات** / **Buchungen** (Transactions) — filter tabs, search, table (desktop) or cards (mobile/tablet), add transaction modal
3. **الفئات** / **Kategorien** (Categories) — manage income & expense categories, side-by-side on tablet/desktop

## App Structure (desktop addition)
4. **السجل** / **Verlauf** (History) — desktop-only screen showing the undo-tree as a flat-with-branches list; lets the user restore any past version.
5. **استيراد/تصدير** / **Import/Export** — Tauri-only screen for exporting the current state to an `.xlsx` file and importing one back. Import shows a preview with skipped-row diagnostics, then offers append vs replace; replace gates on `window.confirm()`. The import is a single undo-tree snapshot.

## Tech Stack (desktop app)
- **Tauri 2** wrapper, **React 18 + TypeScript + Vite** UI
- No external component libraries; inline styles match the design prototype
- Persistence: JSON file in OS app-data dir via `@tauri-apps/plugin-fs` (atomic write, key: `data.json`)
- Versioning: undo-tree (`src/lib/history.ts`) stored alongside the data
- Use `oklch()` for all new colors to stay harmonious with the palette

## Workflow
- Run dev (Tauri window): `pnpm tauri dev`
- Run dev (browser only): `pnpm dev`
- Verify after each step: `pnpm verify` = ESLint + tsc + Vitest
- E2E: `pnpm e2e` (Playwright against the web build)
- Build native installers: `pnpm tauri build`
- Always commit per implementation step, with a clear message tied to that step
- **After a successful `git push` to `main`, ask the user whether to also cut a release.** If yes, hand off to the `publish-release` skill (`.claude/skills/publish-release/SKILL.md`). Skip the prompt for non-feature pushes (docs-only, internal tooling, work-in-progress branches).

## Persistence layer
- Detected at runtime via `isTauri()`:
  - In Tauri window → `@tauri-apps/plugin-fs` writes atomically to `$AppConfig/budget-tracker/data.json`
  - In browser → `localStorage` key `budget-tracker:data`
- Disk format (v4): `{ schemaVersion: 4, history, deviceId, serverState? }`.
  - `deviceId` is a per-install UUID generated on first load (or during v3 → v4 migration). It also stamps every new `Snapshot.deviceId` so the sync layer can attribute authorship.
  - `serverState` (optional) holds sync bookkeeping when the user enables sync from Settings. Absent on disk = local-only mode. See `docs/sync-architecture.md` for the full sync design.
- Bump `SCHEMA_VERSION` and extend `parseAndMigrate` in `src/lib/persist.ts` for new migrations. Current migrators: v3 → v4 (generates a `deviceId`). v1 and v2 have no migrator; old data is discarded silently. The v3 → v4 migration leaves pre-v4 snapshots' `deviceId` absent on purpose — the sync layer treats absent `deviceId` as "this device" when reconciling.

## Undo-tree
- `src/lib/history.ts` — every mutation creates a snapshot; non-leaf edits create branches
- `restore(id)` is a forward commit (older snapshots are immutable)
- Cap: 200 snapshots; oldest non-root, non-current nodes are dropped first with their
  children re-parented up so the chain stays connected

## Attachments
- **Tauri desktop only.** Disabled on mobile and in the browser; both render a disabled hint. Mobile is blocked by `@tauri-apps/plugin-dialog` returning content URIs instead of filesystem paths (so the Rust `std::fs::copy` in `copy_attachment` can't consume them) plus `@tauri-apps/plugin-opener` only supporting URLs on mobile. Path A (custom JNI bridge to `ContentResolver` + a FileProvider declaration in `AndroidManifest.xml`) is the v2 unblocker.
- On desktop: files are picked via `@tauri-apps/plugin-dialog`, copied by the Rust `copy_attachment` command into `$AppConfig/budget-tracker/attachments/<attachmentId>.<ext>`, and opened with the system default app via `@tauri-apps/plugin-opener`.
- We never read attachment bytes into JS — no MIME detection, no size cap, no content inspection. The `Attachment` metadata in `data.json` only stores `{ id, filename, ext }`.
- The gate lives in `src/components/AttachmentsList.tsx` (`supported = attachmentsSupported() && bp !== 'mobile'`). Picker UI handles the falsy branch with a disabled hint.
- **No GC.** Files on disk are never deleted: removing an attachment from a transaction (or deleting the transaction) leaves the file in place because past undo-tree snapshots may still reference it. A future GC pass tied to snapshot eviction is out of scope.

## Import/Export
- Tauri-only feature (browser shows a disabled hint). Lives in `src/screens/ImportExport.tsx`; serialization in `src/lib/excel.ts` (uses the `xlsx` SheetJS library).
- Format: `.xlsx` workbook with two sheets — `Transactions` (columns: `date`, `type`, `bucket`, `toBucket`, `category`, `description`, `amount`) and `Categories` (columns: `type`, `name`). Headers are stable English identifiers — do not localize them.
- `id` and `attachments` are intentionally **not** round-tripped. Imported transactions get a fresh `crypto.randomUUID()` and `attachments: []`. Attachment binaries are not bundled into the Excel.
- Import validation rejects bad rows (invalid date/type/bucket, non-positive amount, transfer with same bucket on both sides) and surfaces them as a skipped-rows panel — valid rows still go through.
- Importer auto-backfills `cats` from any transaction category that wasn't listed in the Categories sheet, so a transactions-only Excel still produces a consistent view.
- The whole import is a **single undo-tree snapshot** via the `importData` reducer action, so the user can undo it as one step regardless of how many rows were imported.
- File picking uses `@tauri-apps/plugin-dialog` (`save` / `open`); reading + writing the bytes uses `@tauri-apps/plugin-fs` (`readFile` / `writeFile`). Capabilities: `fs:read-files` + `fs:write-files` are granted; the dialog plugin auto-registers the picked path in the runtime fs scope.

## Auto-update (OTA)
- **macOS + Windows only.** Linux targets (`.deb`/`.rpm`) aren't supported by Tauri's updater; a Linux path would require switching to AppImage and is not yet wired.
- Built on `tauri-plugin-updater` + `tauri-plugin-process`. `src/lib/updater.ts` wraps the JS plugin; `src/components/UpdateModal.tsx` is the install UX; `src/App.tsx` fires a one-shot `check()` on mount.
- The plugin reads a signed manifest at `https://github.com/moazbaghdadi/budget-tracker/releases/latest/download/latest.json`. GitHub's `/releases/latest/...` redirector ignores drafts, so OTA only fires once a release is **promoted from draft to published** — the existing publish-release flow already gates this.
- The manifest is built by the `manifest` job in `.github/workflows/release.yml` (runs after the matrix `build`). It downloads `.sig` files from the just-published draft, assembles `latest.json` (only mac aarch64/x86_64 and Windows NSIS), and uploads it to the same release.
- Signing keypair: private key + password live as GitHub secrets `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. Public key is embedded in `src-tauri/tauri.conf.json` under `plugins.updater.pubkey`. The local copy is at `~/.tauri/budget-tracker.key{,.pub,.password}` — never commit any of these.
- **Losing the signing private key bricks all future auto-updates** (every installed client validates against the embedded public key, so rotating the key would orphan existing installs). Treat it like a code-signing cert.
- `bundle.createUpdaterArtifacts: true` in `tauri.conf.json` is what causes `tauri-action` to produce `.sig` files alongside each installer.

## Mobile targets

Mobile port plan lives at `~/.claude/plans/mobile-port.md`. Phase-0 decisions recorded below; later phases implement them.

### Target platforms
- **Android first.** Buildable from Linux on `ubuntu-latest` CI; $25 one-time Play Console fee.
- **iOS deferred.** Gated on Mac access (physical or `macos-latest` GitHub runner) and Apple Developer enrollment ($99/yr). Treat as a separate optional milestone.

### Minimum OS versions
- **Android: API 26** (Android 8.0, 2017). Tauri's default minimum is API 24 (7.0); API 26 buys an updatable WebView via Play Store with negligible user-base loss.
- **iOS (when iOS lands): 15.4** — required for `oklch()` colors in WKWebView. (Earlier versions would force a palette rewrite.)

### Android applicationId
- Android `applicationId`: **`com.codetiquette.budgettracker`** — publishing under the CodeTiquette developer account on Play Store.
- Desktop identifier (`com.moazbaghdadi.budget-tracker`) stays unchanged in `tauri.conf.json`. Changing it would orphan existing macOS/Linux/Windows installs (the OS treats a new identifier as a different app).
- The two diverging is deliberate. Override the Android `applicationId` per-platform in the Gradle config that `tauri android init` scaffolds; do not touch the top-level `identifier` in `tauri.conf.json`.
- Note: Play Console does **not** require apps in the same developer account to share a reverse-DNS prefix. It only enforces global uniqueness across the store + valid Java package syntax (which the desktop identifier fails because of the hyphen).

### Plugin support matrix (verified May 2026 against v2.tauri.app)
| Plugin | Desktop | Android | iOS | Notes for our usage |
|---|---|---|---|---|
| `plugin-fs` | ✅ | ✅ (sandboxed to app dir) | ✅ (sandboxed; needs `PrivacyInfo.xcprivacy` for `NSPrivacyAccessedAPICategoryFileTimestamp`) | `persist-tauri.ts` only touches `BaseDirectory.AppConfig`, fully supported |
| `plugin-dialog` | ✅ | ⚠️ open() returns **content URIs**, no folder picker | ⚠️ open() returns `file://` URIs, no folder picker | Breaks `attachments.ts` and `excel.ts` (both assume plain paths) |
| `plugin-opener` | ✅ | ⚠️ **URLs only** — no local file open | ⚠️ URLs only | Breaks `openAttachment` on mobile |
| `plugin-process` | ✅ | ❌ | ❌ | `relaunch()` / `exit()` unavailable on mobile |
| `plugin-updater` | ✅ | ❌ | ❌ | Mobile uses store updates |

### v1 feature scope on mobile
| Feature | Desktop | Mobile (v1) | Rationale |
|---|---|---|---|
| Dashboard | ✅ | ✅ | Core feature |
| Transactions | ✅ | ✅ | Core feature |
| Categories | ✅ | ✅ | Core feature |
| Settings (language) | ✅ | ✅ | Verify Arabic RTL on the AVD during Phase 3 |
| History (undo-tree browser) | ✅ | ❌ hide | Already desktop-only by design; small-screen UX cost not worth a v1 port |
| Import/Export `.xlsx` | ✅ | ❌ hide | `dialog.open` returns content URIs that `plugin-fs.readFile` can't consume; xlsx bundle is heavy on mobile cold start |
| Attachments | ✅ | ❌ hide | `dialog.open` → URI mismatch with the Rust `std::fs::copy` command, plus `opener` can't open local files on mobile. Full support would need custom JNI + FileProvider |
| OTA auto-updater | ✅ | ❌ disable | `plugin-updater` is desktop-only; Play Store handles updates |

All mobile-hidden features stay fully functional on desktop. The gating lives in `src/components/nav-items.ts` (`MOBILE_HIDDEN_SCREENS`) and `src/App.tsx` (route guard + `checkForUpdate` skip on mobile). `tauri-plugin-updater` is also Cargo-target-gated to desktop only and its plugin init in `src-tauri/src/lib.rs` is `#[cfg(desktop)]`-wrapped.

### Known mobile-specific risks (carried into later phases)
- `isTauri()` (currently `'__TAURI_INTERNALS__' in window`) is `true` on mobile too, so the Tauri persistence path runs. Good — but anywhere that conflates "Tauri" with "desktop" needs auditing in Phase 5.
- Fonts (IBM Plex Sans + Plex Sans Arabic) load from Google Fonts via `index.html`. The CSP already allows `fonts.googleapis.com` / `fonts.gstatic.com`. On mobile cold-start with no network, fonts fall back to system; acceptable.
- `oklch()` colors require Chrome WebView ≥ 111 (Android) and WKWebView ≥ 15.4 (iOS). Both are above the floors picked above.

## Mobile development (Android)

Scaffolded by `pnpm tauri android init` (Mobile Phase 1). The generated Gradle project lives in `src-tauri/gen/android/`.

### One-time machine setup
- Android SDK at `$ANDROID_HOME` (default `~/Android/Sdk`); `cmdline-tools` installed at `$ANDROID_HOME/cmdline-tools/latest/`.
- NDK r29 (or later) under `$ANDROID_HOME/ndk/`; set `NDK_HOME` to the chosen version dir.
- Rust mobile targets: `rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android`.
- An Android Virtual Device. Existing AVD: `Pixel_7`. Boot from CLI: `$ANDROID_HOME/emulator/emulator -avd Pixel_7`.
- JDK 21 works with Tauri 2.10+; older docs said JDK 17 — disregard.

Persistent shell config (`~/.zshrc`):
```sh
export ANDROID_HOME="$HOME/Android/Sdk"
export NDK_HOME="$ANDROID_HOME/ndk/29.0.14206865"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/emulator"
```

### Workflow
- `pnpm android:dev` — launches the app in a running AVD (boot the emulator first; `adb devices` should list it).
- `pnpm android:build` — produces signed AAB + APK release artifacts under `src-tauri/gen/android/app/build/outputs/`.

### Android specifics
- `applicationId` is `com.codetiquette.budgettracker` (CodeTiquette developer account on Play Store). The desktop identifier `com.moazbaghdadi.budget-tracker` in `tauri.conf.json` stays unchanged.
- `minSdk = 26` (Android 8.0); see § Mobile targets above for the rationale.
- `tauri-plugin-updater` is desktop-only: the Cargo dep is target-gated (`cfg(not(android|ios))`) and the init call in `src-tauri/src/lib.rs` is `#[cfg(desktop)]`-gated. Mobile updates flow through Play Store.
- On-device data path: `/data/user/0/com.codetiquette.budgettracker/budget-tracker/data.json` — under the app's data root, **not** under `files/` (verified on Android via Tauri's `BaseDirectory.AppConfig`). Inspect via `adb shell run-as com.codetiquette.budgettracker ls budget-tracker/`.
- Generated Gradle/Android files in `src-tauri/gen/android/` are committed; the inner `.gitignore` keeps build outputs out.
