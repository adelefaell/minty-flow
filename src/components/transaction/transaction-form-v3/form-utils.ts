import type TransactionModel from "~/database/models/transaction"
import type { TransactionFormValues } from "~/schemas/transactions.schema"
import type { Account } from "~/types/accounts"
import type { RecurringFrequency, TransactionType } from "~/types/transactions"
import {
  formatDayName,
  formatMonthDay,
  formatOrdinalDay,
} from "~/utils/time-utils"

export function getRecurrenceDisplayLabel(
  frequency: RecurringFrequency,
  startDate: Date,
): string {
  if (frequency === null) return "None"
  switch (frequency) {
    case "daily":
      return "Every day"
    case "weekly":
      return `Every week, ${formatDayName(startDate)}`
    case "biweekly":
      return `Every 2 weeks, ${formatDayName(startDate)}`
    case "monthly":
      return `Every month, ${formatOrdinalDay(startDate)}`
    case "yearly":
      return `Every year, ${formatMonthDay(startDate)}`
    default:
      return "None"
  }
}

export function getDefaultValues(
  transaction: TransactionModel | null,
  accounts: Account[],
  transactionType: TransactionType,
  initialTagIds: string[] = [],
): TransactionFormValues {
  const defaultAccountId =
    accounts.find((a) => a.isPrimary && !a.isArchived)?.id ?? ""

  if (!transaction) {
    return {
      amount: 0,
      type: transactionType,
      transactionDate: new Date(),
      accountId: defaultAccountId,
      toAccountId: transactionType === "transfer" ? "" : undefined,
      categoryId: null,
      title: transactionType === "transfer" ? "Transfer" : "",
      description: "",
      isPending: false,
      tags: [],
    }
  }
  const isTransfer =
    (transaction.type as TransactionType) === "transfer" &&
    transaction.isTransfer &&
    transaction.transferId
  const fromId =
    isTransfer && transaction.amount < 0
      ? transaction.accountId
      : isTransfer && transaction.relatedAccountId
        ? transaction.relatedAccountId
        : transaction.accountId
  const toId =
    isTransfer && transaction.amount > 0
      ? transaction.accountId
      : isTransfer && transaction.relatedAccountId
        ? transaction.relatedAccountId
        : ""
  return {
    amount: Math.abs(transaction.amount),
    type: (transaction.type as TransactionType) ?? transactionType,
    transactionDate: transaction.transactionDate,
    accountId: fromId,
    toAccountId: isTransfer ? toId : undefined,
    categoryId: transaction.categoryId,
    title: transaction.title ?? "",
    description: transaction.description ?? "",
    isPending: transaction.isPending,
    tags: initialTagIds,
  }
}

export function getFieldError(
  field: keyof TransactionFormValues,
  message: string | undefined,
): string | undefined {
  if (!message) return undefined
  if (field === "accountId")
    return "Please choose an account to save this transaction."
  if (field === "amount") return "Enter an amount greater than 0."
  return message
}

export function notesMarkdownStyles(theme: { colors: { onSurface: string } }) {
  const fg = theme.colors.onSurface
  return {
    body: { color: fg, fontSize: 15 },
    paragraph: { marginVertical: 4 },
    bullet_list: { marginVertical: 4 },
    ordered_list: { marginVertical: 4 },
    list_item: { marginVertical: 2 },
    strong: { fontWeight: "700" as const },
    em: { fontStyle: "italic" as const },
  }
}
