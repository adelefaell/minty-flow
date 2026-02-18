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
/**
 * Transaction domain type. Currency is not stored here; it is always derived
 * from the account (accountId). Type explains meaning; amount is the numeric value.
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
  isPending: boolean
  requiresManualConfirmation?: boolean

  subtype?: string // More specific classification
  extra?: Record<string, string> // Custom metadata object (stored as JSON)

  categoryId?: string | null
  accountId: string
  location?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Filters for transaction list queries (service layer).
 * All structural filters: database returns exactly the rows that exist.
 * Dates are Unix timestamps for WatermelonDB Q.gte / Q.lte.
 */
export interface TransactionListFilters {
  accountId?: string
  /** When set and non-empty, filter to these account IDs only. */
  accountIds?: string[]
  categoryId?: string
  /** When set and non-empty, filter to these category IDs only. */
  categoryIds?: string[]
  type?: TransactionType
  /** When set and non-empty, filter to these types only (income/expense/transfer). */
  typeFilters?: TransactionType[]
  isPending?: boolean
  includeDeleted?: boolean
  /** When true, return only soft-deleted transactions (for trash). */
  deletedOnly?: boolean
  /** Start of range (inclusive), Unix timestamp. */
  fromDate?: number
  /** End of range (inclusive), Unix timestamp. */
  toDate?: number
  /** Search in title and description (DB-side). */
  search?: string
  /** Min amount (inclusive). */
  minAmount?: number
  /** Max amount (inclusive). */
  maxAmount?: number
  /** When set and non-empty, only transactions that have at least one of these tags (DB join). */
  tagIds?: string[]
  /** Filter by attachment presence (DB column has_attachments). */
  attachmentFilter?: "all" | "has" | "none"
}

/**
 * Display shape for a transaction row when account and category are resolved.
 * Use this for list item props when you have hydrated data (e.g. TransactionWithRelations).
 */
/** Display row: transaction + resolved account/category. Currency from account. */
export interface TransactionDisplayRow {
  id: string
  type: TransactionType
  transactionDate: Date
  title?: string
  amount: number
  isPending: boolean
  accountName: string
  accountIcon?: string
  accountColorSchemeName?: string
  categoryName: string | null
  categoryIcon?: string | null
  categoryColorSchemeName?: string | null
}
