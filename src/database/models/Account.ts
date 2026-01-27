import { Model } from "@nozbe/watermelondb"
import { date, field } from "@nozbe/watermelondb/decorators"

import type { Account, AccountType } from "../../types/accounts"

/**
 * Account model representing user financial accounts.
 *
 * Implements the Account domain type, ensuring the persistence layer
 * conforms to the business logic contract.
 *
 * Follows WatermelonDB schema patterns:
 * - Column names use snake_case
 * - Boolean fields start with is_
 * - Date fields end with _at and use number type (Unix timestamps)
 */
export default class AccountModel extends Model implements Account {
  static table = "accounts"

  @field("name") name!: string
  @field("type") type!: AccountType
  @field("balance") balance!: number
  @field("currency_code") currencyCode!: string
  @field("icon") icon?: string
  @field("color") color?: string
  @field("is_archived") isArchived!: boolean
  @date("created_at") createdAt!: Date
  @date("updated_at") updatedAt!: Date
}
