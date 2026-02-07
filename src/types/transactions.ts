export type RecurringFrequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "yearly"
  | null

/** How a recurring transaction ends: never, on a specific date, or after N occurrences */
export type RecurringEndType = "never" | "date" | "occurrences"

/** Attachment metadata for transaction extra (e.g. file attachments) */
export interface TransactionAttachment {
  uri: string
  name: string
  size: number
  addedAt: Date
  ext: string
}

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
  type: TransactionType // "expense" | "income" | "transfer"
  transactionDate: Date
  isDeleted: boolean
  deletedAt?: Date
  title?: string
  description?: string
  amount: number
  currency: string
  isPending: boolean

  subtype?: string // More specific classification
  extra?: Record<string, string> // Custom metadata object (stored as JSON)

  categoryId?: string | null
  accountId: string
  location?: string
  createdAt: Date
  updatedAt: Date
}
