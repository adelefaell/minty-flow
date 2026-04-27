# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Minty Flow is a local-first personal finance React Native app built with Expo SDK 55 (New Architecture enabled). Targets Android & iOS (portrait only). Uses pnpm as package manager. No testing framework is set up.

## Commands

```bash
pnpm android          # Run on Android emulator/device (dev build)
pnpm ios              # Run on iOS simulator/device (dev build, macOS only)
pnpm prebuild         # Generate ios/ and android/ native projects (required first time or after native dep changes)
pnpm lint             # Biome check
pnpm lint:fix         # Biome check + auto-fix
pnpm types            # tsc --noEmit (type check only)
pnpm structure        # Regenerate docs/STRUCTURE.md
pnpm unused-styles    # Find unused unistyles StyleSheets
pnpm check-i18n-keys  # Find missing i18n translation keys
```

**Important:** Native modules (WatermelonDB, MMKV) require a dev build — `pnpm start` with Expo Go will not work.

**Pre-commit hook** (`husky`): automatically runs `pnpm structure`, `pnpm lint:fix` (and git-stages fixes), then `pnpm types`. All three must pass.

## Comment Conventions

Use these prefixes for inline comments — they communicate intent and urgency at a glance:

```ts
// BUG   — known defect that exists right now; describe what breaks
// FIXME — broken code that must be fixed before shipping
// HACK  — intentional workaround; explain why a clean fix isn't possible yet
// XXX   — dangerous or confusing code; flag for closer review
// TODO  — future work that isn't urgent; keep actionable and brief
// [ ]   — checklist item not yet done (use in multi-step comment blocks)
// [x]   — checklist item completed
```

Only write a comment when the **why** is non-obvious. Do not comment on what the code does — well-named identifiers handle that. Never reference the task, PR, or caller in a comment.

## Code Style

- TypeScript strict mode — no `any`
- `const` over `let`; prefer immutability
- Early returns; keep functions under ~50 lines
- `Promise.all` for parallel async calls
- No `console.*` — use `src/utils/logger.ts`
- Biome enforces import order: packages → blank line → `~/` aliases → blank line → relative paths
- Semicolons: as-needed (Biome managed)
- All styles use `StyleSheet.create((t) => ...)` callback form — never plain `StyleSheet.create({})`
- Co-located style files named `*.styles.ts`

## Architecture

### Navigation (Expo Router v3)

File-based routing under `src/app/`. The `~/` path alias maps to `src/`.

- **4 tabs**: Home, Stats, Accounts, Settings — driven by a custom `PagerView`-based tab layout (`src/app/(tabs)/_layout.tsx`), **not** `@react-navigation/bottom-tabs`
- **FAB** in the tab bar expands to income / expense / transfer options
- Transaction form lives at `src/app/transaction/[id].tsx` as a `fullScreenModal`; `id="new"` means create, otherwise edit
- `NewEnum.NEW = "new"` sentinel (`src/types/new.ts`) is used throughout for create-vs-edit route params

Root providers (in order): `KeyboardProvider` → `GestureHandlerRootView` (keyed by RTL state) → `TooltipProvider` → `Stack`. `AppLockGate` and `ToastManager` render outside the Stack.

### Screen / Route Map

```
src/app/
├── (tabs)/
│   ├── index.tsx              # Home
│   ├── stats-view.tsx         # Stats
│   └── _layout.tsx            # Custom PagerView tab layout
├── transaction/[id].tsx       # Create / edit (fullScreenModal; id="new" = create)
├── onboarding/                # Welcome → accounts → categories setup flow
├── settings/
│   ├── index.tsx
│   ├── edit-profile.tsx
│   ├── all-accounts.tsx
│   ├── pending-transactions.tsx
│   ├── trash.tsx
│   ├── preferences/           # 14 preference screens (theme, language, money-formatting, privacy, reminder, button-placement, transaction-appearance, transaction-location, exchange-rates, transfers, toast-style, pending-transactions, trash-bin)
│   ├── accounts/[accountId]/  # list, detail, modify
│   ├── categories/[categoryId]/ # list, detail, modify, presets
│   ├── tags/[tagId].tsx
│   ├── budgets/[budgetId]/    # list, detail, modify
│   ├── goals/                 # list, detail, modify, archived
│   ├── loans/[loanId]/        # list (All/Lent/Borrowed chips), detail, modify
│   ├── bill-splitter/         # main, add-item, names, summary
│   └── data-management/       # index, export-history
```

### Database (WatermelonDB)

DB name: `minty_flow_db` | Schema version: 2 | JSI adapter via `plugins/withWatermelonDBJSI.js`

- Schema: `src/database/schema.ts`
- Models: `src/database/models/` — one file per table (`account`, `budget`, `budget-account`, `budget-category`, `category`, `goal`, `goal-account`, `loan`, `recurring-transaction`, `tag`, `transaction-tag`, `transaction`, `transfer`)
- Services: `src/database/services/` — functional, one service per model, all re-exported from `index.ts`
- Mappers: `src/database/utils/` — model → plain object; `get-balance-delta.ts` computes balance change

**Transfer invariant:** creating a transfer always writes two transaction rows (`is_transfer: true`) sharing a `transfer_id` UUID, plus one row in the `transfers` table.

**Recurring transactions:** RRULE-based templates in `recurring_transactions`; `use-recurring-transaction-sync` hook spawns instances when the app comes to foreground.

#### Database Services Reference

| Service | Key details |
|---|---|
| `account-service.ts` | CRUD; account deletion leaves transfer-pair orphans (pre-existing, acknowledged) |
| `balance-service.ts` | Balance snapshots & accumulation queries; sort order is `transaction_date` then `created_at` ascending |
| `budget-service.ts` | CRUD + `observeBudgetSpent`; see Budgets section |
| `category-service.ts` | CRUD + reactive queries |
| `data-management-service.ts` | Import/export + emergency snapshots; delete snapshot only after successful recovery |
| `goal-service.ts` | CRUD + `observeGoalTransactionProgress`; see Goals section |
| `loan-service.ts` | CRUD + `observeLoanPaymentProgress`; see Loans section |
| `recurring-transaction-service.ts` | RRULE spawning logic |
| `stats-service.ts` | Chart & stats aggregations |
| `tag-service.ts` | CRUD + reactive queries |
| `transaction-service.ts` | CRUD; handles attachments, conversion, goal/budget/loan links |
| `transfer-service.ts` | Manages both transaction rows + transfer row atomically |

### Theming (react-native-unistyles v3)

- Theme system: `src/styles/theme/` — `factory.ts` builds theme objects, `registry.ts` exports `ALL_THEMES`
- Color schemes in `schemes/`: `minty.ts` (default `coastalTrim`), `catppuccin.ts`, `standalone.ts`
- `ThemeKey = keyof typeof ALL_THEMES`
- Unistyles configured in `src/styles/unistyles.ts`, reads initial theme from MMKV on startup
- Key tokens: `theme.colors.primary`, `.secondary`, `.surface`, `.onSurface`, `.customColors.income`, `.customColors.expense`
- `src/styles/fonts.ts` — typography definitions; `src/styles/breakpoints.ts` — responsive breakpoints

### State Management (Zustand v5 + MMKV)

All stores in `src/stores/`. Persist to MMKV where noted.

| Store | Purpose |
|---|---|
| `theme.store.ts` | Active theme, persisted |
| `language.store.ts` | Language code + RTL state; syncs i18n & `I18nManager` |
| `money-formatting.store.ts` | Number format prefs, mask-on-shake |
| `toast.store.ts` | Toast queue |
| `toast-style.store.ts` | Toast appearance prefs |
| `app-lock.store.ts` | Biometric/PIN gate |
| `transaction-sheet-controls.store.ts` | Transaction form UI state |
| `pending-transactions.store.ts` | Pending transaction cache |
| `bill-splitter.store.ts` | Bill splitter UI state |
| `button-placement.store.ts` | FAB button position |
| `exchange-rates-preferences.store.ts` | Exchange rate settings |
| `export-history.store.ts` | Data export history |
| `notification.store.ts` | Notification preferences |
| `onboarding.store.ts` | Onboarding progress |
| `profile.store.ts` | User profile data |
| `transfers-preferences.store.ts` | Transfer confirmation mode |
| `transaction-item-appearance.store.ts` | Transaction display prefs |
| `transaction-location.store.ts` | Location tracking for transactions |
| `trash-bin.store.ts` | Trash / deleted items |
| `upcoming-section.store.ts` | Upcoming transactions display |
| `android-sound.store.ts` | Android notification sound |

### i18n (i18next + react-i18next)

Languages: English (`en.json`), Arabic (`ar.json`) in `src/i18n/translation/`.
Translation keys are typed — `TranslationKey` is derived from the shape of `en.json`.
Usage: `const { t } = useTranslation()` → `t("some.nested.key")`.
RTL layout is driven by `useLanguageStore` — `PagerView` and `GestureHandlerRootView` are re-keyed when RTL changes.

### App-Level Services (`src/services/`)

| Service | Purpose |
|---|---|
| `auto-confirmation-service.ts` | Auto-confirms pending transactions after timeout; uses `setTimeout` with 24 h cap to avoid overflow |
| `currency-registry.ts` | Currency code / symbol registry |
| `exchange-rates.ts` | Fetches and caches exchange rates |
| `pending-transaction-notifications.ts` | Schedules notifications for pending transactions |

### Hooks (`src/hooks/`)

| Hook | Purpose |
|---|---|
| `use-balance-before.ts` | Account balance at a specific point in time |
| `use-chart-font.ts` | Loads fonts for chart rendering |
| `use-import-recovery.ts` | Recovery from failed DB imports |
| `use-location-permission-status.ts` | Monitors location permission |
| `use-notification-permission-status.ts` | Monitors notification permission |
| `use-notification-sync.ts` | Syncs pending transaction notifications |
| `use-recurring-rule.ts` | RRULE parsing/editing |
| `use-recurring-transaction-sync.ts` | Spawns recurring instances on foreground |
| `use-retention-cleanup.ts` | Cleans up old/deleted data |
| `use-scroll-into-view.ts` | Scroll-to-element behavior |
| `use-shake-listener.ts` | Device shake → mask-on-shake feature |
| `use-stats.ts` | Stats calculations / aggregations |
| `use-time-reactivity.ts` | Re-renders when date/time crosses a boundary |
| `use-navigation-guard.ts` | Route guard / navigation interception |
| `exchange-rates-editor.reducer.ts` | Reducer for exchange rate form state |

### Utils (`src/utils/`)

| Util | Purpose |
|---|---|
| `logger.ts` | Custom logging — use instead of `console.*` |
| `number-format.ts` | Number formatting per locale/prefs |
| `recurrence.ts` | RRULE utilities (uses RRuleSet public API) |
| `time-utils.ts` | Date/time manipulation |
| `stats-date-range.ts` | Date range calculations for stats |
| `transaction-list-utils.ts` | Transaction list filtering / grouping |
| `pending-transactions.ts` | Pending transaction state helpers |
| `toast.ts` | Toast notification helpers |
| `theme-utils.ts` | Theme color/variant helpers |
| `string-utils.ts` | String manipulation |
| `parse-math-expression.ts` | Parses math in amount input |
| `account-types-list.ts` | Account type option list |
| `get-week-start-on.ts` | Week start day based on locale |
| `is-single-emoji-or-letter.ts` | Validates single emoji/letter strings |
| `is-image-url.ts` | Validates image URLs |
| `file-icon.ts` | Maps file types to icons |
| `format-file-size.ts` | Bytes → human-readable size |
| `open-file.ts` | Opens documents, contacts, etc. |

### Forms

`react-hook-form` + `zod` v4 + `@hookform/resolvers`. Schemas in `src/schemas/`:

| Schema | Notes |
|---|---|
| `accounts.schema.ts` | Account creation |
| `budgets.schema.ts` | Budget form; `custom` period enforced via `superRefine` |
| `categories.schema.ts` | Category form |
| `goals.schema.ts` | Goal creation |
| `loans.schema.ts` | Loan form; category picker filtered by loan type |
| `tags.schema.ts` | Tag validation |
| `transactions.schema.ts` | Transaction form; attachments, conversion, goal/budget/loan links |

### Component Conventions

- UI primitives in `src/components/ui/`: `Button`, `Text`, `View`, `Pressable`, `Input`, `Switch`, `Chips`, `Toast`, `Tooltip`, `IconSvg`, `EmptyState`, `ActivityIndicatorMinty`, `ChevronIcon`, `Collapsible`, `InfoBanner`, `PermissionBanner`, `Separator`, `DateTimePickerModal`
- Feature components grouped by domain: `accounts/`, `categories/`, `tags/`, `transaction/`, `theme/`, `budgets/`, `goals/`, `loans/`, `stats/`, `bill-splitter/`, `location/`, `profile/`, `selector-modals/`
- Complex components use a directory with `index.ts` barrel, `*.styles.ts`, `types.ts`, and split sub-files
- `ActionItem` (`src/components/action-item.tsx`) — standard settings-row component
- `Money` (`src/components/money.tsx`) — money display with privacy masking
- `SmartAmountInput` — amount input with math expression support
- Icon library: `src/components/icons/filled/` and `icons/outline/` (auto-generated from Tabler icons via `scripts/add-icons.py`)

### Constants (`src/constants/`)

| File | Content |
|---|---|
| `app-data.ts` | App metadata |
| `fab-button.ts` | FAB button config |
| `minty-icons-selection.ts` | Icon set definitions |
| `pre-sets-accounts.ts` | Preset accounts for onboarding |
| `pre-sets-categories.ts` | Preset categories for onboarding |

### Types (`src/types/`)

`NewEnum.NEW = "new"` (`new.ts`) — create-vs-edit route param sentinel used throughout.

Other key types: `accounts.ts`, `bill-splitter.ts`, `budgets.ts` (`BudgetPeriodEnum`), `categories.ts`, `currency.ts`, `goals.ts`, `loans.ts` (`LoanTypeEnum`: LENT/BORROWED), `stats.ts`, `tags.ts`, `transaction-filters.ts`, `transactions.ts`, `transfers.ts`.

### Budgets

Budgets track spending against a limit for a given period. Each budget links to accounts and categories via join tables.

- Schema: `budgets`, `budget_accounts`, `budget_categories` (many-to-many joins)
- Models: `src/database/models/budget.ts`, `budget-account.ts`, `budget-category.ts`
- Service: `src/database/services/budget-service.ts`
  - `observeBudgetSpent(accountIds, categoryIds, period, startDate, endDate)` — reactive; filters out transfers, pending, and deleted transactions
  - Period types: `daily | weekly | monthly | yearly | custom`; `custom` requires `startDate` + `endDate`
  - `alert_threshold` (1–100%): warning toast fires once per mount when `spent / limit >= alertThreshold / 100`
  - `isActive` toggle (defaults `true`); inactive budgets show gray "Disabled" badge and sort to bottom
  - `duplicateBudget(budget)` — clones with "Copy of " prefix, `isActive=true`, re-creates join rows
- Mapper: `src/database/utils/model-to-budget.ts`
- Screens: `settings/budgets/` (list, detail, modify)
- **Known gap**: Rolling period windows computed once at subscribe time; stale if app stays open past midnight

### Goals

Goals track savings progress toward a target amount.

- Schema: `goals`, `goal_accounts` (many-to-many join)
- Models: `src/database/models/goal.ts`, `goal-account.ts`
- Service: `src/database/services/goal-service.ts`
  - `observeGoalTransactionProgress(accountIds)` — live progress from linked account transactions
  - `isCompleted` is computed as `progress >= 1` in UI — not stored
  - `isArchived` (schema v2) — archive/unarchive via edit form + confirm modal; archived list at `settings/goals/archived`
- Mapper: `src/database/utils/model-to-goal.ts`
- Screens: `settings/goals/` (list, detail, modify, archived)

### Loans

Loans track money lent (LENT) or borrowed (BORROWED).

- Schema: `loans` — `account_id`, `category_id` as direct FK columns (no join tables)
- Model: `src/database/models/loan.ts`
- Service: `src/database/services/loan-service.ts`
  - `observeLoanPaymentProgress(loanId, loanType)` — LENT counts income txs; BORROWED counts expense txs
  - `observeLoans()` — JS-sorts by `due_date` ascending (nulls last), then by name
  - `observeLoanTransactions(loanId)` — for detail page
- Mapper: `src/database/utils/model-to-loan.ts`
  - `isOverdue` computed as `dueDate < today && progress < 1`
- Screens: `settings/loans/` (list with All/Lent/Borrowed chips, detail, modify)
- **Loan creation** auto-creates initial cash-flow transaction: expense for LENT, income for BORROWED
- **Collect/Settle button** opens `LoanActionModal`:
  - "Collect All" / "Settle All" — repayment transaction for full remaining amount
  - "Partially Collect" / "Partially Settle" — navigates to transaction form prefilled with account, category, loanId
- Category picker filtered by loan type; switching type resets selected category

### Bill Splitter

- Screens: `settings/bill-splitter/` (main, add-item, names, summary)
- Store: `bill-splitter.store.ts`
- Components: `src/components/bill-splitter/`

### Data Management

- Service: `src/database/services/data-management-service.ts` — import/export + emergency snapshots
  - **Important:** delete emergency snapshot only after successful recovery (not in `finally`)
- Screens: `settings/data-management/` (index, export-history)
- Store: `export-history.store.ts`

### Linting

Biome (`biome.json`). Import order: packages → blank line → aliases (`~/`) → blank line → relative paths. Semicolons: as-needed. `console` calls are an error (use `src/utils/logger.ts`).

### Scripts (`scripts/`)

| Script | Triggered by |
|---|---|
| `generate-structure.mts` | `pnpm structure` / pre-commit |
| `find-unused-styles.mts` | `pnpm unused-styles` |
| `check-missing-i18n-keys.mts` | `pnpm check-i18n-keys` |
| `add-icons.py` | Manual — add icons to asset library |
| `trim-icons.py` | Manual — remove unused icons |

### Plugins (`plugins/`)

`withWatermelonDBJSI.js` — Expo plugin that configures WatermelonDB JSI for Android (referenced in `app.json`).

### Docs (`docs/`)

| File | Purpose |
|---|---|
| `STRUCTURE.md` | Auto-generated full project tree (do not edit manually) |
| `typography-migration.md` | Notes from typography system migration |
