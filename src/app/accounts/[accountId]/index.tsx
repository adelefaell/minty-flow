import { withObservables } from "@nozbe/watermelondb/react"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { useLayoutEffect, useMemo, useState } from "react"
import { StyleSheet, useUnistyles } from "react-native-unistyles"
import { startWith } from "rxjs"

import { DynamicIcon } from "~/components/dynamic-icon"
import { Money } from "~/components/money"
import { MonthYearPicker } from "~/components/month-year-picker"
import { TransactionFilterHeader } from "~/components/transaction/transaction-filter-header"
import { TransactionSectionList } from "~/components/transaction/transaction-section-list"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import {
  type AccountWithMonthTotals,
  getMonthRange,
  observeAccountModels,
  observeAccountWithMonthTotalsByIdAndRange,
} from "~/database/services/account-service"
import { observeCategoriesByType } from "~/database/services/category-service"
import { observeTags } from "~/database/services/tag-service"
import type { TransactionWithRelations } from "~/database/services/transaction-service"
import { observeTransactionModelsFull } from "~/database/services/transaction-service"
import { useTransfersPreferencesStore } from "~/stores/transfers-preferences.store"
import type { Category } from "~/types/categories"
import type { Tag } from "~/types/tags"
import type {
  GroupByOption,
  SearchState,
  TransactionListFilterState,
} from "~/types/transaction-filters"
import {
  DEFAULT_SEARCH_STATE,
  DEFAULT_TRANSACTION_LIST_FILTER_STATE,
} from "~/types/transaction-filters"
import { TransactionTypeEnum } from "~/types/transactions"
import { MONTH_NAMES } from "~/utils/time-utils"
import { buildTransactionListFilters } from "~/utils/transaction-list-utils"

const GROUP_BY_DISPLAY: Record<GroupByOption, string> = {
  hour: "By hour",
  day: "By day",
  week: "By week",
  month: "By month",
  year: "By year",
  allTime: "All time",
}

const EMPTY_TRANSACTIONS: TransactionWithRelations[] = []
const EMPTY_CATEGORIES: Category[] = []
const EMPTY_TAGS: Tag[] = []

interface AccountDetailsProps {
  account: AccountWithMonthTotals
  transactionsFull: TransactionWithRelations[]
  categoriesExpense: Category[]
  categoriesIncome: Category[]
  categoriesTransfer: Category[]
  tags: Tag[]
  selectedYear: number
  selectedMonth: number
  onMonthYearChange: (year: number, month: number) => void
  filterState: TransactionListFilterState
  onFilterChange: (state: TransactionListFilterState) => void
  searchState: SearchState
  onSearchApply: (state: SearchState) => void
}

const AccountDetailsScreenInner = ({
  account,
  transactionsFull = EMPTY_TRANSACTIONS,
  categoriesExpense = EMPTY_CATEGORIES,
  categoriesIncome = EMPTY_CATEGORIES,
  categoriesTransfer = EMPTY_CATEGORIES,
  tags = EMPTY_TAGS,
  selectedYear,
  selectedMonth,
  onMonthYearChange,
  filterState,
  onFilterChange,
  searchState,
  onSearchApply,
}: AccountDetailsProps) => {
  const router = useRouter()
  const navigation = useNavigation()
  const { theme } = useUnistyles()

  const [showFilters, setShowFilters] = useState(false)
  const [monthPickerOpen, setMonthPickerOpen] = useState(false)

  const categoriesByType = useMemo(
    () => ({
      expense: categoriesExpense,
      income: categoriesIncome,
      transfer: categoriesTransfer,
    }),
    [categoriesExpense, categoriesIncome, categoriesTransfer],
  )

  useLayoutEffect(() => {
    navigation.setOptions({
      title: account.name,
      headerRight: () => (
        <Button
          variant="ghost"
          size="icon"
          onPress={() =>
            router.push({
              pathname: "/accounts/[accountId]/modify",
              params: { accountId: account.id },
            })
          }
        >
          <IconSymbol name="pencil" size={20} />
        </Button>
      ),
    })
  }, [navigation, router, account.id, account.name])

  if (!account) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="default">Loading account...</Text>
        </View>
      </View>
    )
  }

  const displayMonthName = MONTH_NAMES[selectedMonth] ?? "Month"
  const net = account.monthNet
  const typeLabel = account.type.charAt(0).toUpperCase() + account.type.slice(1)

  const goPrevMonth = () => {
    if (selectedMonth <= 0) {
      onMonthYearChange(selectedYear - 1, 11)
    } else {
      onMonthYearChange(selectedYear, selectedMonth - 1)
    }
  }

  const goNextMonth = () => {
    if (selectedMonth >= 11) {
      onMonthYearChange(selectedYear + 1, 0)
    } else {
      onMonthYearChange(selectedYear, selectedMonth + 1)
    }
  }

  const headerContent = (
    <>
      {/* Account Header Card */}
      <View style={styles.headerCard}>
        {/* Top Row: Icon + Name/Meta */}
        <View style={styles.headerTopRow}>
          <DynamicIcon
            icon={account.icon || "wallet-bifold-outline"}
            size={32}
            variant="badge"
            colorScheme={account.colorScheme ?? undefined}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.accountName}>{account.name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{typeLabel}</Text>
              {account.isPrimary && (
                <>
                  <Text style={styles.metaSeparator}>/</Text>
                  <IconSymbol
                    name="star"
                    size={14}
                    color={theme.colors.customColors.warning}
                  />
                  <Text style={styles.primaryText}>Primary</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>CURRENT BALANCE</Text>
          <View style={styles.balanceRow}>
            <Money
              value={account.balance}
              currency={account.currencyCode}
              style={styles.balanceAmount}
            />
            <Text style={styles.currencyCode}>{account.currencyCode}</Text>
          </View>
        </View>
      </View>

      {/* Summary: Income & Expenses as side-by-side pill cards, Net in separate card below */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryPillCard}>
          <Money
            value={account.monthIn}
            currency={account.currencyCode}
            visualTone={TransactionTypeEnum.INCOME}
            style={styles.summaryPillAmount}
          />
        </View>
        <View style={styles.summaryPillCard}>
          <Money
            value={account.monthOut}
            currency={account.currencyCode}
            visualTone={TransactionTypeEnum.EXPENSE}
            style={styles.summaryPillAmount}
          />
        </View>
      </View>
      <View style={styles.summaryNetCard}>
        <Text style={styles.summaryNetLabel}>Net this month</Text>
        <Money
          value={net}
          currency={account.currencyCode}
          tone={
            net >= 0 ? TransactionTypeEnum.INCOME : TransactionTypeEnum.EXPENSE
          }
          showSign
          style={styles.summaryNetAmount}
        />
      </View>
    </>
  )

  return (
    <View style={styles.container}>
      {/* Top: month selector — left arrow, pill (month), right arrow */}
      <View style={styles.topMonthRow}>
        <Button variant="secondary" size="icon" onPress={goPrevMonth}>
          <IconSymbol
            name="chevron-left"
            size={24}
            color={theme.colors.onSurface}
          />
        </Button>
        <Pressable
          style={styles.monthHeaderButton}
          onPress={() => setMonthPickerOpen((v) => !v)}
        >
          <Text style={styles.monthHeaderButtonText}>{displayMonthName}</Text>
        </Pressable>
        <Button variant="secondary" size="icon" onPress={goNextMonth}>
          <IconSymbol
            name="chevron-right"
            size={24}
            color={theme.colors.onSurface}
          />
        </Button>
      </View>

      {/* Inline month/year picker */}
      {monthPickerOpen && (
        <View style={styles.monthPickerContainer}>
          <MonthYearPicker
            key={`${selectedYear}-${selectedMonth}`}
            initialYear={selectedYear}
            initialMonth={selectedMonth}
            onSelect={(y, m) => {
              onMonthYearChange(y, m)
              setMonthPickerOpen(false)
            }}
            onDone={() => setMonthPickerOpen(false)}
          />
        </View>
      )}

      {/* Row: By month | More options */}
      <View style={styles.filterToggleRow}>
        <Text style={styles.byLabel}>
          {GROUP_BY_DISPLAY[filterState.groupBy]}
        </Text>
        <Button
          variant="ghost"
          onPress={() => setShowFilters((v) => !v)}
          style={styles.moreOptionsButton}
        >
          <Text style={styles.moreOptionsText}>More options</Text>
        </Button>
      </View>

      {/* Filter header (when More options is on) */}
      {showFilters && (
        <TransactionFilterHeader
          accounts={[]}
          categoriesByType={categoriesByType}
          tags={tags}
          filterState={filterState}
          onFilterChange={onFilterChange}
          searchState={searchState}
          onSearchApply={onSearchApply}
          hiddenFilters={["accounts"]}
        />
      )}

      {/* Transaction list with account card + cash flow as ListHeaderComponent */}
      <TransactionSectionList
        transactionsFull={transactionsFull}
        filterState={filterState}
        showUpcoming
        ListHeaderComponent={headerContent}
      />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Header Card ──────────────────────────────────────────────
  headerCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    marginHorizontal: 20,
    marginTop: 8,
    padding: 20,
    gap: 15,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.secondary,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
    backgroundColor: theme.colors.secondary,
  },
  accountName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.onSecondary,
  },
  metaRow: {
    flexDirection: "row",
    backgroundColor: theme.colors.secondary,

    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.customColors.semi,
  },
  metaSeparator: {
    fontSize: 13,
    color: `${theme.colors.customColors.semi}60`,
    marginHorizontal: 2,
  },
  primaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.customColors.warning,
  },
  balanceSection: {
    gap: 4,
    paddingTop: 4,
    backgroundColor: theme.colors.secondary,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.customColors.semi,
    letterSpacing: 1,
  },
  balanceRow: {
    backgroundColor: theme.colors.secondary,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: theme.colors.onSecondary,
    letterSpacing: -0.5,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.customColors.semi,
  },

  // ── Top: Month selector (arrow | pill | arrow) ─────────────────
  topMonthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 6,
  },
  monthHeaderButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: theme.colors.radius,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  monthHeaderButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSecondary,
  },
  monthPickerContainer: {
    marginHorizontal: 20,
    marginVertical: 8,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    overflow: "hidden",
  },
  filterToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  byLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.customColors.semi,
  },
  moreOptionsButton: {
    alignSelf: "flex-end",
  },
  moreOptionsText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.customColors.semi,
  },

  // ── Summary: Income & Expense pills + Net card ─────────────────
  summaryRow: {
    flexDirection: "row",
    gap: 5,
    marginHorizontal: 20,
    marginTop: 5,
  },
  summaryPillCard: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryPillAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  summaryNetCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  summaryNetLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.onSecondary,
  },
  summaryNetAmount: {
    fontSize: 15,
    fontWeight: "700",
  },
}))

const EnhancedAccountDetailsScreen = withObservables(
  [
    "accountId",
    "selectedYear",
    "selectedMonth",
    "filterState",
    "searchState",
    "excludeFromTotals",
  ],
  ({
    accountId,
    selectedYear,
    selectedMonth,
    filterState,
    searchState,
    excludeFromTotals = true,
  }: {
    accountId: string
    selectedYear: number
    selectedMonth: number
    filterState: TransactionListFilterState
    searchState: SearchState
    excludeFromTotals?: boolean
  }) => {
    const { fromDate, toDate } = getMonthRange(selectedYear, selectedMonth)
    const queryFilters = buildTransactionListFilters(filterState, {
      fromDate,
      toDate,
      search: searchState.query,
      searchMatchType: searchState.matchType,
      searchIncludeNotes: searchState.includeNotes,
      accountId,
    })
    return {
      account: observeAccountWithMonthTotalsByIdAndRange(
        accountId,
        fromDate,
        toDate,
        excludeFromTotals,
      ),
      transactionsFull: observeTransactionModelsFull(queryFilters, [
        observeAccountModels(false),
        observeCategoriesByType(TransactionTypeEnum.EXPENSE),
        observeCategoriesByType(TransactionTypeEnum.INCOME),
        observeCategoriesByType(TransactionTypeEnum.TRANSFER),
      ]).pipe(startWith([] as TransactionWithRelations[])),
      categoriesExpense: observeCategoriesByType(
        TransactionTypeEnum.EXPENSE,
      ).pipe(startWith([] as Category[])),
      categoriesIncome: observeCategoriesByType(
        TransactionTypeEnum.INCOME,
      ).pipe(startWith([] as Category[])),
      categoriesTransfer: observeCategoriesByType(
        TransactionTypeEnum.TRANSFER,
      ).pipe(startWith([] as Category[])),
      tags: observeTags().pipe(startWith([] as Tag[])),
    }
  },
)(AccountDetailsScreenInner)

export default function AccountDetailsScreen() {
  const { accountId } = useLocalSearchParams<{ accountId: string }>()
  const [selectedYear, setSelectedYear] = useState(() =>
    new Date().getFullYear(),
  )
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().getMonth(),
  )
  const [filterState, setFilterState] = useState<TransactionListFilterState>(
    DEFAULT_TRANSACTION_LIST_FILTER_STATE,
  )
  const [searchState, setSearchState] =
    useState<SearchState>(DEFAULT_SEARCH_STATE)
  const excludeFromTotals = useTransfersPreferencesStore(
    (s) => s.excludeFromTotals,
  )

  const handleMonthYearChange = (year: number, month: number) => {
    setSelectedYear(year)
    setSelectedMonth(month)
  }

  if (!accountId) return null

  return (
    <EnhancedAccountDetailsScreen
      accountId={accountId}
      selectedYear={selectedYear}
      selectedMonth={selectedMonth}
      onMonthYearChange={handleMonthYearChange}
      filterState={filterState}
      onFilterChange={setFilterState}
      searchState={searchState}
      onSearchApply={setSearchState}
      excludeFromTotals={excludeFromTotals}
    />
  )
}
