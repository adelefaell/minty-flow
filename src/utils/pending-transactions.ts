import type TransactionModel from "~/database/models/Transaction"

/**
 * Utility functions for pending transactions.
 *
 * Balance rule (Flutter parity): balance must EXCLUDE pending.
 * We store `is_pending`; account balance is only updated on create/update/delete
 * when the transaction is confirmed (!isPending). Pending transactions must never
 * bleed into the live balance.
 */

export interface Transaction {
  transactionDate: Date
  isPending: boolean
  isDeleted?: boolean
}

/**
 * "Effective" pending for display/filtering: true when the transaction should
 * be shown as upcoming. Flutter derives isPending from date (transactionDate > now);
 * we also store is_pending so we support manual "hold" for today/past.
 * Use this when building pending lists or excluding from balance.
 */
export function effectiveIsPending(
  tx: { transactionDate: Date; isPending: boolean },
  now: number = Date.now(),
): boolean {
  return tx.transactionDate.getTime() > now || tx.isPending === true
}

/**
 * Start of the next minute from the given date (or now).
 * Used as anchor to avoid boundary issues with "now" when deciding pending vs past.
 */
export function startOfNextMinute(anchor?: Date): Date {
  const d = anchor ?? new Date()
  const next = new Date(d)
  next.setSeconds(0, 0)
  next.setMinutes(next.getMinutes() + 1)
  return next
}

/**
 * End of the next minute (same as start of the minute after that).
 * Used for confirmable check: planned time has passed.
 */
export function endOfNextMinute(anchor?: Date): Date {
  const d = anchor ?? new Date()
  const next = new Date(d)
  next.setSeconds(59, 999)
  next.setMinutes(next.getMinutes() + 1)
  return next
}

/**
 * Check if a transaction can be confirmed.
 * A transaction is confirmable if:
 * 1. It is not deleted
 * 2. It's marked as pending (isPending === true)
 * 3. Its transaction date has passed relative to anchor
 *
 * Flutter equivalent: `Transaction.confirmable([DateTime? anchor])` checks
 * `isDeleted`, `isPending`, and `transactionDate.isPastAnchored(anchor ?? now.endOfNextMinute())`.
 *
 * @param transaction - The transaction to check
 * @param anchor - Optional anchor timestamp; defaults to endOfNextMinute() for consistency with Flutter
 * @returns true if the transaction can be confirmed
 */
export function confirmable(
  transaction: Transaction,
  anchor?: number,
): boolean {
  if (transaction.isDeleted) return false
  if (!transaction.isPending) return false
  const ref = anchor ?? endOfNextMinute().getTime()
  return transaction.transactionDate.getTime() <= ref
}

/**
 * Whether the transaction can be "held" (edge case: future and explicitly pending).
 * Not holdable if deleted or not pending.
 * Holdable if transactionDate is in the future and isPending is true.
 */
export function holdable(
  transaction: TransactionModel,
  anchor?: Date,
): boolean {
  if (transaction.isDeleted || !transaction.isPending) return false
  const ref = anchor ?? startOfNextMinute()
  return transaction.transactionDate.getTime() > ref.getTime()
}

/**
 * Split a list of transactions into confirmed (for balance/history) and pending.
 * - Confirmed: transactionDate <= now && isPending !== true → use for flow/balance.
 * - Pending: transactionDate > now || isPending === true → show in Pending section.
 */
export function splitByPendingStatus<
  T extends { transactionDate: Date; isPending: boolean },
>(
  items: T[],
  now: Date = startOfNextMinute(),
): { confirmed: T[]; pending: T[] } {
  const confirmed: T[] = []
  const pending: T[] = []
  for (const item of items) {
    const isPending =
      item.transactionDate.getTime() > now.getTime() || item.isPending === true
    if (isPending) pending.push(item)
    else confirmed.push(item)
  }
  return { confirmed, pending }
}
