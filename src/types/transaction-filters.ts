import type { TransactionType } from "./transactions"
import { TransactionTypeEnum } from "./transactions"

export const PendingOptionsEnum = {
  ALL: "all",
  PENDING: "pending",
  NOT_PENDING: "notPending",
} as const

export type PendingOptionsType =
  (typeof PendingOptionsEnum)[keyof typeof PendingOptionsEnum]

/** How search text is matched: smart/partial = substring, exact = full string, untitled = no title. */
export type SearchMatchType = "smart" | "partial" | "exact" | "untitled"

/** Search panel state: query + match type + whether to include notes. */
export interface SearchState {
  query: string
  matchType: SearchMatchType
  includeNotes: boolean
}

export const DEFAULT_SEARCH_STATE: SearchState = {
  query: "",
  matchType: "smart",
  includeNotes: true,
}

/** UI filter state for the transaction list header. */
export interface TransactionListFilterState {
  /** Selected account IDs; empty = all accounts. */
  accountIds: string[]
  /** Selected category IDs; empty = all categories. */
  categoryIds: string[]
  /** Selected tag IDs; empty = all tags. */
  tagIds: string[]
  /** Pending filter: all, only pending, or only not pending. */
  pendingFilter: PendingOptionsType
  /** Selected transaction types; empty = all types. */
  typeFilters: TransactionType[]
  /** How to group sections in the list. */
  groupBy: GroupByOption
  /** Attachment filter: all, has attachments, or has no attachments. */
  attachmentFilter: AttachmentsOptionsType
}

export type GroupByOption =
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year"
  | "allTime"

export const GROUP_BY_OPTIONS: { id: GroupByOption; label: string }[] = [
  { id: "hour", label: "Hour" },
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
  { id: "allTime", label: "All time" },
]

export const PENDING_OPTIONS = [
  { id: PendingOptionsEnum.ALL, label: "All" },
  { id: PendingOptionsEnum.PENDING, label: "Pending" },
  { id: PendingOptionsEnum.NOT_PENDING, label: "Not Pending" },
]

export const TYPE_OPTIONS: { id: TransactionType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: TransactionTypeEnum.TRANSFER, label: "Transfer" },
  { id: TransactionTypeEnum.INCOME, label: "Income" },
  { id: TransactionTypeEnum.EXPENSE, label: "Expense" },
]

export const AttachmentsOptionsEnum = {
  ALL: "all",
  HAS: "has",
  NONE: "none",
} as const

export type AttachmentsOptionsType =
  (typeof AttachmentsOptionsEnum)[keyof typeof AttachmentsOptionsEnum]

export const ATTACHMENT_OPTIONS = [
  { id: AttachmentsOptionsEnum.ALL, label: "Attachments" },
  { id: AttachmentsOptionsEnum.HAS, label: "Has Attachments" },
  { id: AttachmentsOptionsEnum.NONE, label: "Has No Attachments" },
]

export const DEFAULT_TRANSACTION_LIST_FILTER_STATE: TransactionListFilterState =
  {
    accountIds: [],
    categoryIds: [],
    tagIds: [],
    pendingFilter: PendingOptionsEnum.ALL,
    typeFilters: [],
    groupBy: "day",
    attachmentFilter: AttachmentsOptionsEnum.ALL,
  }
