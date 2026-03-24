# Project Issue Tracker

> Code review date: 2026-03-24
> Legend: 🟢 LOW

---

## 🟢 LOW (9 issues)

- [ ] `matchFont` called at module level in `use-chart-font.ts` before Skia is ready
- [ ] `use-notification-sync.ts` store subscription could use Zustand v5 `subscribe` overload with selector
- [ ] `stats-service.ts` fetches all accounts and categories unconditionally — should filter by IDs present in result set
- [ ] `autoPurgeTrash` fragile string parsing *(also MEDIUM)*
- [ ] `AccountModel.setColorScheme` and similar helpers bypass WatermelonDB write-tracking if called outside `update()`
- [ ] No service-level error boundaries for `database.get()` collection access failures
- [ ] `pending-transactions.store.ts` `getUpdateDateUponConfirmation` getter anti-pattern — bypasses selector memoization
- [ ] `money-formatting.store.ts` shake detection only activates privacy mode, never deactivates — worth a comment
- [ ] `onboarding/index.tsx` `goToPage` double-sets page state + PagerView imperatively — can drift · `src/app/onboarding/index.tsx`
