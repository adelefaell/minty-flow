# Minty Flow — Beta Completion Checklist

> Track every screen, component, and implementation needed to reach a working beta.
> Legend: ✅ Done · 🚧 Partial / Needs Polish · ⬜ Not Started

---

## 🗂️ Core Navigation & Layout

| Item | Status | Notes |
|------|--------|-------|
| Tab layout (`(tabs)/_layout.tsx`) with PagerView + FAB | ✅ | Working with Home, Stats, Accounts, Settings tabs |
| FAB — Add Expense / Income / Transfer actions | ✅ | Animated, 3 options |
| Root `_layout.tsx` Stack with all registered screens | ✅ | All routes declared |
| StatusBar + ToastManager | ✅ | |
| Theme (light / dark) | ✅ | Unistyles-based |

---

## 🏠 Tab 1 — Home Screen

| Item | Status | Notes |
|------|--------|-------|
| Transaction list with `withObservables` | ✅ | |
| Summary section (income / expense / net cards) | ✅ | |
| Filter header (accounts, categories, tags, type, currency, date range, search) | ✅ | |
| Privacy mode toggle (eye icon) | ✅ | |
| Profile greeting + avatar tap → edit profile | ✅ | |
| "Show upcoming" pending transactions | ✅ | |
| Pull-to-refresh / live reactive updates | ✅ | |
| Empty state illustration when no transactions | ⬜ | Just an empty list currently |

---

## 📊 Tab 2 — Stats Screen

| Item | Status | Notes |
|------|--------|-------|
| Stats screen shell (`stats-view.tsx`) | 🚧 | Title only — fully placeholder |
| Period selector (month / year / custom range) | ⬜ | |
| Expense vs Income bar/line chart | ⬜ | |
| Category breakdown pie/donut chart | ⬜ | |
| Top spending categories list | ⬜ | |
| Net worth over time chart | ⬜ | |
| Account balance comparison | ⬜ | |

---

## 💳 Tab 3 — Accounts Screen

| Item | Status | Notes |
|------|--------|-------|
| Accounts list screen | ✅ | `src/app/accounts/index.tsx` |
| Account card component | ✅ | Balance, currency, type, primary badge |
| Account detail screen (`[accountId]/index.tsx`) | ✅ | Balance, month in/out, net, transaction list |
| Account detail — filter + search | ✅ | |
| Account detail — year/month picker | ✅ | |
| Create / Edit account (`[accountId]/modify.tsx`) | ✅ | Name, type, currency, icon, color, primary flag |
| Delete account with confirmation modal | ✅ | |
| Archive account | ✅  | Can be managed in the settings under All Accounts screen |
| Reorder accounts | ✅  | |

---

## ➕ Transaction Form (Full-Screen Modal)

| Item | Status | Notes |
|------|--------|-------|
| Transaction form v3 (`transaction/[id].tsx`) | ✅ | |
| Expense / Income / Transfer type switcher | ✅ | |
| Amount input with currency | ✅ | |
| Account picker (inline) | ✅ | |
| To-account picker for transfers | ✅ | |
| Category picker | ✅ | |
| Tag picker (multi-select) | ✅ | |
| Date / time picker | ✅ | |
| Title + description fields | ✅ | |
| Pending toggle | ✅ | |
| Recurring transaction setup | ✅ | frequency, end date, occurrences |
| Currency conversion rate for cross-currency transfers | ✅ | |
| Attachments / photos | ⬜ | Screen registered but not wired |
| Location tagging | ⬜ | Preference screen exists, form field missing |
| Balance at transaction display | ✅ | |
| Edit existing transaction (prefill) | ✅ | |
| Delete transaction with confirmation | ✅ | |
| Unsaved changes guard modal | ✅ | |

---

## ⚙️ Tab 4 — Settings Screen

### Settings Index
| Item | Status | Notes |
|------|--------|-------|
| Settings index with section list | ✅ | Profile section + money management + other |
| Profile section component | ✅ | Avatar, name |

### Edit Profile
| Item | Status | Notes |
|------|--------|-------|
| Edit profile screen | ✅ | Name, avatar/image |

### All Accounts
| Item | Status | Notes |
|------|--------|-------|
| All accounts list | ✅ | Links to account detail/modify |
| Add account button | ✅ | |
| Archived accounts toggle | ✅ | | have different styles 

### Categories
| Item | Status | Notes |
|------|--------|-------|
| Categories index (by type tabs) | ✅ | |
| Category detail (`[categoryId]/index.tsx`) | ✅ | |
| Create / Edit category (`[categoryId]/modify.tsx`) | ✅ | |
| Category presets screen | ✅ | |
| Archived categories screen | ✅ | |
| Delete category with confirmation | ✅ | |

### Tags
| Item | Status | Notes |
|------|--------|-------|
| Tags list screen | ✅ | |
| Create / Edit tag (`[tagId].tsx`) | ✅ | |
| Delete tag | ✅ | |

### Trash
| Item | Status | Notes |
|------|--------|-------|
| Trash screen (deleted transactions) | 🚧 | Screen exists — verify restore + permanent delete logic |
| Restore transaction from trash | ⬜ | |
| Permanent delete from trash | ⬜ | |
| Empty trash action | ⬜ | |

### Pending Transactions
| Item | Status | Notes |
|------|--------|-------|
| Pending transactions list screen | 🚧 | Screen file exists — needs full implementation |
| Mark pending as complete | ⬜ | |
| Delete / dismiss pending | ⬜ | |

### Goals ⬜
| Item | Status | Notes |
|------|--------|-------|
| Goals list | ⬜ | Placeholder screen; DB model + service exist |
| Create / Edit goal form | ⬜ | |
| Goal progress bar / visual | ⬜ | |
| Mark goal as achieved / archive | ⬜ | |
| Link transactions to a goal | ⬜ | |

### Budgets ⬜
| Item | Status | Notes |
|------|--------|-------|
| Budgets list | ⬜ | Placeholder screen |
| Create / Edit budget form | ⬜ | |
| Budget period (monthly / weekly / custom) | ⬜ | |
| Spending progress per budget | ⬜ | |
| Over-budget alert / indicator | ⬜ | |

### Loans ⬜
| Item | Status | Notes |
|------|--------|-------|
| Loans list | ⬜ | Placeholder screen |
| Create loan (lent / borrowed) | ⬜ | |
| Record repayment | ⬜ | |
| Mark loan as settled | ⬜ | |

### Bill Splitter ⬜
| Item | Status | Notes |
|------|--------|-------|
| Bill splitter screen | ⬜ | Placeholder screen |
| Add participants | ⬜ | |
| Split bill evenly / custom amounts | ⬜ | |
| Generate split summary | ⬜ | |

### Data Management ⬜
| Item | Status | Notes |
|------|--------|-------|
| Data management screen | ⬜ | "COMING SOON" placeholder |
| Export to CSV / JSON | ⬜ | |
| Import from CSV / JSON | ⬜ | |
| iCloud / local backup | ⬜ | |
| Restore from backup | ⬜ | |
| Wipe all data (reset) | ⬜ | |

---

## 🎛️ Preferences

| Item | Status | Notes |
|------|--------|-------|
| Preferences index | ✅ | |
| Theme (light / dark / system) | ✅ | |
| Toast style (position, progress bar, close icon) | ✅ | |
| Exchange rates | 🚧 | Screen exists — verify live rates fetch + manual override |
| Trash bin retention (auto-delete after N days) | ✅ | |
| Reminder notifications | 🚧 | Screen exists — verify scheduling works on both platforms |
| Pending transactions settings | ✅ | |
| Privacy mode (blur amounts) | ✅ | |
| Money formatting (symbol, decimals, grouping) | ✅ | |
| Transaction location toggle | 🚧 | Screen exists — location capture not wired to form |
| Transfers settings | ✅ | |

---

## 🔔 System & Cross-Cutting

| Item | Status | Notes |
|------|--------|-------|
| Recurring transaction sync (`useRecurringTransactionSync`) | ✅ | |
| Retention cleanup (`useRetentionCleanup`) | ✅ | |
| WatermelonDB schema + migrations | ✅ | |
| MMKV stores (profile, preferences, toast style, etc.) | ✅ | |
| Toast notification system | ✅ | |
| Confirm modal (reusable) | ✅ | |
| Money formatting / privacy mode | ✅ | |
| Error boundary / crash screen | ⬜ | |
| Onboarding flow (first launch) | ⬜ | |
| Push notification support (reminders) | ⬜ | Preference exists; scheduling TBD |
| App icon + splash screen assets | ✅ | |
| Android JSI plugin (`withWatermelonDBJSI`) | ✅ | |

---

## 🧹 Polish & Beta Hardening

| Item | Status | Notes |
|------|--------|-------|
| Empty states for all list screens | ⬜ | Only transactions has one |
| Loading skeletons / shimmer placeholders | ⬜ | |
| Offline indicator | ⬜ | App is local-first but no UX indicator |
| Accessibility labels (`accessibilityLabel`, `accessibilityRole`) | 🚧 | Partial in form components |
| iOS VoiceOver / Android TalkBack audit | ⬜ | |
| Tablet / large screen layout | ⬜ | |
| Android back-gesture handling | 🚧 | Unsaved-changes guard in transaction form; missing elsewhere |
| TypeScript strict errors (`pnpm types`) at zero | 🚧 | Run to get current count |
| Lint pass at zero warnings (`pnpm lint`) | 🚧 | |
| Performance: memo/callback audit on heavy lists | ⬜ | |
| Deep link support | ⬜ | |

---

## 🚀 Beta Release Gates

- [ ] Stats tab has at least basic monthly income/expense chart
- [ ] Trash screen — restore + delete working
- [ ] Pending transactions screen — fully functional
- [ ] Exchange rates screen — live fetch confirmed
- [ ] Reminder notifications fire on iOS + Android
- [ ] Zero TypeScript errors (`pnpm types`)
- [ ] Zero lint errors (`pnpm lint`)
- [ ] Test on physical Android device via USB
- [ ] Test on iOS simulator (macOS)
- [ ] All placeholder screens either implemented or hidden from Settings list

---

*Last updated: 2026-02-24*