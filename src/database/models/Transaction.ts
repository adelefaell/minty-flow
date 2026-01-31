import { Model } from "@nozbe/watermelondb"
import { date, field, relation } from "@nozbe/watermelondb/decorators"

import type {
  Transaction,
  TransactionLocation,
  TransactionType,
} from "../../types/transactions"
import type AccountModel from "./Account"
import type CategoryModel from "./Category"

/**
 * Transaction persistence model for WatermelonDB.
 *
 * This is a persistence adapter that stores and retrieves transaction data.
 * It adapts between the domain type (Transaction) and the database schema.
 *
 * Follows WatermelonDB schema patterns:
 * - Column names use snake_case
 * - Boolean fields start with is_
 * - Date fields end with _at and use number type (Unix timestamps)
 * - Relations require BOTH @field (for the FK column) and @relation (for the model reference)
 * - Nullable fields use !: Type | null (not ?: Type)
 */
export default class TransactionModel extends Model implements Transaction {
  static table = "transactions"

  @field("amount") amount!: number
  @field("currency_code") currencyCode!: string
  @field("type") type!: TransactionType
  @field("description") description?: string
  @date("date") date!: Date

  // Foreign key column + relation for category (nullable for uncategorized transactions)
  @field("category_id") categoryId!: string | null
  @relation("categories", "category_id") category!: CategoryModel | null

  // Foreign key column + relation for account (required)
  @field("account_id") accountId!: string
  @relation("accounts", "account_id") account!: AccountModel

  @field("tags") tagsJson?: string // JSON array - stored as string for WatermelonDB
  @field("location") locationJson?: string // JSON object - stored as string for WatermelonDB
  @field("is_pending") isPending!: boolean
  @field("is_deleted") isDeleted!: boolean
  @date("created_at") createdAt!: Date
  @date("updated_at") updatedAt!: Date

  /**
   * Gets tags as an array.
   * This computed property satisfies the domain type's tags?: string[] requirement.
   */
  get tags(): string[] | undefined {
    if (!this.tagsJson) return undefined
    try {
      const parsed = JSON.parse(this.tagsJson) as string[]
      return parsed.length > 0 ? parsed : undefined
    } catch {
      return undefined
    }
  }

  /**
   * Sets tags from an array.
   */
  set tags(value: string[] | undefined) {
    this.tagsJson =
      value && value.length > 0 ? JSON.stringify(value) : undefined
  }

  /**
   * Gets location as an object.
   * This computed property satisfies the domain type's location?: TransactionLocation requirement.
   */
  get location(): TransactionLocation | undefined {
    if (!this.locationJson) return undefined
    try {
      return JSON.parse(this.locationJson) as TransactionLocation
    } catch {
      return undefined
    }
  }

  /**
   * Sets location from an object.
   */
  set location(value: TransactionLocation | undefined) {
    this.locationJson = value ? JSON.stringify(value) : undefined
  }

  /**
   * Legacy getter methods for backward compatibility.
   * @deprecated Use tags and location properties directly
   */
  get tagsArray(): string[] {
    return this.tags ?? []
  }

  setTagsArray(tags: string[]) {
    this.tags = tags
  }

  get locationObject(): TransactionLocation | undefined {
    return this.location
  }

  setLocationObject(location: TransactionLocation | undefined) {
    this.location = location
  }
}
