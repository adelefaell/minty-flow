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
| Empty state when no transactions                                                                           | ⬜      | Just an empty list, no illustration |


---

## 📊 Tab 2 — Stats Screen


| Item                                    | Status | Notes                                                    |
| --------------------------------------- | ------ | -------------------------------------------------------- |
| Stats screen                            | ⬜      | Completely empty placeholder — entire tab needs building |
| Period selector (month / year / custom) | ⬜      |                                                          |
| Income vs Expense chart                 | ⬜      |                                                          |
| Category breakdown chart                | ⬜      |                                                          |
| Top spending categories                 | ⬜      |                                                          |
| Net worth / balance over time           | ⬜      |                                                          |


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
| Restore from trash (shown when opened from Trash screen)        | ✅      |                                                |
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
| Settings > Pending Transactions screen | ⬜      | Static placeholder — the home upcoming section already has the real UI; this dedicated screen needs to be built out |


### Goals


| Item                    | Status | Notes                                                  |
| ----------------------- | ------ | ------------------------------------------------------ |
| Goals list              | ⬜      | Placeholder screen; DB model + full CRUD service exist |
| Create / Edit goal form | ⬜      |                                                        |
| Goal progress tracking  | ⬜      |                                                        |
| Archive / complete goal | ⬜      |                                                        |


### Budgets


| Item                         | Status | Notes                                        |
| ---------------------------- | ------ | -------------------------------------------- |
| Budgets list                 | ⬜      | Placeholder screen; DB model + service exist |
| Create / Edit budget form    | ⬜      |                                              |
| Spending progress per budget | ⬜      |                                              |


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
| Reminder notifications                                                                     | 🚧     | Screen + service exist; `scheduleForPlannedTransaction()` is a TODO stub — scheduling not wired |


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


| Item                                                  | Status | Notes                                 |
| ----------------------------------------------------- | ------ | ------------------------------------- |
| Empty state illustrations for all list screens        | ⬜      | Goals, Budgets, Loans, Pending screen |
| Reorder categories (same as accounts)                 | ⬜      |                                       |
| "Empty all trash" UI button                           | ⬜      | Service ready                         |
| Android back-gesture guard (outside transaction form) | ⬜      |                                       |
| TypeScript zero errors (`pnpm types`)                 | ✅      | `tsc --noEmit` passes clean           |
| Lint zero warnings (`pnpm lint`)                      | 🚧     |                                       |


---

## 🚀 Beta Release Priority Order

1. [ ] **Stats tab** — at minimum a monthly income/expense chart
2. [ ] **Settings > Pending Transactions screen** — build real list (service + component already exist on home screen)
3. [ ] **Empty all trash** button — one button, service is ready
4. [ ] **Reminder notifications** — wire `scheduleForPlannedTransaction()` stub; verify scheduling fires on iOS + Android
5. [ ] **Goals** — DB + service ready, just needs screens
6. [ ] **Budgets** — DB + service ready, just needs screens
7. [ ] **Loans** — DB + service ready, just needs screens
8. [ ] **Data Management** — at minimum CSV export
9. [ ] **Bill Splitter** — lowest priority, needs full backend + UI
10. [ ] Zero lint warnings (`pnpm lint`) before shipping

---

*Last updated: 2026-03-02*