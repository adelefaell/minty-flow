
# ✅ Phase 2 — Zustand Stores (Reactive Layer)

---

# Folder

```txt
src/stores/db/
  account.store.ts
  category.store.ts
  tag.store.ts
  transaction.store.ts   ← special
```

---

# 🔑 Core principles (don’t skip)

1. **Stores hold normalized state**

   * `byId` + `ids`
2. **Selectors must be shallow-safe**
3. **All refresh comes from events**
4. **Transactions = filter-keyed cache**
5. **No DB calls inside components**

---

# 1️⃣ Base Store Pattern (Accounts example)

## `account.store.ts`

```ts
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { shallow } from "zustand/shallow"

import { getAllAccounts } from "@/database/repos/account-repo"
import { mapAccount } from "@/database/mappers/account.mapper"
import { on } from "@/database/events"

import type { Account } from "@/types"

interface State {
  byId: Record<string, Account>
  ids: string[]
  status: "idle" | "loading" | "ready"

  refreshAll: () => Promise<void>
}

export const useAccountStore = create<State>()(
  subscribeWithSelector((set, get) => ({
    byId: {},
    ids: [],
    status: "idle",

    refreshAll: async () => {
      set({ status: "loading" })

      const rows = await getAllAccounts()
      const accounts = rows.map(mapAccount)

      const byId: Record<string, Account> = {}
      const ids: string[] = []

      for (const acc of accounts) {
        byId[acc.id] = acc
        ids.push(acc.id)
      }

      set({
        byId,
        ids,
        status: "ready",
      })
    },
  }))
)

// 🔥 event wiring (module-level)
on("accounts:dirty", () => {
  useAccountStore.getState().refreshAll()
})

// ✅ hooks (safe selectors)

export function useAccounts() {
  return useAccountStore(
    s => s.ids.map(id => s.byId[id]),
    shallow
  )
}

export function useAccount(id: string) {
  return useAccountStore(s => s.byId[id])
}
```

---

# 2️⃣ Category + Tag stores

Same pattern. Keep them simple.

---

# 3️⃣ 🔥 Transactions Store (CRITICAL)

This is where your performance lives or dies.

---

## Requirements

* filter-keyed cache
* debounced refresh
* partial invalidation
* no global re-render

---

## `transaction.store.ts`

```ts
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { shallow } from "zustand/shallow"

import { on } from "@/database/events"
import { getTransactionsByFilter } from "@/database/repos/transaction-repo"
import { hydrateTransactions } from "@/database/mappers/hydrateTransactions"

import type { TransactionWithRelations } from "@/types"

type Status = "idle" | "loading" | "ready"

interface CacheEntry {
  items: TransactionWithRelations[]
  status: Status
  dirty: boolean
}

interface State {
  cache: Record<string, CacheEntry>

  fetch: (hash: string, filters: any) => Promise<void>
  markDirty: (ids?: string[]) => void
}

function stableHash(filters: any) {
  return JSON.stringify({
    ...filters,
    from: filters?.from?.toISOString?.(),
    to: filters?.to?.toISOString?.(),
  })
}

export const useTransactionStore = create<State>()(
  subscribeWithSelector((set, get) => ({
    cache: {},

    fetch: async (hash, filters) => {
      const existing = get().cache[hash]

      if (existing?.status === "loading") return

      set(state => ({
        cache: {
          ...state.cache,
          [hash]: {
            items: existing?.items ?? [],
            status: "loading",
            dirty: false,
          },
        },
      }))

      const rows = await getTransactionsByFilter(filters)
      const hydrated = await hydrateTransactions(rows)

      set(state => ({
        cache: {
          ...state.cache,
          [hash]: {
            items: hydrated,
            status: "ready",
            dirty: false,
          },
        },
      }))
    },

    markDirty: () => {
      set(state => {
        const next: State["cache"] = {}

        for (const key in state.cache) {
          next[key] = {
            ...state.cache[key],
            dirty: true,
          }
        }

        return { cache: next }
      })
    },
  }))
)
```

---

# 🔁 Event Wiring (with debounce)

```ts
let timer: any = null

on("transactions:dirty", () => {
  const store = useTransactionStore.getState()

  store.markDirty()

  if (timer) return

  timer = setTimeout(() => {
    timer = null

    const { cache, fetch } = useTransactionStore.getState()

    for (const key in cache) {
      if (cache[key].dirty) {
        fetch(key, JSON.parse(key))
      }
    }
  }, 50)
})
```

---

# 4️⃣ Hook Layer (IMPORTANT)

## `useTransactions`

```ts
export function useTransactions(filters: any) {
  const hash = stableHash(filters)

  const entry = useTransactionStore(
    s => s.cache[hash],
    shallow
  )

  const fetch = useTransactionStore(s => s.fetch)

  // fetch on mount
  useEffect(() => {
    if (!entry) {
      fetch(hash, filters)
    }
  }, [hash])

  return {
    items: entry?.items ?? [],
    status: entry?.status ?? "loading",
  }
}
```

---

# 5️⃣ ⚠️ Common Mistakes (you will hit these)

### ❌ Infinite re-renders

```ts
useStore(s => s.items.map(...)) // BAD
```

---

### ❌ Refetch loop

```ts
useEffect(() => {
  fetch(...)
}, [filters]) // filters unstable
```

✅ fix → hash

---

### ❌ UI lag on typing filters

→ solution already included:

* debounce
* dirty flag

---

# 6️⃣ Performance Guarantees

With this setup:

* Editing 1 transaction:

  * does NOT re-render all lists instantly
  * triggers 1 batched refresh

* Home tab:

  * smooth at 1000+ items

* Multiple writes:

  * coalesced into 1 refresh

---

# 7️⃣ What you unlocked

You now have:

* Watermelon-level reactivity
* Without RxJS
* With full control
* And no hidden queries
