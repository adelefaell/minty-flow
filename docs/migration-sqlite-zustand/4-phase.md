

# ✅ Phase 4 — UI Migration (withObservables → Hooks)

---

# 🔑 Migration Strategy (DO NOT freestyle this)

### Order matters:

1. ✅ Low-risk lists (settings screens)
2. ✅ Detail screens
3. ✅ Cards (budget/goal/loan)
4. ⚠️ Transaction screens
5. 🔥 **HOME TAB LAST**

---

# 🧠 Mental Model Shift

### Before (Watermelon)

```ts
withObservables(["account"], ({ account }) => ({
  transactions: account.transactions.observe(),
}))
```

→ implicit, reactive, hidden queries

---

### After (Zustand + hooks)

```ts
const { items: transactions } = useTransactions({ accountId })
```

→ explicit, controlled, predictable

---

# 1️⃣ Simple Migration Pattern

---

## BEFORE

```ts
export default withObservables(["accounts"], () => ({
  accounts: observeAccounts(),
}))(AccountsScreen)
```

---

## AFTER

```ts
export default function AccountsScreen() {
  const accounts = useAccounts()

  return <AccountsList accounts={accounts} />
}
```

---

# 2️⃣ Detail Screen Pattern

---

## BEFORE

```ts
withObservables(["accountId"], ({ accountId }) => ({
  account: observeAccount(accountId),
}))
```

---

## AFTER

```ts
export default function AccountScreen({ accountId }) {
  const account = useAccount(accountId)

  if (!account) return null

  return <View>{account.name}</View>
}
```

---

# ⚠️ Important

* `undefined` is normal during initial load
* DO NOT block render with heavy loaders
* Keep UI responsive

---

# 3️⃣ Derived Data Replacement

---

## BEFORE (Watermelon observe)

```ts
observeBudgetSpent(budgetId)
```

---

## AFTER

```ts
const spent = useBudgetSpent(budgetId)
```

👉 internally:

* store OR SQL aggregate
* NOT computed in component

---

# 4️⃣ Transaction Screens (CRITICAL)

---

## BEFORE

```ts
withObservables(["filters"], ({ filters }) => ({
  transactions: observeTransactions(filters),
}))
```

---

## AFTER

```ts
const { items, status } = useTransactions(filters)
```

---

# ⚠️ DO NOT DO THIS

```ts
useTransactions({
  from: new Date(), // ❌ new object each render
})
```

---

## ✅ FIX

```ts
const filters = useMemo(() => ({
  from,
  to,
  accountIds,
}), [from, to, accountIds])

const { items } = useTransactions(filters)
```

---

# 5️⃣ 🔥 Home Tab Migration (MOST IMPORTANT)

---

## Problem

Home tab had:

* 6 observables
* automatic fine-grained updates

Now:

* multiple hooks
* risk of re-render storms

---

## Solution

### ✅ Split components aggressively

```txt
HomeScreen
 ├── BalanceSummary
 ├── AccountsList
 ├── RecentTransactions
 ├── BudgetsPreview
```

---

## Each uses its own hook

```ts
function RecentTransactions() {
  const { items } = useTransactions({ limit: 10 })
  return <List data={items} />
}
```

---

## 🔑 Result

* editing 1 transaction
  → ONLY RecentTransactions updates
  → NOT entire home screen

---

# 6️⃣ Prevent Re-render Storms

---

## ❌ BAD

```ts
const accounts = useAccounts()

accounts.map(...)
```

→ re-renders on ANY account change

---

## ✅ BETTER

```ts
const accounts = useAccounts()
```

✔ fine if list is small

---

## ✅ BEST (for heavy lists)

```ts
const accountIds = useAccountStore(s => s.ids)

return accountIds.map(id => (
  <AccountRow key={id} id={id} />
))
```

```ts
function AccountRow({ id }) {
  const account = useAccount(id)
  return <Text>{account.name}</Text>
}
```

---

# 7️⃣ Replacing Complex Observables

---

## BEFORE

```ts
withObservables(["transaction"], ({ transaction }) => ({
  tags: transaction.tags.observe(),
}))
```

---

## AFTER

```ts
const tagIds = useTransactionTagIds(txId)
```

---

# 8️⃣ Stats Hook Migration

---

## BEFORE

```ts
database.withChangesForTables(["transactions"])
```

---

## AFTER

```ts
useEffect(() => {
  const unsub1 = on("transactions:dirty", refetch)
  const unsub2 = on("accounts:dirty", refetch)

  return () => {
    unsub1()
    unsub2()
  }
}, [])
```

---

## ⚠️ MUST debounce

```ts
const refetch = debounce(fetchStats, 100)
```

---

# 9️⃣ Loading States (NEW BEHAVIOR)

---

## BEFORE

Watermelon:

* always had data stream

---

## AFTER

You must handle:

```ts
if (status === "loading") return <Skeleton />
```

---

# 🔥 Best UX pattern

* show cached data immediately
* overlay loader if refreshing

---

# 10️⃣ Migration Workflow (SAFE)

---

### For EACH file:

1. Remove `withObservables`
2. Replace with hooks
3. Verify:

   * renders
   * updates on change
   * no infinite loops
4. Move to next file

---

# ⚠️ DO NOT:

* migrate everything at once
* touch home tab early
* change logic + migration together

---

# 11️⃣ Final Boss — Home Tab Checklist

---

Before finishing:

* [ ] Scroll 1000 transactions → smooth
* [ ] Edit middle item → no jump
* [ ] Add transaction → appears correctly
* [ ] No full screen re-render
* [ ] No flicker

---

# 12️⃣ Common Bugs (you WILL hit)

---

### ❌ Infinite fetch loop

Cause:

```ts
useEffect(() => {
  fetch(...)
}, [filters])
```

Fix:
→ use hash / memo

---

### ❌ UI not updating

Cause:

* forgot event emit
* wrong selector

---

### ❌ Jank

Cause:

* too many components subscribing to big arrays

Fix:
→ split components

---

# 13️⃣ What you just did

You replaced:

❌ RxJS + HOC magic
with
✅ explicit, scalable React architecture

---
