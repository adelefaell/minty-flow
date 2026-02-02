import { Model } from "@nozbe/watermelondb"
import { date, field, relation } from "@nozbe/watermelondb/decorators"

import type {
  Transaction,
  TransactionLocation,
  TransactionType,
} from "../../types/transactions"
import type AccountModel from "./Account"
import type CategoryModel from "./Category"

export default class TransactionModel extends Model implements Transaction {
  static table = "transactions"

  // Core transaction fields
  @field("type") type!: TransactionType // "expense" | "income" | "transfer"
  @date("transaction_date") transactionDate!: Date
  @field("is_deleted") isDeleted!: boolean
  @date("deleted_at") deletedAt?: Date
  @field("title") title?: string
  @field("description") description?: string
  @field("amount") amount!: number
  @field("currency") currency!: string
  @field("is_pending") isPending!: boolean

  // Additional fields
  @field("subtype") subtype?: string
  @field("extra") private extraJson!: string | null

  // Foreign key column + relation for category (nullable for uncategorized transactions)
  @field("category_id") categoryId!: string | null
  @relation("categories", "category_id") category!: CategoryModel | null

  // Foreign key column + relation for account (required)
  @field("account_id") accountId!: string
  @relation("accounts", "account_id") account!: AccountModel

  @field("location") private locationJson!: string | null

  @date("created_at") createdAt!: Date
  @date("updated_at") updatedAt!: Date

  /* ---------------- Domain adapters ---------------- */

  /**
   * Gets extra metadata as an object.
   * Returns parsed JSON or undefined if empty.
   */
  get extra(): Record<string, string> | undefined {
    if (!this.extraJson) return undefined
    try {
      return JSON.parse(this.extraJson) as Record<string, string>
    } catch {
      return undefined
    }
  }

  /**
   * Sets extra metadata from an object.
   */
  set extra(value: Record<string, string> | undefined) {
    this.extraJson = value ? JSON.stringify(value) : null
  }

  /**
   * Gets location as a string (as per the Transaction interface).
   * Returns the raw JSON string stored in the database.
   */
  get location(): string | undefined {
    return this.locationJson || undefined
  }

  /**
   * Sets location from a string.
   */
  set location(value: string | undefined) {
    this.locationJson = value || null
  }

  /**
   * Helper method to get location as an object.
   * Use this when you need to work with the parsed location data.
   */
  getLocationObject(): TransactionLocation | undefined {
    if (!this.locationJson) return undefined
    try {
      return JSON.parse(this.locationJson) as TransactionLocation
    } catch {
      return undefined
    }
  }

  /**
   * Helper method to set location from an object.
   * Use this when you want to store location data.
   */
  setLocationObject(value: TransactionLocation | undefined): void {
    this.locationJson = value ? JSON.stringify(value) : null
  }
}
