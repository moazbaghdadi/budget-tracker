# Project: متتبع الميزانية — Design Preferences

## Language & Locale
- App language: **Arabic (RTL)**
- All UI text must be in Arabic
- Use Arabic terminology consistent with the Excel file (التبرعات، رسوم العضوية، الإيجار والمرافق، etc.)
- **Numbers: always use English numerals** (1,234.00) — never Arabic-Indic (١٬٢٣٤٫٠٠)
- Use `toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` for all currency formatting
- Currency: Euro (€), formatted as `€\u202F` + number (e.g. `€ 1,234.00`)

## Typography
- **Primary font: IBM Plex Sans Arabic** (weights 400, 500, 600, 700)
- Google Fonts import: `https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap`
- CSS: `font-family: 'IBM Plex Sans Arabic', sans-serif;`
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
1. **لوحة التحكم** (Dashboard) — balance hero, monthly/yearly stats, recent transactions, category bar chart (desktop)
2. **المعاملات** (Transactions) — filter tabs, search, table (desktop) or cards (mobile/tablet), add transaction modal
3. **الفئات** (Categories) — manage income & expense categories, side-by-side on tablet/desktop

## App Structure (desktop addition)
4. **السجل** (History) — desktop-only screen showing the undo-tree as a flat-with-branches list; lets the user restore any past version.

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
- Disk format: `{ schemaVersion: 1, history }` — bump `schemaVersion` for migrations

## Undo-tree
- `src/lib/history.ts` — every mutation creates a snapshot; non-leaf edits create branches
- `restore(id)` is a forward commit (older snapshots are immutable)
- Cap: 200 snapshots; oldest non-root, non-current nodes are dropped first with their
  children re-parented up so the chain stays connected
