import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { useLayoutEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { StyleSheet } from "react-native-unistyles"

import { DynamicIcon } from "~/components/dynamic-icon"
import { Money } from "~/components/money"
import { MonthYearPicker } from "~/components/month-year-picker"
import { TransactionFilterHeader } from "~/components/transaction/transaction-filter-header"
import { TransactionSectionList } from "~/components/transaction/transaction-section-list"
import { Button } from "~/components/ui/button"
import { IconSvg } from "~/components/ui/icon-svg"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { getMonthRange } from "~/database/services-sqlite/account-service"
import { useCategoriesByType, useCategory } from "~/stores/db/category.store"
import { useTags } from "~/stores/db/tag.store"
import { useTransactions } from "~/stores/db/transaction.store"
import { getThemeStrict } from "~/styles/theme/registry"
import type {
  SearchState,
  TransactionListFilterState,
} from "~/types/transaction-filters"
import {
  DEFAULT_SEARCH_STATE,
  DEFAULT_TRANSACTION_LIST_FILTER_STATE,
} from "~/types/transaction-filters"
import { TransactionTypeEnum } from "~/types/transactions"

export default function CategoryDetailsScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>()
  const { t } = useTranslation()
  const router = useRouter()
  const navigation = useNavigation()

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
  const [showFilters, setShowFilters] = useState(false)

  const category = useCategory(categoryId ?? "")
  const categoriesExpense = useCategoriesByType(TransactionTypeEnum.EXPENSE)
  const categoriesIncome = useCategoriesByType(TransactionTypeEnum.INCOME)
  const categoriesTransfer = useCategoriesByType(TransactionTypeEnum.TRANSFER)
  const tags = useTags()

  const { fromDate, toDate } = useMemo(
    () => getMonthRange(selectedYear, selectedMonth),
    [selectedYear, selectedMonth],
  )

  const { items: transactionsFull } = useTransactions(
    categoryId
      ? {
          categoryId,
          from: new Date(fromDate).toISOString(),
          to: new Date(toDate).toISOString(),
        }
      : {},
  )

  const colorScheme = getThemeStrict(category?.colorSchemeName ?? null)

  const categoriesByType = useMemo(
    () => ({
      expense: categoriesExpense,
      income: categoriesIncome,
      transfer: categoriesTransfer,
    }),
    [categoriesExpense, categoriesIncome, categoriesTransfer],
  )

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
            r.type === TransactionTypeEnum.INCOME &&
            !r.isPending &&
            !r.isDeleted,
        )
        .reduce((sum, r) => sum + r.amount, 0),
    [transactionsFull],
  )

  const monthOut = useMemo(
    () =>
      transactionsFull
        .filter(
          (r) =>
            r.type === TransactionTypeEnum.EXPENSE &&
            !r.isPending &&
            !r.isDeleted,
        )
        .reduce((sum, r) => sum + r.amount, 0),
    [transactionsFull],
  )

  useLayoutEffect(() => {
    navigation.setOptions({
      title: category?.name ?? "",
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
          <Button
            variant={"ghost"}
            size="icon"
            onPress={() => setShowFilters((v) => !v)}
          >
            <IconSvg name={showFilters ? "filter-off" : "filter"} size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onPress={() =>
              router.push({
                pathname: "/settings/categories/[categoryId]/modify",
                params: { categoryId: category?.id ?? "" },
              })
            }
          >
            <IconSvg name="pencil" size={20} />
          </Button>
        </View>
      ),
    })
  }, [navigation, router, category?.id, category?.name, showFilters])

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

  const typeLabel =
    category.type.charAt(0).toUpperCase() + category.type.slice(1)

  const headerContent = (
    <>
      {/* Category Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <DynamicIcon
            icon={category.icon || "category"}
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
      <MonthYearPicker
        initialYear={selectedYear}
        initialMonth={selectedMonth}
        onSelect={(y, m) => {
          setSelectedYear(y)
          setSelectedMonth(m)
        }}
      />

      {showFilters && (
        <TransactionFilterHeader
          accounts={[]}
          categoriesByType={categoriesByType}
          tags={tags}
          filterState={filterState}
          onFilterChange={setFilterState}
          searchState={searchState}
          onSearchApply={setSearchState}
          hiddenFilters={["accounts", "categories"]}
        />
      )}

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
    borderRadius: theme.radius,
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
    fontSize: theme.typography.headlineSmall.fontSize,
    fontWeight: "700",
    color: theme.colors.onSecondary,
  },
  categoryType: {
    fontSize: theme.typography.bodyMedium.fontSize,
    fontWeight: "500",
    color: theme.colors.customColors.semi,
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
    borderRadius: theme.radius,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryPillAmount: {
    fontSize: theme.typography.bodyLarge.fontSize,
    fontWeight: "700",
  },
}))
