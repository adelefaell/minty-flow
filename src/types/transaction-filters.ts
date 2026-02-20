import type { TransactionType } from "./transactions"
import { TransactionTypeEnum } from "./transactions"

/** UI filter state for the transaction list header. */
export interface TransactionListFilterState {
  /** Selected account IDs; empty = all accounts. */
  accountIds: string[]
  /** Selected category IDs; empty = all categories. */
  categoryIds: string[]
  /** Selected tag IDs; empty = all tags. */
  tagIds: string[]
  /** Pending filter: all, only pending, or only not pending. */
  pendingFilter: "all" | "pending" | "notPending"
  /** Selected transaction types; empty = all types. */
  typeFilters: TransactionType[]
  /** How to group sections in the list. */
  groupBy: GroupByOption
  /** Attachment filter: all, has attachments, or has no attachments. */
  attachmentFilter: "all" | "has" | "none"
}

export type GroupByOption =
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year"
  | "allTime"

export const DEFAULT_TRANSACTION_LIST_FILTER_STATE: TransactionListFilterState =
  {
    accountIds: [],
    categoryIds: [],
    tagIds: [],
    pendingFilter: "all",
    typeFilters: [],
    groupBy: "day",
    attachmentFilter: "all",
  }

export const GROUP_BY_OPTIONS: { id: GroupByOption; label: string }[] = [
  { id: "hour", label: "Hour" },
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
  { id: "allTime", label: "All time" },
]

export const PENDING_OPTIONS = [
  { id: "all" as const, label: "All" },
  { id: "pending" as const, label: "Pending" },
  { id: "notPending" as const, label: "Not Pending" },
]

export const TYPE_OPTIONS: { id: TransactionType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: TransactionTypeEnum.TRANSFER, label: "Transfer" },
  { id: TransactionTypeEnum.INCOME, label: "Income" },
  { id: TransactionTypeEnum.EXPENSE, label: "Expense" },
]

export const ATTACHMENT_OPTIONS = [
  { id: "all" as const, label: "Attachments" },
  { id: "has" as const, label: "Has Attachments" },
  { id: "none" as const, label: "Has No Attachments" },
]
