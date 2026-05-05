# Project: متتبع الميزانية — Design Preferences

## Language & Locale
- **Bilingual: Arabic (RTL) and German (LTR)**, runtime-switchable via the sidebar footer
- Default on first launch: browser-detected (`de-*` → German, otherwise Arabic). Choice persisted in `localStorage['budget-tracker:lang']`
- All UI strings live in the typed dictionary at `src/i18n/messages.ts`. Access them via `useT()` from `src/i18n/LangProvider.tsx` — never hard-code text in JSX
- Seed data (default categories, sample transactions in `src/lib/reducer.ts`) intentionally stays Arabic; German users rename the defaults as needed
- Use Arabic terminology consistent with the Excel file (التبرعات، رسوم العضوية، الإيجار والمرافق، etc.)
- **Numbers in the Arabic UI: English numerals** (1,234.00) — never Arabic-Indic (١٬٢٣٤٫٠٠)
- **Numbers in the German UI: de-DE locale** (1.234,00)
- `src/lib/format.ts` exports `fmt`/`fmtA`/`fmtDate`/`fmtMonth` that all take a `Lang` parameter. `useT()` exposes pre-bound variants (`fmtMoney`/`fmtMoneyAbs`/`fmtDate`/`fmtMonth`) that read the active language automatically
- Arabic currency: `€` + narrow NBSP (U+202F) + number, e.g. `€ 1,234.00`
- German currency: number + narrow NBSP + `€`, e.g. `1.234,00 €`

## Typography
- Arabic: **IBM Plex Sans Arabic** (weights 400, 500, 600, 700)
- German: **IBM Plex Sans** (same weights)
- Both fonts are loaded in `index.html`. CSS variable `--app-font` switches based on `html[data-lang]` (set at document root by LangProvider and by the boot snippet in `src/main.tsx`)
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

## Persistence layer
- Detected at runtime via `isTauri()`:
  - In Tauri window → `@tauri-apps/plugin-fs` writes atomically to `$AppConfig/budget-tracker/data.json`
  - In browser → `localStorage` key `budget-tracker:data`
- Disk format: `{ schemaVersion: 2, history }` — bump `schemaVersion` and extend `parseAndMigrate` in `src/lib/persist.ts` for new migrations. v1 → v2 added `attachments: []` to every transaction.

## Undo-tree
- `src/lib/history.ts` — every mutation creates a snapshot; non-leaf edits create branches
- `restore(id)` is a forward commit (older snapshots are immutable)
- Cap: 200 snapshots; oldest non-root, non-current nodes are dropped first with their
  children re-parented up so the chain stays connected

## Attachments
- Tauri-only feature (browser shows a disabled hint). Files are picked via `@tauri-apps/plugin-dialog`, copied by the Rust `copy_attachment` command into `$AppConfig/budget-tracker/attachments/<attachmentId>.<ext>`, and opened with the system default app via `@tauri-apps/plugin-opener`.
- We never read attachment bytes into JS — no MIME detection, no size cap, no content inspection. The `Attachment` metadata in `data.json` only stores `{ id, filename, ext }`.
- **No GC.** Files on disk are never deleted: removing an attachment from a transaction (or deleting the transaction) leaves the file in place because past undo-tree snapshots may still reference it. A future GC pass tied to snapshot eviction is out of scope.

## Import/Export
- Tauri-only feature (browser shows a disabled hint). Lives in `src/screens/ImportExport.tsx`; serialization in `src/lib/excel.ts` (uses the `xlsx` SheetJS library).
- Format: `.xlsx` workbook with two sheets — `Transactions` (columns: `date`, `type`, `bucket`, `toBucket`, `category`, `description`, `amount`) and `Categories` (columns: `type`, `name`). Headers are stable English identifiers — do not localize them.
- `id` and `attachments` are intentionally **not** round-tripped. Imported transactions get a fresh `crypto.randomUUID()` and `attachments: []`. Attachment binaries are not bundled into the Excel.
- Import validation rejects bad rows (invalid date/type/bucket, non-positive amount, transfer with same bucket on both sides) and surfaces them as a skipped-rows panel — valid rows still go through.
- Importer auto-backfills `cats` from any transaction category that wasn't listed in the Categories sheet, so a transactions-only Excel still produces a consistent view.
- The whole import is a **single undo-tree snapshot** via the `importData` reducer action, so the user can undo it as one step regardless of how many rows were imported.
- File picking uses `@tauri-apps/plugin-dialog` (`save` / `open`); reading + writing the bytes uses `@tauri-apps/plugin-fs` (`readFile` / `writeFile`). Capabilities: `fs:read-files` + `fs:write-files` are granted; the dialog plugin auto-registers the picked path in the runtime fs scope.
