import { Model } from "@nozbe/watermelondb"
import { date, field } from "@nozbe/watermelondb/decorators"

import type { Tag as TagType } from "../../types/tags"

/**
 * Tag model representing tags for categorizing transactions.
 *
 * Implements the Tag domain type, ensuring the persistence layer
 * conforms to the business logic contract.
 *
 * Follows WatermelonDB schema patterns:
 * - Column names use snake_case
 * - Boolean fields start with is_
 * - Date fields end with _at and use number type (Unix timestamps)
 */
export default class TagModel extends Model implements TagType {
  static table = "tags"

  @field("name") name!: string
  @field("color") color?: string
  @field("icon") icon?: string
  @field("usage_count") usageCount!: number
  @field("is_archived") isArchived!: boolean
  @date("created_at") createdAt!: Date
  @date("updated_at") updatedAt!: Date
}
