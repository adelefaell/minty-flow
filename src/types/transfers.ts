/**
 * Transfer type definitions
 *
 * Pure domain types with no database dependencies.
 * First-class metadata for a transfer pair (debit + credit transaction rows).
 * The WatermelonDB Transfer model implements this interface.
 */

/**
 * Transfer domain type for UI/API usage.
 *
 * Links the two transaction rows and stores the conversion rate used
 * when from/to accounts have different currencies.
 */
export interface Transfer {
  id: string
  fromTransactionId: string
  toTransactionId: string
  fromAccountId: string
  toAccountId: string
  /** Rate (to-currency per 1 from-currency) used for the credit amount. 1 for same-currency. */
  conversionRate: number
  createdAt: Date
  updatedAt: Date
}
