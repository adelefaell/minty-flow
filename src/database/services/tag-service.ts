import { Q } from "@nozbe/watermelondb"
import type { Observable } from "@nozbe/watermelondb/utils/rx"
import { map } from "rxjs/operators"

import type { Tag, TagKindType } from "../../types/tags"
import { database } from "../index"
import type TagModel from "../models/Tag"
import { modelToTag } from "../utils/model-to-tag"

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
export const getTags = async (): Promise<TagModel[]> => {
  const tags = getTagCollection()
  return await tags.query().fetch()
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
export const observeTags = (): Observable<Tag[]> => {
  const tags = getTagCollection()
  return tags
    .query(Q.sortBy("name", Q.asc))
    .observeWithColumns([
      "name",
      "type",
      "color_scheme_name",
      "icon",
      "transaction_count",
    ])
    .pipe(
      map((results) => {
        return results.map(modelToTag) // convert to immutable plain object here
      }),
    )
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
  type: TagKindType
  colorSchemeName?: string
  icon?: string
}): Promise<TagModel> => {
  return await database.write(async () => {
    return await getTagCollection().create((tag) => {
      tag.name = data.name
      tag.type = data.type
      tag.colorSchemeName = data.colorSchemeName
      tag.icon = data.icon
      tag.transactionCount = 0
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
    type: TagKindType
    colorSchemeName: string | undefined
    icon: string | undefined
    transactionCount: number
  }>,
): Promise<TagModel> => {
  return await database.write(async () => {
    return await tag.update((t) => {
      if (updates.name !== undefined) t.name = updates.name
      if (updates.type !== undefined) t.type = updates.type
      if (updates.colorSchemeName !== undefined)
        t.colorSchemeName = updates.colorSchemeName
      if (updates.icon !== undefined) t.icon = updates.icon
      if (updates.transactionCount !== undefined)
        t.transactionCount = updates.transactionCount
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
    type: TagKindType
    colorSchemeName: string | undefined
    icon: string | undefined
    transactionCount: number
  }>,
): Promise<TagModel> => {
  const tag = await findTag(id)
  if (!tag) {
    throw new Error(`Tag with id ${id} not found`)
  }
  return await updateTag(tag, updates)
}

/**
 * Increment tag transaction count
 */
export const incrementTagUsage = async (tag: TagModel): Promise<TagModel> => {
  return await updateTag(tag, {
    transactionCount: tag.transactionCount + 1,
  })
}

/**
 * Delete tag
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
