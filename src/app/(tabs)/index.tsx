import { withObservables } from "@nozbe/watermelondb/react"
import { addDays, endOfMonth, startOfMonth, startOfWeek } from "date-fns"
import { useRouter } from "expo-router"
import { Fragment, useCallback, useMemo, useRef, useState } from "react"
import { SectionList } from "react-native"
import type { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable"
import { StyleSheet, useUnistyles } from "react-native-unistyles"
import { startWith } from "rxjs"

import { DynamicIcon } from "~/components/dynamic-icon"
import { Money } from "~/components/money"
import { SummarySection } from "~/components/summary-card"
import { TransactionFilterHeader } from "~/components/transaction/transaction-filter-header"
import { TransactionItem } from "~/components/transaction/transaction-item"
import { UpcomingTransactionsSection } from "~/components/transaction/upcoming-transactions-section"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import {
  observeAccountModels,
  observeAccounts,
} from "~/database/services/account-service"
import { observeCategoriesByType } from "~/database/services/category-service"
import { observeTags } from "~/database/services/tag-service"
import type { TransactionWithRelations } from "~/database/services/transaction-service"
import {
  deleteTransactionModel,
  observeTransactionModelsFull,
} from "~/database/services/transaction-service"
import { useMoneyFormattingStore } from "~/stores/money-formatting.store"
import { usePendingTransactionsStore } from "~/stores/pending-transactions.store"
import { useProfileStore } from "~/stores/profile.store"
import type { Account } from "~/types/accounts"
import type { Category } from "~/types/categories"
import type { Tag } from "~/types/tags"
import type { TransactionListFilterState } from "~/types/transaction-filters"
import {
  DEFAULT_TRANSACTION_LIST_FILTER_STATE,
  type GroupByOption,
} from "~/types/transaction-filters"
import type {
  TransactionListFilters,
  TransactionType,
} from "~/types/transactions"
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
import { Toast } from "~/utils/toast"

/** Signed contribution for aggregation: income adds, expense subtracts, transfer is neutral. */
function transactionContribution(
  type: TransactionType,
  amount: number,
): number {
  if (type === TransactionTypeEnum.INCOME) return amount
  if (type === TransactionTypeEnum.EXPENSE) return -amount
  return 0
}

/** Default home range: current month extended by homeTimeframe days so upcoming (e.g. recurring) can show. */
function getDefaultHomeFilter(homeTimeframe: number) {
  const now = new Date()
  const from = startOfMonth(now)
  const endOfMonthDate = endOfMonth(now)
  const extendedEnd = addDays(now, homeTimeframe)
  return {
    fromDate: from.getTime(),
    toDate: Math.max(endOfMonthDate.getTime(), extendedEnd.getTime()),
  }
}

/** Build query filters for the DB: only date range. Filter by account/type/pending/attachments is applied client-side on fetched data. */
function buildQueryFilters(
  selectedRange: { start: Date; end: Date } | null,
  homeTimeframe: number,
): TransactionListFilters {
  return selectedRange
    ? {
        fromDate: selectedRange.start.getTime(),
        toDate: selectedRange.end.getTime(),
      }
    : getDefaultHomeFilter(homeTimeframe)
}

/** Apply filter state to fetched transactions (client-side). */
function applyFiltersToTransactions(
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

function getSectionKeyAndTitle(
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

interface HomeScreenProps {
  transactionsFull?: TransactionWithRelations[] | null
  accounts?: Account[]
  categoriesExpense?: Category[]
  categoriesIncome?: Category[]
  categoriesTransfer?: Category[]
  tags?: Tag[]
  filterState?: TransactionListFilterState
  onFilterChange?: (state: TransactionListFilterState) => void
  selectedRange?: { start: Date; end: Date } | null
  onDateRangeChange?: (range: { start: Date; end: Date } | null) => void
  searchQuery?: string
  onSearchApply?: (query: string) => void
}

/** Filter transactions by search query (title, description, amount, category name, account name). */
function applySearchFilter(
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

function HomeScreenInner({
  transactionsFull = [],
  accounts = [],
  categoriesExpense = [],
  categoriesIncome = [],
  categoriesTransfer = [],
  tags = [],
  filterState = DEFAULT_TRANSACTION_LIST_FILTER_STATE,
  onFilterChange,
  selectedRange = null,
  onDateRangeChange,
  searchQuery = "",
  onSearchApply,
}: HomeScreenProps) {
  const categoriesByType = useMemo(
    () => ({
      expense: categoriesExpense,
      income: categoriesIncome,
      transfer: categoriesTransfer,
    }),
    [categoriesExpense, categoriesIncome, categoriesTransfer],
  )
  const list = useMemo(() => {
    const filtered = applyFiltersToTransactions(
      transactionsFull ?? [],
      filterState,
    )
    return applySearchFilter(filtered, searchQuery)
  }, [transactionsFull, filterState, searchQuery])
  const router = useRouter()
  const { theme } = useUnistyles()
  const profileName = useProfileStore((s) => s.name)
  const image = useProfileStore((s) => s.imageUri)
  const { privacyMode: privacyModeEnabled, togglePrivacyMode: togglePrivacy } =
    useMoneyFormattingStore()

  const openSwipeableRef = useRef<SwipeableMethods | null>(null)

  const sections = useMemo(() => {
    if (list.length === 0) {
      return [
        {
          title: "",
          data: [] as TransactionWithRelations[],
          totals: {} as Record<string, number>,
        },
      ]
    }

    const groupBy = filterState.groupBy
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

    const grouped: Record<
      string,
      {
        title: string
        data: TransactionWithRelations[]
        totals: Record<string, number>
      }
    > = {}

    if (groupBy === "allTime") {
      const key = "all"
      grouped[key] = {
        title: "All time",
        data: [],
        totals: {},
      }
      sortedList.forEach((row) => {
        grouped[key].data.push(row)
        const currency = row.account.currencyCode
        const contribution = transactionContribution(
          row.transaction.type,
          row.transaction.amount,
        )
        grouped[key].totals[currency] =
          (grouped[key].totals[currency] || 0) + contribution
      })
    } else {
      sortedList.forEach((row) => {
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
          grouped[dateKey] = {
            title: headerTitle,
            data: [],
            totals: {},
          }
        }

        grouped[dateKey].data.push(row)
        const currency = row.account.currencyCode
        const contribution = transactionContribution(t.type, t.amount)
        grouped[dateKey].totals[currency] =
          (grouped[dateKey].totals[currency] || 0) + contribution
      })
    }

    return Object.values(grouped).sort((a, b) => {
      if (a.data.length === 0 || b.data.length === 0) return 0
      return (
        b.data[0].transaction.transactionDate.getTime() -
        a.data[0].transaction.transactionDate.getTime()
      )
    })
  }, [list, filterState.groupBy])

  const handleOnTransactionPress = useCallback(
    (transactionId: string) => {
      router.push({
        pathname: "/transaction/[id]",
        params: { id: transactionId },
      })
    },
    [router],
  )

  const handleDeleteTransaction = useCallback(
    async (transactionWithRelations: TransactionWithRelations) => {
      try {
        await deleteTransactionModel(transactionWithRelations.transaction)
        Toast.success({ title: "Moved to trash" })
      } catch {
        Toast.error({ title: "Failed to move to trash" })
      }
    },
    [],
  )

  const renderHeader = () => (
    <>
      <View style={styles.summaryContainer}>
        <SummarySection transactionsWithRelations={list} />
      </View>
      <UpcomingTransactionsSection
        transactions={transactionsFull ?? []}
        filterState={filterState}
        onTransactionPress={handleOnTransactionPress}
      />
    </>
  )

  const renderEmptyList = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="wallet" size={48} style={styles.emptyIcon} />
      <Text variant="default" style={styles.emptyTitle}>
        No transactions yet
      </Text>
      <Text variant="small" style={styles.emptySubtitle}>
        Transactions for this month will appear here
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push("/settings/edit-profile")}
          style={styles.greetingRow}
        >
          {image ? (
            <DynamicIcon icon={image} variant="raw" size={48} />
          ) : (
            <IconSymbol name="account" size={24} />
          )}
          <Text variant="large" style={styles.greetingText}>
            Hi, {profileName}!
          </Text>
        </Pressable>

        <Button variant="ghost" onPress={togglePrivacy}>
          <IconSymbol
            name={privacyModeEnabled ? "eye-off" : "eye"}
            size={24}
            color={
              privacyModeEnabled ? theme.colors.customColors.semi : undefined
            }
          />
        </Button>
      </View>

      {/* Inline filter header: pill bar + expandable filter panels */}
      {onFilterChange ? (
        <TransactionFilterHeader
          accounts={accounts}
          categoriesByType={categoriesByType}
          tags={tags}
          filterState={filterState}
          onFilterChange={onFilterChange}
          selectedRange={selectedRange}
          onDateRangeChange={onDateRangeChange}
          searchQuery={searchQuery}
          onSearchApply={onSearchApply}
        />
      ) : null}

      {/* Transactions List */}
      <SectionList
        sections={sections}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
        keyExtractor={(item) =>
          (item as TransactionWithRelations).transaction.id
        }
        renderItem={({ item }) => (
          <TransactionItem
            transactionWithRelations={item as TransactionWithRelations}
            onPress={() => handleOnTransactionPress(item.transaction.id)}
            onDelete={() =>
              handleDeleteTransaction(item as TransactionWithRelations)
            }
            onWillOpen={(methods) => {
              openSwipeableRef.current?.close()
              openSwipeableRef.current = methods
            }}
          />
        )}
        renderSectionHeader={({ section }) => {
          const s = section as unknown as {
            title: string
            data: TransactionWithRelations[]
            totals: Record<string, number>
          }
          if (!s.title && s.data.length === 0) return null
          return (
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text variant="h4" style={styles.sectionTitle}>
                  {s.title}
                </Text>
                <View style={styles.sectionDivider} />
              </View>
              <View style={styles.sectionTotalsContainer}>
                <View style={styles.totalsContainer}>
                  {Object.entries(s.totals).map(([curr, total], idx) => (
                    <Fragment key={curr + idx.toString()}>
                      <Text variant="small" style={styles.sectionTotal}>
                        {idx > 0 && "|"}
                      </Text>
                      <Money
                        variant="small"
                        style={styles.sectionTotal}
                        value={total}
                        currency={curr}
                        tone="auto"
                        visualTone="transfer"
                        showSign
                      />
                    </Fragment>
                  ))}
                </View>

                <Text variant="small" style={styles.sectionTotal}>
                  • {s.data.length} transactions
                </Text>
              </View>
            </View>
          )
        }}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const EnhancedHomeScreen = withObservables(
  ["selectedRange", "homeTimeframe"],
  ({
    selectedRange,
    homeTimeframe = 3,
  }: {
    selectedRange: { start: Date; end: Date } | null
    homeTimeframe?: number
  }) => ({
    transactionsFull: observeTransactionModelsFull(
      buildQueryFilters(selectedRange ?? null, homeTimeframe),
      [
        observeAccountModels(false),
        observeCategoriesByType(TransactionTypeEnum.EXPENSE),
        observeCategoriesByType(TransactionTypeEnum.INCOME),
        observeCategoriesByType(TransactionTypeEnum.TRANSFER),
      ],
    ).pipe(startWith([] as TransactionWithRelations[])),
    accounts: observeAccounts(false).pipe(startWith([] as Account[])),
    categoriesExpense: observeCategoriesByType(
      TransactionTypeEnum.EXPENSE,
    ).pipe(startWith([] as Category[])),
    categoriesIncome: observeCategoriesByType(TransactionTypeEnum.INCOME).pipe(
      startWith([] as Category[]),
    ),
    categoriesTransfer: observeCategoriesByType(
      TransactionTypeEnum.TRANSFER,
    ).pipe(startWith([] as Category[])),
    tags: observeTags().pipe(startWith([] as Tag[])),
  }),
)(HomeScreenInner)

function HomeScreen() {
  const [filterState, setFilterState] = useState<TransactionListFilterState>(
    DEFAULT_TRANSACTION_LIST_FILTER_STATE,
  )
  const [selectedRange, setSelectedRange] = useState<{
    start: Date
    end: Date
  } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const homeTimeframe = usePendingTransactionsStore((s) => s.homeTimeframe)
  return (
    <EnhancedHomeScreen
      filterState={filterState}
      onFilterChange={setFilterState}
      selectedRange={selectedRange}
      homeTimeframe={homeTimeframe}
      onDateRangeChange={setSelectedRange}
      searchQuery={searchQuery}
      onSearchApply={setSearchQuery}
    />
  )
}

export default HomeScreen

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: theme.colors.radius,
    padding: 10,
  },
  greetingText: {
    fontWeight: "bold",
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  listContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  emptyState: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: theme.colors.onSecondary,
    textAlign: "center",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.secondary,
    opacity: 0.5,
  },
  sectionTotalsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 5,
  },
  totalsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
  },
  sectionTotal: {
    fontWeight: "700",
    color: theme.colors.onSecondary,
    fontSize: 12,
  },
}))
