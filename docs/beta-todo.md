# Minty Flow — Beta Completion Checklist

> Accurate status based on actual source code review.
> Legend: ✅ Done · 🚧 Partial / Needs Polish · ⬜ Not Started

---

## 🗂️ Core Navigation & Layout


| Item                                      | Status | Notes                                |
| ----------------------------------------- | ------ | ------------------------------------ |
| Tab layout with PagerView + animated FAB  | ✅      | Home, Stats, Accounts, Settings      |
| FAB — Expense / Income / Transfer actions | ✅      | 3 animated options                   |
| Root Stack with all registered screens    | ✅      | All routes declared in `_layout.tsx` |
| StatusBar + ToastManager                  | ✅      |                                      |
| Theme (light / dark / system)             | ✅      | Unistyles-based                      |
| Recurring transaction sync on app start   | ✅      | `useRecurringTransactionSync`        |
| Retention cleanup on app start            | ✅      | `useRetentionCleanup`                |


---

## 🏠 Tab 1 — Home Screen


| Item                                                                                                       | Status | Notes                               |
| ---------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------- |
| Transaction section list (reactive)                                                                        | ✅      |                                     |
| Summary cards (income / expense / net, multi-currency)                                                     | ✅      |                                     |
| Full filter header (accounts, categories, tags, type, currency, group by, attachments, date range, search) | ✅      |                                     |
| Privacy mode toggle                                                                                        | ✅      |                                     |
| Profile greeting + avatar tap → Edit Profile                                                               | ✅      |                                     |
| Upcoming section (recurring + pending, confirm / confirm-all / cancel)                                     | ✅      |                                     |
| Empty state when no transactions                                                                           | ✅      | Wallet icon + title + subtitle in `transaction-section-list.tsx` |


---

## 📊 Tab 2 — Stats Screen


| Item                                    | Status | Notes                                                                          |
| --------------------------------------- | ------ | ------------------------------------------------------------------------------ |
| Stats screen                            | ✅      | Per-currency sections with hero cards, charts, and category breakdown          |
| Period selector (month / year / custom) | ✅      | `MonthYearPicker` + `DateRangePresetModal` with range label                    |
| Income vs Expense chart                 | ✅      | `CurrencyHeroRow` (expense / income / net) + `DailyExpenseLineChart`           |
| Category breakdown chart                | ✅      | `StatsCategoryPie` — interactive donut with per-slice tap                      |
| Top spending categories                 | ✅      | Category list ranked by amount shown alongside pie chart                       |
| Averages row (daily avg vs prior month) | ✅      | `StatsAveragesRow` with delta badges                                           |
| Pending + uncategorized alerts          | ✅      | `StatsPendingNotice` + `StatsUncategorizedAlert` with action links             |
| Loading skeleton + empty states         | ✅      | `StatsSkeleton`, `StatsEmptyState` (no data / no transactions for range)       |
| Net worth / balance over time           | ⬜      |                                                                                |


---

## 💳 Tab 3 — Accounts Screen


| Item                                                                                         | Status | Notes                                      |
| -------------------------------------------------------------------------------------------- | ------ | ------------------------------------------ |
| Accounts list with total balance (multi-currency)                                            | ✅      |                                            |
| Search accounts                                                                              | ✅      |                                            |
| Drag-to-reorder with save / cancel                                                           | ✅      | `ReorderableListV2`, persists `sort_order` |
| Account card (balance, month in/out, type, primary badge, archived badge)                    | ✅      |                                            |
| Account detail (balance, month summary, transaction list, filter, search, year/month picker) | ✅      |                                            |
| Create account                                                                               | ✅      |                                            |
| Edit account (name, type, currency, icon, color, primary flag)                               | ✅      |                                            |
| Archive account toggle (in edit screen)                                                      | ✅      | Archived accounts shown grayed out in list |
| Permanently delete account (only after archiving)                                            | ✅      | Safety guard in place                      |


---

## ➕ Transaction Form (Full-Screen Modal)


| Item                                                            | Status | Notes                                          |
| --------------------------------------------------------------- | ------ | ---------------------------------------------- |
| Expense / Income / Transfer type switcher                       | ✅      |                                                |
| Amount input with currency                                      | ✅      |                                                |
| Account picker (inline)                                         | ✅      |                                                |
| To-account picker for transfers                                 | ✅      |                                                |
| Category picker                                                 | ✅      |                                                |
| Tag picker (multi-select)                                       | ✅      |                                                |
| Date / time picker                                              | ✅      |                                                |
| Title + description fields                                      | ✅      |                                                |
| Pending toggle                                                  | ✅      |                                                |
| Recurring setup (frequency, start, end date / occurrences)      | ✅      |                                                |
| Currency conversion rate for cross-currency transfers           | ✅      | Auto-fetched + manual override                 |
| Balance at transaction display                                  | ✅      |                                                |
| Attachments (camera, file picker, preview, open in app, remove) | ✅      |                                                |
| Move to trash                                                   | ✅      |                                                |
| Restore from trash (shown when opened from Trash screen)        | ✅      | Via transaction form                           |
| Permanently delete (when trashed)                               | ✅      |                                                |
| Edit existing transaction (prefill)                             | ✅      |                                                |
| Unsaved changes guard modal                                     | ✅      |                                                |
| Location tagging                                                | ✅      | `location-picker-modal.tsx` + `form-location-picker.tsx` wired into form |


---

## ⚙️ Tab 4 — Settings

### Profile


| Item                           | Status | Notes |
| ------------------------------ | ------ | ----- |
| Profile section (avatar, name) | ✅      |       |
| Edit profile screen            | ✅      |       |


### All Accounts


| Item                                                     | Status | Notes |
| -------------------------------------------------------- | ------ | ----- |
| All accounts list (including archived, sorted to bottom) | ✅      |       |
| Add account button                                       | ✅      |       |


### Categories


| Item                              | Status | Notes |
| --------------------------------- | ------ | ----- |
| Categories list by type           | ✅      |       |
| Category detail screen            | ✅      |       |
| Create / Edit category            | ✅      |       |
| Category presets                  | ✅      |       |
| Archived categories screen        | ✅      |       |
| Delete category with confirmation | ✅      |       |


### Tags


| Item                       | Status | Notes |
| -------------------------- | ------ | ----- |
| Tags list                  | ✅      |       |
| Create / Edit / Delete tag | ✅      |       |


### Trash


| Item                                                           | Status | Notes                                                         |
| -------------------------------------------------------------- | ------ | ------------------------------------------------------------- |
| Trash list (sorted by deleted-at, reactive)                    | ✅      |                                                               |
| Tap → open trashed transaction → restore or permanently delete | ✅      | Via transaction form                                          |
| Swipe left → permanently delete with confirm modal             | ✅      |                                                               |
| Empty state                                                    | ✅      |                                                               |


### Pending Transactions *(Settings screen)*


| Item                                   | Status | Notes                                                                                                               |
| -------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| Settings > Pending Transactions screen | ✅      | Month/year navigator, filter header, search, swipe-to-delete/restore, empty state — `settings/pending-transactions.tsx` |


### Goals


| Item                                     | Status | Notes                                                                       |
| ---------------------------------------- | ------ | --------------------------------------------------------------------------- |
| Goals list                               | ✅      | Reactive list with GoalCard + edit navigation                               |
| Create / Edit goal form                  | ✅      | Full form: name, description, icon, color, currency, accounts, amount, date |
| Goal progress tracking                   | ✅      | `observeGoalProgress()` sums linked account balances reactively             |
| Archive / unarchive goal                 | ✅      | Archive button in edit form (confirm modal); archived goals list screen     |
| Archived goals screen                    | ✅      | Stack screen at `settings/goals/archived` via header button                 |
| `isCompleted` badge on card              | ✅      | Shown in GoalCard; toggled via form checkbox                                |


### Budgets


| Item                          | Status | Notes                                                                                      |
| ----------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| Budgets list                  | ✅      | Reactive list with BudgetCard + edit navigation                                            |
| Create / Edit budget form     | ✅      | Full form: name, icon, color, currency, accounts, categories, period, amount, alert        |
| Spending progress per budget  | ✅      | `observeBudgetSpent()` queries expense transactions reactively; progress bar + over-budget |
| Alert threshold notifications | ✅      | Toast fires once per mount when `spent / limit >= alertThreshold / 100`                    |
| Budget duplicate / copy       | ⬜      | Clone existing budget with same settings                                                   |


### Loans


| Item                           | Status | Notes                                        |
| ------------------------------ | ------ | -------------------------------------------- |
| Loans list                     | ⬜      | Placeholder screen; DB model + service exist |
| Create loan (lent / borrowed)  | ⬜      |                                              |
| Record repayment / settle loan | ⬜      |                                              |


### Bill Splitter


| Item          | Status | Notes                                 |
| ------------- | ------ | ------------------------------------- |
| Bill splitter | ⬜      | Placeholder screen, no backend at all |


### Data Management


| Item                   | Status | Notes                     |
| ---------------------- | ------ | ------------------------- |
| Data management screen | ⬜      | "COMING SOON" placeholder |
| Export CSV / JSON      | ⬜      |                           |
| Import CSV / JSON      | ⬜      |                           |
| Backup / restore       | ⬜      |                           |
| Wipe all data          | ⬜      |                           |


---

## 🎛️ Preferences


| Item                                                                                       | Status | Notes                                                                           |
| ------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------- |
| Preferences index                                                                          | ✅      |                                                                                 |
| Theme                                                                                      | ✅      |                                                                                 |
| Money formatting                                                                           | ✅      |                                                                                 |
| Toast style                                                                                | ✅      |                                                                                 |
| Transfers layout                                                                           | ✅      |                                                                                 |
| Pending transactions preferences (timeframe, require confirmation, update date on confirm) | ✅      |                                                                                 |
| Exchange rates (live fetch, Suspense, custom rate per currency, retry)                     | ✅      |                                                                                 |
| Trash bin retention period                                                                 | ✅      |                                                                                 |
| Privacy (blur amounts)                                                                     | ✅      |                                                                                 |
| Transaction location toggle                                                                | ✅      | Screen, store, and form-level capture all implemented                           |
| Reminder notifications                                                                     | ✅      | Stubs implemented; `useNotificationSync` wired in `_layout.tsx`; notify toggle + early-reminder chips in pending-transactions preferences |


---

## 🔔 System & Cross-Cutting


| Item                                                            | Status | Notes |
| --------------------------------------------------------------- | ------ | ----- |
| WatermelonDB schema + migrations                                | ✅      |       |
| MMKV stores (profile, toast, preferences, exchange rates, etc.) | ✅      |       |
| Reusable ConfirmModal                                           | ✅      |       |
| Toast system                                                    | ✅      |       |
| Money formatting + privacy mode                                 | ✅      |       |
| Auto-confirmation service                                       | ✅      |       |
| Android JSI plugin                                              | ✅      |       |
| Error boundary / crash screen                                   | ⬜      |       |
| Onboarding / first-launch flow                                  | ⬜      |       |


---

## 🧹 Polish


| Item                                                  | Status | Notes                                                   |
| ----------------------------------------------------- | ------ | ------------------------------------------------------- |
| Empty state illustrations for all list screens        | ✅      | Shared `EmptyState` component; Goals, Budgets, Loans, Tags, Trash all updated |
| "Empty all trash" UI button                           | ✅      | In Preferences > Trash Bin; confirm modal + toast wired |
| Android back-gesture guard (outside transaction form) | ⬜      |                                                         |
| TypeScript zero errors (`pnpm types`)                 | ✅      | `tsc --noEmit` passes clean                             |
| Lint zero warnings (`pnpm lint`)                      | ✅      | Biome passes clean                                      |


---

*Last updated: 2026-03-15 — stats fully implemented; goals archive done; budget alert threshold done; reusable EmptyState component across all list screens*
