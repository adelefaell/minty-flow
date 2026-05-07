import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { useShallow } from "zustand/react/shallow"

import { on } from "~/database/events"
import { mapCategory } from "~/database/mappers/category.mapper"
import { getAllCategories } from "~/database/repos/category-repo"
import type { Category } from "~/types/categories"

interface CategoryStoreState {
  byId: Record<string, Category>
  ids: string[]
  status: "idle" | "loading" | "ready"
  refreshAll: () => Promise<void>
}

let _gen = 0

export const useCategoryStore = create<CategoryStoreState>()(
  subscribeWithSelector((set) => ({
    byId: {},
    ids: [],
    status: "idle",

    refreshAll: async () => {
      const gen = ++_gen
      set({ status: "loading" })

      const rows = await getAllCategories()
      const byId: Record<string, Category> = {}
      const ids: string[] = []

      for (const row of rows) {
        const category = mapCategory(row)
        byId[category.id] = category
        ids.push(category.id)
      }

      if (_gen !== gen) return
      set({ byId, ids, status: "ready" })
    },
  })),
)

on("categories:dirty", () => {
  useCategoryStore.getState().refreshAll()
})

on("db:reset", () => {
  useCategoryStore.getState().refreshAll()
})

export function useCategories(): Category[] {
  return useCategoryStore(useShallow((s) => s.ids.map((id) => s.byId[id])))
}

export function useCategoriesByType(type: string): Category[] {
  return useCategoryStore(
    useShallow((s) =>
      s.ids.map((id) => s.byId[id]).filter((c) => c?.type === type),
    ),
  )
}

export function useCategory(id: string): Category | undefined {
  return useCategoryStore((s) => s.byId[id])
}

export function useCategoriesStatus() {
  return useCategoryStore((s) => s.status)
}
