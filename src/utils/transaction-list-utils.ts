/**
 * Shared utilities for filtering, searching, and grouping transaction lists.
 * Used by both the home screen and account detail screen.
 */

import { addDays, endOfMonth, startOfMonth, startOfWeek } from "date-fns"

import type { TransactionWithRelations } from "~/database/services/transaction-service"
import type {
  GroupByOption,
  TransactionListFilterState,
} from "~/types/transaction-filters"
import type { TransactionType } from "~/types/transactions"
import { TransactionTypeEnum } from "~/types/transactions"
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

/** Build query filters for the DB: only date range. Client-side filtering is done separately. */
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

/** Apply filter state to fetched transactions (client-side). */
export function applyFiltersToTransactions(
  list: TransactionWithRelations[],
  filterState: TransactionListFilterState,
): TransactionWithRelations[] {
  return list.filter((row) => {
    // Hide pending transactions from the main list — they are shown in the
    // "Upcoming" section instead.  Only include them when the user explicitly
    // filters for "pending".
    if (row.transaction.isPending && filterState.pendingFilter !== "pending") {
      return false
    }
    if (
      filterState.accountIds.length > 0 &&
      !filterState.accountIds.includes(row.transaction.accountId)
    ) {
      return false
    }
    if (filterState.typeFilters.length > 0) {
      if (!filterState.typeFilters.includes(row.transaction.type)) return false
    }
    if (filterState.pendingFilter === "pending") {
      if (!row.transaction.isPending) return false
    } else if (filterState.pendingFilter === "notPending") {
      if (row.transaction.isPending) return false
    }
    if (filterState.attachmentFilter !== "all") {
      const raw = row.transaction.extra?.attachments
      let hasAttachments = false
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as unknown
          hasAttachments = Array.isArray(parsed)
            ? parsed.length > 0
            : typeof parsed === "object" &&
              parsed !== null &&
              Object.keys(parsed).length > 0
        } catch {
          hasAttachments = raw.length > 0
        }
      }
      if (filterState.attachmentFilter === "has" && !hasAttachments)
        return false
      if (filterState.attachmentFilter === "none" && hasAttachments)
        return false
    }
    if (
      filterState.categoryIds.length > 0 &&
      (!row.transaction.categoryId ||
        !filterState.categoryIds.includes(row.transaction.categoryId))
    ) {
      return false
    }
    if (filterState.tagIds.length > 0) {
      const rowTagIds = row.tags.map((t) => t.id)
      const hasSelectedTag = filterState.tagIds.some((id) =>
        rowTagIds.includes(id),
      )
      if (!hasSelectedTag) return false
    }
    return true
  })
}

/** Filter transactions by search query (title, description, amount, category name, account name). */
export function applySearchFilter(
  list: TransactionWithRelations[],
  query: string,
): TransactionWithRelations[] {
  if (!query.trim()) return list
  const lower = query.toLowerCase().trim()
  return list.filter((row) => {
    const title = row.transaction.title ?? ""
    const description = row.transaction.description ?? ""
    const amount = String(row.transaction.amount)
    const categoryName = row.category?.name ?? ""
    const accountName = row.account.name ?? ""
    return (
      title.toLowerCase().includes(lower) ||
      description.toLowerCase().includes(lower) ||
      amount.includes(lower) ||
      categoryName.toLowerCase().includes(lower) ||
      accountName.toLowerCase().includes(lower)
    )
  })
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
