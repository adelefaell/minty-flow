import { withObservables } from "@nozbe/watermelondb/react"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { useLayoutEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
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
import { getMonthRange } from "~/database/services/account-service"
import {
  observeCategoriesByType,
  observeCategoryDetailsById,
} from "~/database/services/category-service"
import { observeTags } from "~/database/services/tag-service"
import {
  observeTransactionModelsFull,
  type TransactionWithRelations,
} from "~/database/services/transaction-service"
import { getThemeStrict } from "~/styles/theme/registry"
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

interface CategoryDetailsProps {
  category: Category
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

const CategoryDetailsScreenInner = ({
  category,
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
}: CategoryDetailsProps) => {
  const { t } = useTranslation()
  const router = useRouter()
  const navigation = useNavigation()
  const { theme } = useUnistyles()
  const [showFilters, setShowFilters] = useState(false)
  const [monthPickerOpen, setMonthPickerOpen] = useState(false)

  const colorScheme = getThemeStrict(category.colorSchemeName)

  const categoriesByType = useMemo(
    () => ({
      expense: categoriesExpense,
      income: categoriesIncome,
      transfer: categoriesTransfer,
    }),
    [categoriesExpense, categoriesIncome, categoriesTransfer],
  )

  // Derive dominant currency from transactions for summary stats
  const dominantCurrency = useMemo(() => {
    for (const r of transactionsFull) {
      const code = r.account?.currencyCode
      if (code) return code
    }
    return ""
  }, [transactionsFull])

  const monthIn = useMemo(
    () =>
      transactionsFull
        .filter(
          (r) =>
            r.transaction.type === TransactionTypeEnum.INCOME &&
            !r.transaction.isPending &&
            !r.transaction.isDeleted,
        )
        .reduce((sum, r) => sum + r.transaction.amount, 0),
    [transactionsFull],
  )

  const monthOut = useMemo(
    () =>
      transactionsFull
        .filter(
          (r) =>
            r.transaction.type === TransactionTypeEnum.EXPENSE &&
            !r.transaction.isPending &&
            !r.transaction.isDeleted,
        )
        .reduce((sum, r) => sum + r.transaction.amount, 0),
    [transactionsFull],
  )

  useLayoutEffect(() => {
    navigation.setOptions({
      title: category.name,
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
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
          <Button
            variant="ghost"
            size="icon"
            onPress={() =>
              router.push({
                pathname: "/settings/categories/[categoryId]/modify",
                params: { categoryId: category.id },
              })
            }
          >
            <IconSymbol name="pencil" size={20} />
          </Button>
        </View>
      ),
    })
  }, [navigation, router, category.id, category.name, showFilters])

  if (!category) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="default">
            {t("components.categories.form.loadingText")}
          </Text>
        </View>
      </View>
    )
  }

  const displayMonthName = MONTH_NAMES[selectedMonth] ?? "Month"
  const typeLabel =
    category.type.charAt(0).toUpperCase() + category.type.slice(1)

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
      {/* Category Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <DynamicIcon
            icon={category.icon || "shapes"}
            size={32}
            variant="badge"
            colorScheme={colorScheme}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryType}>{typeLabel}</Text>
          </View>
        </View>
      </View>

      {/* Summary: Income & Expense pill cards */}
      {dominantCurrency !== "" && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryPillCard}>
            <Money
              value={monthIn}
              currency={dominantCurrency}
              visualTone={TransactionTypeEnum.INCOME}
              style={styles.summaryPillAmount}
            />
          </View>
          <View style={styles.summaryPillCard}>
            <Money
              value={monthOut}
              currency={dominantCurrency}
              visualTone={TransactionTypeEnum.EXPENSE}
              style={styles.summaryPillAmount}
            />
          </View>
        </View>
      )}
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

      {/* Filter header (when toggled on) */}
      {showFilters && (
        <TransactionFilterHeader
          accounts={[]}
          categoriesByType={categoriesByType}
          tags={tags}
          filterState={filterState}
          onFilterChange={onFilterChange}
          searchState={searchState}
          onSearchApply={onSearchApply}
          hiddenFilters={["accounts", "categories"]}
        />
      )}

      {/* Transaction list with category card as ListHeaderComponent */}
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
  categoryName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.onSecondary,
  },
  categoryType: {
    fontSize: 13,
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

  // ── Summary: Income & Expense pills ─────────────────
  summaryRow: {
    flexDirection: "row",
    gap: 5,
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 5,
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
}))

const EnhancedCategoryDetailsScreen = withObservables(
  ["categoryId", "selectedYear", "selectedMonth", "filterState", "searchState"],
  ({
    categoryId,
    selectedYear,
    selectedMonth,
    filterState,
    searchState,
  }: {
    categoryId: string
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
      category: observeCategoryDetailsById(categoryId),
      transactionsFull: observeTransactionModelsFull({
        ...queryFilters,
        categoryId,
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
)(CategoryDetailsScreenInner)

export default function CategoryDetailsScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>()
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

  if (!categoryId) return null

  return (
    <EnhancedCategoryDetailsScreen
      categoryId={categoryId}
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
