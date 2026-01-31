/**
 * Transaction type definitions
 *
 * Pure domain types with no database dependencies.
 * These represent the business logic and UI contracts.
 * The WatermelonDB model implements these types, not the other way around.
 */

export const TransactionTypeEnum = {
  EXPENSE: "expense",
  INCOME: "income",
  TRANSFER: "transfer",
} as const

export type TransactionType =
  (typeof TransactionTypeEnum)[keyof typeof TransactionTypeEnum]

export interface TransactionLocation {
  latitude: number
  longitude: number
  address?: string
}

/**
 * Transaction domain type for UI/API usage.
 *
 * This is the single source of truth for the Transaction shape.
 * The WatermelonDB model implements this interface, ensuring
 * the persistence layer conforms to the domain model.
 */
export interface Transaction {
  id: string
  amount: number
  currencyCode: string
  type: TransactionType
  description?: string
  date: Date
  categoryId?: string | null // Optional - supports uncategorized transactions
  accountId: string
  tags?: string[] // Computed from JSON string in model
  location?: TransactionLocation // Computed from JSON string in model
  isPending: boolean
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}
