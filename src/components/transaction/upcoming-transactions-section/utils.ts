import type { TransactionWithRelations } from "~/database/services/transaction-service"

export function isUpcoming(row: TransactionWithRelations): boolean {
  return row.transaction.isPending || !!row.transaction.recurringId
}
