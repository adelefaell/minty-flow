/**
 * Shared utilities for filtering, searching, and grouping transaction lists.
 * Used by both the home screen and account detail screen.
 */

import { addDays, endOfMonth, startOfMonth, startOfWeek } from "date-fns"

import type { TransactionWithRelations } from "~/database/services/transaction-service"
import {
  TransferLayoutEnum,
  type TransferLayoutType,
} from "~/stores/transfers-preferences.store"
import type {
  GroupByOption,
  TransactionListFilterState,
} from "~/types/transaction-filters"
import type {
  TransactionListFilters,
  TransactionType,
} from "~/types/transactions"
import { TransactionTypeEnum } from "~/types/transactions"

/**
 * Apply transfer layout preference: when "combine", show one row per transfer (the source/debit row).
 * When "separate", show both debit and credit rows.
 */
export function applyTransferLayout(
  list: TransactionWithRelations[],
  layout: TransferLayoutType,
): TransactionWithRelations[] {
  if (layout === TransferLayoutEnum.SEPARATE) return list
  return list.filter((row) => {
    const t = row.transaction
    if (!t.isTransfer || !t.transferId) return true
    return t.amount < 0
  })
}

import {
  formatDateKey,
  formatHourKey,
  formatHourTitle,
  formatMonthKey,
  formatMonthTitle,
  formatSectionDateTitle,
  formatWeekKey,
  formatWeekTitle,
  formatYear,
} from "~/utils/time-utils"

/** Signed contribution for aggregation: income adds, expense subtracts, transfer is neutral. */
export function transactionContribution(
  type: TransactionType,
  amount: number,
): number {
  if (type === TransactionTypeEnum.INCOME) return amount
  if (type === TransactionTypeEnum.EXPENSE) return -amount
  return 0
}

/** Default date range: current month extended by timeframeDays so upcoming (e.g. recurring) can show. */
export function getDefaultDateRange(timeframeDays: number) {
  const now = new Date()
  const from = startOfMonth(now)
  const endOfMonthDate = endOfMonth(now)
  const extendedEnd = addDays(now, timeframeDays)
  return {
    fromDate: from.getTime(),
    toDate: Math.max(endOfMonthDate.getTime(), extendedEnd.getTime()),
  }
}

/** Build query filters for the DB: only date range. */
export function buildQueryFilters(
  selectedRange: { start: Date; end: Date } | null,
  homeTimeframe: number,
) {
  return selectedRange
    ? {
        fromDate: selectedRange.start.getTime(),
        toDate: selectedRange.end.getTime(),
      }
    : getDefaultDateRange(homeTimeframe)
}

/**
 * Single source of truth: convert UI filter state + date range + search
 * into the one object passed to the database query.
 * All structural filters go here; UI-only (groupBy, sort) stay in JS.
 */
export function buildTransactionListFilters(
  filterState: TransactionListFilterState,
  options: {
    fromDate: number
    toDate: number
    search?: string
    searchMatchType?: "smart" | "partial" | "exact" | "untitled"
    searchIncludeNotes?: boolean
    /** When on account detail, scope to this account. */
    accountId?: string
  },
): TransactionListFilters {
  const {
    fromDate,
    toDate,
    search,
    searchMatchType,
    searchIncludeNotes,
    accountId,
  } = options
  const filters: TransactionListFilters = {
    fromDate,
    toDate,
    includeDeleted: false,
  }
  if (accountId) {
    filters.accountId = accountId
  }
  if (filterState.accountIds.length > 0) {
    filters.accountIds = filterState.accountIds
  }
  if (filterState.categoryIds.length > 0) {
    filters.categoryIds = filterState.categoryIds
  }
  if (filterState.typeFilters.length > 0) {
    filters.typeFilters = filterState.typeFilters
  }
  if (filterState.pendingFilter === "pending") {
    filters.isPending = true
  } else if (filterState.pendingFilter === "notPending") {
    filters.isPending = false
  }
  const searchTrimmed = search?.trim()
  if (searchMatchType) filters.searchMatchType = searchMatchType
  if (searchTrimmed && searchTrimmed.length > 0) {
    filters.search = searchTrimmed
    if (searchIncludeNotes !== undefined)
      filters.searchIncludeNotes = searchIncludeNotes
  }
  if (filterState.tagIds.length > 0) {
    filters.tagIds = filterState.tagIds
  }
  if (filterState.attachmentFilter !== "all") {
    filters.attachmentFilter = filterState.attachmentFilter
  }
  return filters
}

export function getSectionKeyAndTitle(
  date: Date,
  groupBy: GroupByOption,
): { key: string; title: string } {
  switch (groupBy) {
    case "hour":
      return {
        key: formatHourKey(date),
        title: formatHourTitle(date),
      }
    case "day":
      return {
        key: formatDateKey(date),
        title: formatSectionDateTitle(date),
      }
    case "week": {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 })
      return {
        key: formatWeekKey(weekStart),
        title: formatWeekTitle(weekStart),
      }
    }
    case "month":
      return {
        key: formatMonthKey(date),
        title: formatMonthTitle(date),
      }
    case "year":
      return {
        key: formatYear(date),
        title: formatYear(date),
      }
    case "allTime":
      return { key: "all", title: "All time" }
    default:
      return {
        key: formatDateKey(date),
        title: formatSectionDateTitle(date),
      }
  }
}

export interface TransactionSection {
  title: string
  data: TransactionWithRelations[]
  totals: Record<string, number>
}

/** Group a sorted & filtered transaction list into sections by the chosen groupBy option. */
export function buildTransactionSections(
  list: TransactionWithRelations[],
  groupBy: GroupByOption,
): TransactionSection[] {
  if (list.length === 0) {
    return [{ title: "", data: [], totals: {} }]
  }

  const sortedList = [...list].sort((a, b) => {
    const tA = a.transaction.transactionDate
    const tB = b.transaction.transactionDate
    const timeA = tA instanceof Date ? tA.getTime() : tA
    const timeB = tB instanceof Date ? tB.getTime() : tB
    if (timeB !== timeA) return timeB - timeA
    const createdA =
      a.transaction.createdAt instanceof Date
        ? a.transaction.createdAt.getTime()
        : a.transaction.createdAt
    const createdB =
      b.transaction.createdAt instanceof Date
        ? b.transaction.createdAt.getTime()
        : b.transaction.createdAt
    return (createdB ?? 0) - (createdA ?? 0)
  })

  const grouped: Record<string, TransactionSection> = {}

  if (groupBy === "allTime") {
    const key = "all"
    grouped[key] = { title: "All time", data: [], totals: {} }
    for (const row of sortedList) {
      grouped[key].data.push(row)
      const currency = row.account.currencyCode
      const contribution = transactionContribution(
        row.transaction.type,
        row.transaction.amount,
      )
      grouped[key].totals[currency] =
        (grouped[key].totals[currency] || 0) + contribution
    }
  } else {
    for (const row of sortedList) {
      const t = row.transaction
      const d =
        t.transactionDate instanceof Date
          ? t.transactionDate
          : new Date(t.transactionDate)
      const { key: dateKey, title: headerTitle } = getSectionKeyAndTitle(
        d,
        groupBy,
      )

      if (!grouped[dateKey]) {
        grouped[dateKey] = { title: headerTitle, data: [], totals: {} }
      }

      grouped[dateKey].data.push(row)
      const currency = row.account.currencyCode
      const contribution = transactionContribution(t.type, t.amount)
      grouped[dateKey].totals[currency] =
        (grouped[dateKey].totals[currency] || 0) + contribution
    }
  }

  return Object.values(grouped).sort((a, b) => {
    if (a.data.length === 0 || b.data.length === 0) return 0
    return (
      b.data[0].transaction.transactionDate.getTime() -
      a.data[0].transaction.transactionDate.getTime()
    )
  })
}
