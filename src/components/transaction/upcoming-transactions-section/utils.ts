import type { TransactionWithRelations } from "~/database/services/transaction-service"

export function isUpcoming(row: TransactionWithRelations, now: Date): boolean {
  return (
    row.transaction.isPending ||
    row.transaction.transactionDate.getTime() > now.getTime()
  )
}
