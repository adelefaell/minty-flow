import type { TransactionWithRelations } from "~/database/services/transaction-service"

export interface UpcomingTransactionsSectionProps {
  transactions: TransactionWithRelations[]
  onTransactionPress: (transactionId: string) => void
}
