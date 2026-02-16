import { withObservables } from "@nozbe/watermelondb/react"
import { useRouter } from "expo-router"
import { useMemo, useState } from "react"
import { StyleSheet, useUnistyles } from "react-native-unistyles"
import { startWith } from "rxjs"

import { DynamicIcon } from "~/components/dynamic-icon"
import { SummarySection } from "~/components/summary-card"
import { TransactionFilterHeader } from "~/components/transaction/transaction-filter-header"
import { TransactionSectionList } from "~/components/transaction/transaction-section-list"
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
import { observeTransactionModelsFull } from "~/database/services/transaction-service"
import { useMoneyFormattingStore } from "~/stores/money-formatting.store"
import { usePendingTransactionsStore } from "~/stores/pending-transactions.store"
import { useProfileStore } from "~/stores/profile.store"
import type { Account } from "~/types/accounts"
import type { Category } from "~/types/categories"
import type { Tag } from "~/types/tags"
import type { TransactionListFilterState } from "~/types/transaction-filters"
import { DEFAULT_TRANSACTION_LIST_FILTER_STATE } from "~/types/transaction-filters"
import { TransactionTypeEnum } from "~/types/transactions"
import {
  applyFiltersToTransactions,
  applySearchFilter,
  buildQueryFilters,
} from "~/utils/transaction-list-utils"

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

  // Filtered list used only for the SummarySection header
  const filteredList = useMemo(() => {
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

  const summaryHeader = useMemo(
    () => (
      <View style={styles.summaryContainer}>
        <SummarySection transactionsWithRelations={filteredList} />
      </View>
    ),
    [filteredList],
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
      <TransactionSectionList
        transactionsFull={transactionsFull ?? []}
        filterState={filterState}
        searchQuery={searchQuery}
        showUpcoming
        ListHeaderComponent={summaryHeader}
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
}))
