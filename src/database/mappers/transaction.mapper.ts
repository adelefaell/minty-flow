import type { Transaction, TransactionType } from "~/types/transactions"

import type { RowTransaction } from "../types/rows"

export function mapTransaction(row: RowTransaction): Transaction {
  return {
    id: row.id,
    type: row.type as TransactionType,
    transactionDate: new Date(row.transaction_date),
    title: row.title,
    description: row.description,
    amount: row.amount,
    isDeleted: !!row.is_deleted,
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    isPending: !!row.is_pending,
    requiresManualConfirmation:
      row.requires_manual_confirmation === null
        ? null
        : !!row.requires_manual_confirmation,
    isTransfer: !!row.is_transfer,
    transferId: row.transfer_id,
    relatedAccountId: row.related_account_id,
    accountBalanceBefore: row.account_balance_before,
    subtype: row.subtype,
    extra: row.extra ? (JSON.parse(row.extra) as Record<string, string>) : null,
    categoryId: row.category_id,
    accountId: row.account_id,
    goalId: row.goal_id,
    budgetId: row.budget_id,
    loanId: row.loan_id,
    location: row.location,
    recurringId: row.recurring_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}
