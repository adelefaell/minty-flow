import { type TransactionType, TransactionTypeEnum } from "~/types/transactions"
import { logger } from "~/utils/logger"

/**
 * Compute the signed balance delta for a transaction.
 *
 * This is the single source of truth for balance-delta logic shared by
 * `balance-service` and `transaction-service`. Changes here propagate to both.
 *
 * | Type | `amount` on row | Delta |
 * |---|---|---|
 * | `INCOME` | positive | `+amount` |
 * | `EXPENSE` | positive | `−amount` |
 * | `TRANSFER` | pre-signed by writer | `amount` (pass-through) |
 *
 * Transfer rows carry pre-signed amounts: the debit row has a negative amount
 * and the credit row has a positive amount. A positive amount on a transfer
 * row indicates the caller broke the sign contract — a warning is logged.
 *
 * @param amount - The raw `amount` column value from the transaction row.
 *   Always positive for income/expense; pre-signed for transfers.
 * @param type - The transaction type (`INCOME`, `EXPENSE`, or `TRANSFER`).
 * @returns The signed number to add to the account balance.
 */
export const getBalanceDelta = (
  amount: number,
  type: TransactionType,
): number => {
  if (type === TransactionTypeEnum.TRANSFER && amount > 0) {
    // Transfer amounts must be pre-signed by the caller (debit row negative, credit row positive).
    // A positive amount on a transfer row indicates the sign contract was not applied upstream.
    logger.warn("[getBalanceDelta] Transfer amount should be pre-signed:", {
      amount,
    })
  }
  if (type === TransactionTypeEnum.INCOME) return amount
  if (type === TransactionTypeEnum.TRANSFER) return amount // signed amount on row
  return -amount // expense (money out of account)
}
