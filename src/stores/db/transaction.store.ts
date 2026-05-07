import { useEffect } from "react"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { useShallow } from "zustand/react/shallow"

import { on } from "~/database/events"
import {
  hydrateTransactions,
  type TransactionWithRelations,
} from "~/database/mappers/hydrateTransactions"
import { getTransactionsByFilter } from "~/database/repos/transaction-repo"

type Status = "idle" | "loading" | "ready"

interface CacheEntry {
  items: TransactionWithRelations[]
  status: Status
  dirty: boolean
}

export interface TransactionFilters {
  from?: string // UTC ISO
  to?: string // UTC ISO
  accountIds?: string[]
  categoryIds?: string[]
  categoryId?: string
  loanId?: string
  goalId?: string
  isPending?: boolean
  deletedOnly?: boolean
  limit?: number
  offset?: number
}

interface TransactionStoreState {
  cache: Record<string, CacheEntry>
  fetch: (hash: string, filters: TransactionFilters) => Promise<void>
  markDirty: () => void
}

/**
 * Stable, deterministic cache key. Dates must be ISO strings — never raw Date objects.
 */
export function stableFilterHash(filters: TransactionFilters): string {
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(filters).sort()) {
    const value = filters[key as keyof TransactionFilters]
    if (value !== undefined) sorted[key] = value
  }
  return JSON.stringify(sorted)
}

export const useTransactionStore = create<TransactionStoreState>()(
  subscribeWithSelector((set, get) => ({
    cache: {},

    fetch: async (hash, filters) => {
      const existing = get().cache[hash]
      if (existing?.status === "loading") return

      set((state) => ({
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

      set((state) => ({
        cache: {
          ...state.cache,
          [hash]: { items: hydrated, status: "ready", dirty: false },
        },
      }))
    },

    markDirty: () => {
      set((state) => {
        const next: Record<string, CacheEntry> = {}
        for (const key in state.cache) {
          next[key] = { ...state.cache[key], dirty: true }
        }
        return { cache: next }
      })
    },
  })),
)

// Debounced refresh: mark dirty immediately, refetch after 50 ms
let debounceTimer: ReturnType<typeof setTimeout> | null = null

on("transactions:dirty", () => {
  useTransactionStore.getState().markDirty()

  if (debounceTimer) return

  debounceTimer = setTimeout(() => {
    debounceTimer = null
    const { cache, fetch } = useTransactionStore.getState()
    for (const key in cache) {
      if (cache[key].dirty) {
        fetch(key, JSON.parse(key) as TransactionFilters)
      }
    }
  }, 50)
})

on("db:reset", () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  useTransactionStore.setState({ cache: {} })
})

export function useTransactions(filters: TransactionFilters): {
  items: TransactionWithRelations[]
  status: Status
} {
  const hash = stableFilterHash(filters)

  const entry = useTransactionStore(useShallow((s) => s.cache[hash]))
  const fetch = useTransactionStore((s) => s.fetch)

  const isNew = !entry
  const isDirty = entry?.dirty ?? false

  useEffect(() => {
    if (isNew || isDirty) {
      // Reconstruct filters from hash — hash fully encodes them
      fetch(hash, JSON.parse(hash) as TransactionFilters)
    }
  }, [hash, isNew, isDirty, fetch])

  return {
    items: entry?.items ?? [],
    status: entry?.status ?? "idle",
  }
}
