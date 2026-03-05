import { withObservables } from "@nozbe/watermelondb/react"
import { useNavigation, useRouter } from "expo-router"
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { FlatList } from "react-native"
import type { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable"
import { StyleSheet, useUnistyles } from "react-native-unistyles"
import { startWith } from "rxjs"

import { MonthYearPicker } from "~/components/month-year-picker"
import { TransactionFilterHeader } from "~/components/transaction/transaction-filter-header"
import { TransactionItem } from "~/components/transaction/transaction-item"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { getMonthRange } from "~/database/services/account-service"
import { observeCategoriesByType } from "~/database/services/category-service"
import { observeTags } from "~/database/services/tag-service"
import {
  observeTransactionModelsFull,
  type TransactionWithRelations,
} from "~/database/services/transaction-service"
import type { Category } from "~/types/categories"
import type { Tag } from "~/types/tags"
import type {
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

const EMPTY_TRANSACTIONS: TransactionWithRelations[] = []
const EMPTY_CATEGORIES: Category[] = []
const EMPTY_TAGS: Tag[] = []

interface PendingScreenInnerProps {
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

function PendingScreenInner({
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
}: PendingScreenInnerProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const navigation = useNavigation()
  const { theme } = useUnistyles()
  const openSwipeableRef = useRef<SwipeableMethods | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [monthPickerOpen, setMonthPickerOpen] = useState(false)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          variant={"ghost"}
          size="icon"
          onPress={() => setShowFilters((v) => !v)}
        >
          <IconSymbol
            name={showFilters ? "filter-variant-remove" : "filter-variant"}
            size={20}
          />
        </Button>
      ),
    })
  }, [navigation, showFilters])

  const categoriesByType = useMemo(
    () => ({
      expense: categoriesExpense,
      income: categoriesIncome,
      transfer: categoriesTransfer,
    }),
    [categoriesExpense, categoriesIncome, categoriesTransfer],
  )

  const displayMonthName = MONTH_NAMES[selectedMonth] ?? "Month"

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

  const handlePress = useCallback(
    (item: TransactionWithRelations) => () => {
      router.push(`/transaction/${item.transaction.id}`)
    },
    [router],
  )

  const handleDeleteDone = useCallback(() => {
    openSwipeableRef.current?.close()
  }, [])

  const renderItem = useCallback(
    ({ item }: { item: TransactionWithRelations }) => (
      <TransactionItem
        transactionWithRelations={item}
        onPress={handlePress(item)}
        onDelete={handleDeleteDone}
        onWillOpen={(methods) => {
          openSwipeableRef.current?.close()
          openSwipeableRef.current = methods
        }}
      />
    ),
    [handlePress, handleDeleteDone],
  )

  const keyExtractor = useCallback(
    (item: TransactionWithRelations) => item.transaction.id,
    [],
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
          hiddenFilters={["accounts", "pending"]}
        />
      )}

      <FlatList
        contentContainerStyle={[
          styles.content,
          transactionsFull.length === 0 && styles.contentEmpty,
        ]}
        ListEmptyComponent={
          <View style={styles.placeholder}>
            <Text variant="small" style={styles.placeholderText}>
              {t("screens.settings.pending.empty")}
            </Text>
          </View>
        }
        data={transactionsFull}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    </View>
  )
}

const EnhancedPendingScreen = withObservables(
  ["selectedYear", "selectedMonth", "filterState", "searchState"],
  ({
    selectedYear,
    selectedMonth,
    filterState,
    searchState,
  }: {
    selectedYear: number
    selectedMonth: number
    filterState: TransactionListFilterState
    searchState: SearchState
  }) => {
    const { fromDate, toDate } = getMonthRange(selectedYear, selectedMonth)
    const queryFilters = buildTransactionListFilters(filterState, {
      fromDate,
      toDate,
      search: searchState.query,
      searchMatchType: searchState.matchType,
      searchIncludeNotes: searchState.includeNotes,
    })
    return {
      transactionsFull: observeTransactionModelsFull({
        ...queryFilters,
        isPending: true,
      }).pipe(startWith([] as TransactionWithRelations[])),
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
)(PendingScreenInner)

export default function PendingTransactionsScreen() {
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

  const handleMonthYearChange = (year: number, month: number) => {
    setSelectedYear(year)
    setSelectedMonth(month)
  }

  return (
    <EnhancedPendingScreen
      selectedYear={selectedYear}
      selectedMonth={selectedMonth}
      onMonthYearChange={handleMonthYearChange}
      filterState={filterState}
      onFilterChange={setFilterState}
      searchState={searchState}
      onSearchApply={setSearchState}
    />
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  contentEmpty: {
    flexGrow: 1,
  },
  placeholder: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: theme.colors.onSecondary,
    textAlign: "center",
  },

  // ── Month selector ──────────────────────────────────────────────
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
}))
