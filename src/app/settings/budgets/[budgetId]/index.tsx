import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useTranslation } from "react-i18next"
import { FlatList, View as RNView } from "react-native"
import type { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { DynamicIcon } from "~/components/dynamic-icon"
import { Money } from "~/components/money"
import { TransactionItem } from "~/components/transaction/transaction-item"
import { Button } from "~/components/ui/button"
import { EmptyState } from "~/components/ui/empty-state"
import { IconSvg } from "~/components/ui/icon-svg"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { on } from "~/database/events"
import type { TransactionWithRelations } from "~/database/mappers/hydrateTransactions"
import {
  getBudgetPeriodRange,
  getBudgetSpent,
} from "~/database/repos/budget-repo"
import type { TranslationKey } from "~/i18n/config"
import { useAccounts } from "~/stores/db/account.store"
import { useBudget } from "~/stores/db/budget.store"
import { useCategories } from "~/stores/db/category.store"
import { useTransactions } from "~/stores/db/transaction.store"
import { formatCustomPeriodRange } from "~/utils/time-utils"

/* ------------------------------------------------------------------ */
/* Detail screen                                                      */
/* ------------------------------------------------------------------ */

function BudgetDetailInner({ budgetId }: { budgetId: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const navigation = useNavigation()
  const { theme } = useUnistyles()
  const openSwipeableRef = useRef<SwipeableMethods | null>(null)

  const budget = useBudget(budgetId)
  const allAccounts = useAccounts()
  const allCategories = useCategories()
  const [spentAmount, setSpentAmount] = useState(0)

  const accountNames = useMemo(
    () =>
      (budget?.accountIds ?? [])
        .map((id) => allAccounts.find((a) => a.id === id)?.name)
        .filter(Boolean) as string[],
    [budget?.accountIds, allAccounts],
  )

  const categoryNames = useMemo(
    () =>
      (budget?.categoryIds ?? [])
        .map((id) => allCategories.find((c) => c.id === id)?.name)
        .filter(Boolean) as string[],
    [budget?.categoryIds, allCategories],
  )

  const periodRange = useMemo(() => {
    if (!budget) return null
    return getBudgetPeriodRange(
      budget.period,
      budget.startDate.toISOString(),
      budget.endDate?.toISOString() ?? null,
    )
  }, [budget])

  const { items: transactionsFull } = useTransactions(
    periodRange && budget
      ? {
          accountIds: budget.accountIds,
          categoryIds: budget.categoryIds,
          from: periodRange.periodStart,
          to: periodRange.periodEnd,
        }
      : {},
  )

  useEffect(() => {
    if (!budget) return
    let cancelled = false
    const fetch = () =>
      getBudgetSpent(
        budget.accountIds,
        budget.categoryIds,
        budget.period,
        budget.startDate.toISOString(),
        budget.endDate?.toISOString() ?? null,
      ).then((v) => {
        if (!cancelled) setSpentAmount(v)
      })
    fetch()
    const unsub = on("transactions:dirty", fetch)
    return () => {
      cancelled = true
      unsub()
    }
  }, [budget])

  const handleTransactionPress = useCallback(
    (id: string) => {
      router.push({ pathname: "/transaction/[id]", params: { id } })
    },
    [router],
  )
  const handleDeleteDone = useCallback(() => {
    openSwipeableRef.current?.close()
  }, [])

  const handleWillOpen = useCallback((methods: SwipeableMethods) => {
    openSwipeableRef.current?.close()
    openSwipeableRef.current = methods
  }, [])

  const renderTransactionItem = useCallback(
    ({ item }: { item: TransactionWithRelations }) => (
      <TransactionItem
        transactionWithRelations={item}
        onPress={() => handleTransactionPress(item.id)}
        onDelete={handleDeleteDone}
        onWillOpen={handleWillOpen}
      />
    ),
    [handleTransactionPress, handleDeleteDone, handleWillOpen],
  )

  useLayoutEffect(() => {
    navigation.setOptions({
      title: budget?.name ?? t("screens.settings.budgets.detail.title"),
      headerRight: () => (
        <Button
          variant="ghost"
          size="icon"
          onPress={() =>
            router.push({
              pathname: "/settings/budgets/[budgetId]/modify",
              params: { budgetId },
            })
          }
        >
          <IconSvg name="pencil" size={20} />
        </Button>
      ),
    })
  }, [navigation, router, budgetId, budget?.name, t])

  if (!budget) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="default">
            {t("screens.settings.budgets.form.loadingText")}
          </Text>
        </View>
      </View>
    )
  }

  const progress = budget.amount > 0 ? spentAmount / budget.amount : 0
  const clampedProgress = Math.min(progress, 1)
  const isOverBudget = progress > 1
  const remaining = Math.max(budget.amount - spentAmount, 0)

  const progressBarColor = isOverBudget
    ? theme.colors.error
    : theme.colors.primary

  const periodLabel =
    budget.period === "custom"
      ? formatCustomPeriodRange(budget.startDate, budget.endDate)
      : t(`screens.settings.budgets.periods.${budget.period}` as TranslationKey)

  const categoryLabel =
    categoryNames.length > 0
      ? categoryNames.join(", ")
      : t("screens.settings.budgets.card.noCategory")

  const headerContent = (
    <View style={styles.headerCard}>
      {/* Icon + name + period badge */}
      <View style={styles.headerTopRow}>
        <DynamicIcon
          icon={budget.icon || "chart-pie"}
          size={36}
          colorScheme={budget.colorScheme}
          variant="badge"
        />
        <View style={styles.headerInfo}>
          <Text style={styles.budgetName}>{budget.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.periodBadge}>
              <Text style={styles.periodBadgeText}>{periodLabel}</Text>
            </View>
            {isOverBudget ? (
              <View style={styles.overBudgetBadge}>
                <IconSvg
                  name="alert-triangle"
                  size={14}
                  color={theme.colors.error}
                />
                <Text style={styles.overBudgetText}>
                  {t("screens.settings.budgets.card.overBudget")}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Categories */}
      <Text style={styles.categoryText}>{categoryLabel}</Text>

      {/* Accounts */}
      <Text style={styles.accountsText}>
        {accountNames.length > 0
          ? accountNames.join(", ")
          : t("screens.settings.budgets.card.allAccounts")}
      </Text>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressTrack}>
          <RNView
            style={[
              styles.progressFill,
              {
                width: `${clampedProgress * 100}%`,
                backgroundColor: progressBarColor,
              },
            ]}
          />
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountText}>
            {t("screens.settings.budgets.card.spent")}:{" "}
            <Money
              value={spentAmount}
              currency={budget.currencyCode}
              tone="transfer"
              hideSign
            />{" "}
            {t("screens.settings.budgets.card.of")}{" "}
            <Money
              value={budget.amount}
              currency={budget.currencyCode}
              tone="transfer"
              hideSign
            />
          </Text>
          <Text style={styles.remainingText}>
            {isOverBudget ? (
              t("screens.settings.budgets.card.overBudget")
            ) : (
              <>
                <Money
                  value={remaining}
                  currency={budget.currencyCode}
                  tone="transfer"
                  hideSign
                />{" "}
                {t("screens.settings.budgets.card.remaining")}
              </>
            )}
          </Text>
        </View>
      </View>

      {/* Transactions section label */}
      <Text style={styles.transactionsLabel}>
        {t("screens.settings.budgets.detail.transactions")}
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={transactionsFull}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
        ListHeaderComponent={headerContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="receipt"
              title={t("screens.settings.budgets.detail.noTransactions")}
            />
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  )
}

/* ------------------------------------------------------------------ */
/* Route component                                                    */
/* ------------------------------------------------------------------ */

export default function BudgetDetailScreen() {
  const { budgetId } = useLocalSearchParams<{ budgetId: string }>()
  if (!budgetId) return null
  return <BudgetDetailInner budgetId={budgetId} />
}

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

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
  listContent: {
    paddingBottom: 40,
  },

  // Header card
  headerCard: {
    padding: 20,
    gap: 14,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  budgetName: {
    ...theme.typography.titleMedium,
    fontWeight: "700",
    color: theme.colors.onSurface,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  periodBadge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius,
  },
  periodBadgeText: {
    ...theme.typography.labelXSmall,
    fontWeight: "600",
    color: theme.colors.onSecondary,
  },
  overBudgetBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${theme.colors.error}20`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius,
  },
  overBudgetText: {
    ...theme.typography.labelXSmall,
    fontWeight: "600",
    color: theme.colors.error,
  },
  categoryText: {
    fontSize: theme.typography.bodyMedium.fontSize,
    color: theme.colors.onSecondary,
  },
  accountsText: {
    fontSize: theme.typography.bodyMedium.fontSize,
    color: theme.colors.onSecondary,
  },

  // Progress
  progressSection: {
    gap: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.secondary,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountText: {
    fontSize: theme.typography.bodyMedium.fontSize,
    color: theme.colors.onSecondary,
    flex: 1,
    marginRight: 8,
  },
  remainingText: {
    fontSize: theme.typography.bodyMedium.fontSize,
    color: theme.colors.onSecondary,
    flexShrink: 0,
  },

  // Transactions
  transactionsLabel: {
    ...theme.typography.bodyLarge,
    fontWeight: "600",
    color: theme.colors.onSurface,
    marginTop: 6,
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
}))
