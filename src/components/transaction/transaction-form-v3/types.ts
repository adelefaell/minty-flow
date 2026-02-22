import type TransactionModel from "~/database/models/Transaction"
import type { Account } from "~/types/accounts"
import type { Category } from "~/types/categories"
import type { Tag } from "~/types/tags"
import type { TransactionType } from "~/types/transactions"

export type DatePickerTarget = "transaction" | "recurringStart" | "recurringEnd"

export interface TransactionFormV3Props {
  transaction: TransactionModel | null
  accounts: Account[]
  categories: Category[]
  tags: Tag[]
  transactionType: TransactionType
  onTransactionTypeChange: (type: TransactionType) => void
  initialTagIds?: string[]
}
