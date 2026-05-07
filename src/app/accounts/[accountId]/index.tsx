import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { useCallback, useLayoutEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { ConfirmModal } from "~/components/confirm-modal"
import { DynamicIcon } from "~/components/dynamic-icon"
import { Money } from "~/components/money"
import { MonthYearPicker } from "~/components/month-year-picker"
import { TransactionFilterHeader } from "~/components/transaction/transaction-filter-header"
import { TransactionSectionList } from "~/components/transaction/transaction-section-list"
import { Button } from "~/components/ui/button"
import { IconSvg } from "~/components/ui/icon-svg"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import {
  destroyAccount,
  getMonthRange,
  unarchiveAccount,
} from "~/database/services-sqlite/account-service"
import { useAccount } from "~/stores/db/account.store"
import { useCategoriesByType } from "~/stores/db/category.store"
import { useTags } from "~/stores/db/tag.store"
import { useTransactions } from "~/stores/db/transaction.store"
import { useTransfersPreferencesStore } from "~/stores/transfers-preferences.store"
import type {
  SearchState,
  TransactionListFilterState,
} from "~/types/transaction-filters"
import {
  DEFAULT_SEARCH_STATE,
  DEFAULT_TRANSACTION_LIST_FILTER_STATE,
} from "~/types/transaction-filters"
import { TransactionTypeEnum } from "~/types/transactions"
import { logger } from "~/utils/logger"
import { Toast } from "~/utils/toast"

export default function AccountDetailsScreen() {
  const { accountId } = useLocalSearchParams<{ accountId: string }>()
  const { t } = useTranslation()
  const router = useRouter()
  const navigation = useNavigation()
  const { theme } = useUnistyles()

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
  const [unarchiveModalVisible, setUnarchiveModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  const account = useAccount(accountId ?? "")
  const categoriesExpense = useCategoriesByType(TransactionTypeEnum.EXPENSE)
  const categoriesIncome = useCategoriesByType(TransactionTypeEnum.INCOME)
  const categoriesTransfer = useCategoriesByType(TransactionTypeEnum.TRANSFER)
  const tags = useTags()
  const excludeFromTotals = useTransfersPreferencesStore(
    (s) => s.excludeFromTotals,
  )

  const { fromDate, toDate } = useMemo(
    () => getMonthRange(selectedYear, selectedMonth),
    [selectedYear, selectedMonth],
  )

  const { items: transactionsFull } = useTransactions(
    accountId
      ? {
          accountIds: [accountId],
          from: new Date(fromDate).toISOString(),
          to: new Date(toDate).toISOString(),
        }
      : {},
  )

  const { monthIn, monthOut, monthNet } = useMemo(() => {
    let in_ = 0
    let out = 0
    for (const t of transactionsFull) {
      if (t.isPending || t.isDeleted) continue
      if (t.type === TransactionTypeEnum.INCOME) {
        in_ += t.amount
      } else if (t.type === TransactionTypeEnum.EXPENSE) {
        out += t.amount
      } else if (!excludeFromTotals && t.isTransfer) {
        if (t.amount > 0) in_ += t.amount
        else out += Math.abs(t.amount)
      }
    }
    return { monthIn: in_, monthOut: out, monthNet: in_ - out }
  }, [transactionsFull, excludeFromTotals])

  const categoriesByType = useMemo(
    () => ({
      expense: categoriesExpense,
      income: categoriesIncome,
      transfer: categoriesTransfer,
    }),
    [categoriesExpense, categoriesIncome, categoriesTransfer],
  )

  const isArchived = account?.isArchived ?? false

  const handleDelete = useCallback(async () => {
    if (!accountId) return
    try {
      await destroyAccount(accountId)
      router.back()
    } catch (error) {
      logger.error("Error deleting account", { error })
      Toast.error({
        title: t("common.toast.error"),
        description: t("screens.accounts.form.toast.deleteFailed"),
      })
    }
  }, [accountId, t, router])

  const handleUnarchive = useCallback(async () => {
    if (!accountId) return
    try {
      await unarchiveAccount(accountId)
      Toast.success({ title: t("screens.accounts.unarchiveSuccess") })
    } catch (error) {
      logger.error("Error unarchiving account", { error })
      Toast.error({ title: t("common.toast.error") })
    }
  }, [accountId, t])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: account?.name ?? "",
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
          <Button
            variant={"ghost"}
            size="icon"
            onPress={() => setShowFilters((v) => !v)}
          >
            <IconSvg name={showFilters ? "filter-off" : "filter"} size={20} />
          </Button>
          {isArchived ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onPress={() => setDeleteModalVisible(true)}
              >
                <IconSvg name="trash" size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onPress={() => setUnarchiveModalVisible(true)}
              >
                <IconSvg name="archive-off" size={20} />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onPress={() =>
                router.push({
                  pathname: "/accounts/[accountId]/modify",
                  params: { accountId: account?.id ?? "" },
                })
              }
            >
              <IconSvg name="pencil" size={20} />
            </Button>
          )}
        </View>
      ),
    })
  }, [navigation, router, account?.id, account?.name, showFilters, isArchived])

  if (!account) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="default">
            {t("screens.accounts.form.loadingText")}
          </Text>
        </View>
      </View>
    )
  }

  const typeLabel = account.type.charAt(0).toUpperCase() + account.type.slice(1)

  const headerContent = (
    <>
      {/* Account Header Card */}
      <View style={styles.headerCard}>
        {/* Top Row: Icon + Name/Meta */}
        <View style={styles.headerTopRow}>
          <DynamicIcon
            icon={account.icon || "wallet"}
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
                  <IconSvg
                    name="star"
                    size={14}
                    color={theme.colors.customColors.warning}
                  />
                  <Text style={styles.primaryText}>
                    {t("screens.accounts.card.primary")}
                  </Text>
                </>
              )}
              {isArchived && (
                <>
                  <Text style={styles.metaSeparator}>/</Text>
                  <View style={styles.archivedContainer}>
                    <IconSvg name="archive" size={14} />
                    <Text style={styles.archivedText}>
                      {t("screens.accounts.card.archived")}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>
            {t("screens.accounts.card.currentBalance")}
          </Text>
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
            value={monthIn}
            currency={account.currencyCode}
            visualTone={TransactionTypeEnum.INCOME}
            style={styles.summaryPillAmount}
          />
        </View>
        <View style={styles.summaryPillCard}>
          <Money
            value={monthOut}
            currency={account.currencyCode}
            visualTone={TransactionTypeEnum.EXPENSE}
            style={styles.summaryPillAmount}
          />
        </View>
      </View>
      <View style={styles.summaryNetCard}>
        <Text style={styles.summaryNetLabel}>
          {t("screens.accounts.card.netThisMonth")}
        </Text>
        <Money
          value={monthNet}
          currency={account.currencyCode}
          tone={
            monthNet >= 0
              ? TransactionTypeEnum.INCOME
              : TransactionTypeEnum.EXPENSE
          }
          showSign
          style={styles.summaryNetAmount}
        />
      </View>
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
          hiddenFilters={["accounts"]}
        />
      )}

      <TransactionSectionList
        transactionsFull={transactionsFull}
        filterState={filterState}
        showUpcoming
        ListHeaderComponent={headerContent}
      />

      <ConfirmModal
        visible={unarchiveModalVisible}
        onRequestClose={() => setUnarchiveModalVisible(false)}
        onConfirm={handleUnarchive}
        title={t("screens.accounts.form.archiveModal.unarchiveTitle")}
        description={account.name}
        confirmLabel={t("screens.accounts.form.archiveModal.unarchiveConfirm")}
        cancelLabel={t("common.actions.cancel")}
        variant="default"
        icon="archive-off"
      />

      <ConfirmModal
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDelete}
        title={t("screens.accounts.form.deleteModal.title", {
          name: account.name,
        })}
        description={t("screens.accounts.form.deleteModal.descriptionEmpty")}
        confirmLabel={t("common.actions.delete")}
        cancelLabel={t("common.actions.cancel")}
        variant="destructive"
        icon="trash"
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
    ...theme.typography.headlineSmall,
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
    fontSize: theme.typography.bodyMedium.fontSize,
    fontWeight: "500",
    color: theme.colors.customColors.semi,
  },
  metaSeparator: {
    fontSize: theme.typography.bodyMedium.fontSize,
    color: theme.colors.customColors.semi,
    marginHorizontal: 2,
  },
  primaryText: {
    fontSize: theme.typography.bodyMedium.fontSize,
    fontWeight: "600",
    color: theme.colors.customColors.warning,
  },
  archivedContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  archivedText: {
    ...theme.typography.labelXSmall,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  balanceSection: {
    gap: 4,
    paddingTop: 4,
    backgroundColor: theme.colors.secondary,
  },
  balanceLabel: {
    ...theme.typography.labelXSmall,
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
    fontSize: theme.typography.displayMedium.fontSize,
    fontWeight: "700",
    color: theme.colors.onSecondary,
    letterSpacing: -0.5,
  },
  currencyCode: {
    ...theme.typography.titleSmall,
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
    borderRadius: theme.radius,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryPillAmount: {
    ...theme.typography.titleSmall,
    fontWeight: "700",
  },
  summaryNetCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radius,
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  summaryNetLabel: {
    ...theme.typography.labelLarge,
    color: theme.colors.onSecondary,
  },
  summaryNetAmount: {
    ...theme.typography.bodyLarge,
    fontWeight: "700",
  },
}))
