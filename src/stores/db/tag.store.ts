import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { useShallow } from "zustand/react/shallow"

import { on } from "~/database/events"
import { mapTag } from "~/database/mappers/tag.mapper"
import { getAllTags } from "~/database/repos/tag-repo"
import type { Tag } from "~/types/tags"

interface TagStoreState {
  byId: Record<string, Tag>
  ids: string[]
  status: "idle" | "loading" | "ready"
  refreshAll: () => Promise<void>
}

let _gen = 0

export const useTagStore = create<TagStoreState>()(
  subscribeWithSelector((set) => ({
    byId: {},
    ids: [],
    status: "idle",

    refreshAll: async () => {
      const gen = ++_gen
      set({ status: "loading" })

      const rows = await getAllTags()
      const byId: Record<string, Tag> = {}
      const ids: string[] = []

      for (const row of rows) {
        const tag = mapTag(row)
        byId[tag.id] = tag
        ids.push(tag.id)
      }

      if (_gen !== gen) return
      set({ byId, ids, status: "ready" })
    },
  })),
)

on("tags:dirty", () => {
  useTagStore.getState().refreshAll()
})

on("db:reset", () => {
  useTagStore.getState().refreshAll()
})

export function useTags(): Tag[] {
  return useTagStore(useShallow((s) => s.ids.map((id) => s.byId[id])))
}

export function useTag(id: string): Tag | undefined {
  return useTagStore((s) => s.byId[id])
}

export function useTagsStatus() {
  return useTagStore((s) => s.status)
}
