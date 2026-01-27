import { Q } from "@nozbe/watermelondb"
import type { Observable } from "@nozbe/watermelondb/utils/rx"

import { database } from "../index"
import type TagModel from "../models/Tag"

/**
 * Tag Service
 *
 * Provides functions for managing tag data.
 * Follows WatermelonDB CRUD pattern: https://watermelondb.dev/docs/CRUD
 */

/**
 * Get the tags collection
 */
const getTagCollection = () => {
  return database.get<TagModel>("tags")
}

/**
 * Get all tags
 */
export const getTags = async (includeArchived = false): Promise<TagModel[]> => {
  const tags = getTagCollection()
  if (includeArchived) {
    return await tags.query().fetch()
  }
  return await tags.query(Q.where("is_archived", false)).fetch()
}

/**
 * Find a tag by ID
 */
export const findTag = async (id: string): Promise<TagModel | null> => {
  try {
    return await getTagCollection().find(id)
  } catch {
    return null
  }
}

/**
 * Observe all tags reactively
 */
export const observeTags = (
  includeArchived = false,
): Observable<TagModel[]> => {
  const tags = getTagCollection()
  if (includeArchived) {
    return tags.query().observe()
  }
  return tags.query(Q.where("is_archived", false)).observe()
}

/**
 * Observe a specific tag by ID
 */
export const observeTagById = (id: string): Observable<TagModel> => {
  return getTagCollection().findAndObserve(id)
}

/**
 * Create a new tag
 */
export const createTag = async (data: {
  name: string
  color?: string
  icon?: string
}): Promise<TagModel> => {
  return await database.write(async () => {
    return await getTagCollection().create((tag) => {
      tag.name = data.name
      tag.color = data.color
      tag.icon = data.icon
      tag.usageCount = 0
      tag.isArchived = false
      tag.createdAt = new Date()
      tag.updatedAt = new Date()
    })
  })
}

/**
 * Update tag
 */
export const updateTag = async (
  tag: TagModel,
  updates: Partial<{
    name: string
    color: string | undefined
    icon: string | undefined
    usageCount: number
    isArchived: boolean
  }>,
): Promise<TagModel> => {
  return await database.write(async () => {
    return await tag.update((t) => {
      if (updates.name !== undefined) t.name = updates.name
      if (updates.color !== undefined) t.color = updates.color
      if (updates.icon !== undefined) t.icon = updates.icon
      if (updates.usageCount !== undefined) t.usageCount = updates.usageCount
      if (updates.isArchived !== undefined) t.isArchived = updates.isArchived
      t.updatedAt = new Date()
    })
  })
}

/**
 * Update tag by ID
 */
export const updateTagById = async (
  id: string,
  updates: Partial<{
    name: string
    color: string | undefined
    icon: string | undefined
    usageCount: number
    isArchived: boolean
  }>,
): Promise<TagModel> => {
  const tag = await findTag(id)
  if (!tag) {
    throw new Error(`Tag with id ${id} not found`)
  }
  return await updateTag(tag, updates)
}

/**
 * Increment tag usage count
 */
export const incrementTagUsage = async (tag: TagModel): Promise<TagModel> => {
  return await updateTag(tag, { usageCount: tag.usageCount + 1 })
}

/**
 * Delete tag (mark as deleted for sync)
 */
export const deleteTag = async (tag: TagModel): Promise<void> => {
  await database.write(async () => {
    await tag.markAsDeleted()
  })
}

/**
 * Permanently destroy tag
 */
export const destroyTag = async (tag: TagModel): Promise<void> => {
  await database.write(async () => {
    await tag.destroyPermanently()
  })
}
