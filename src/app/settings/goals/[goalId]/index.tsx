import { differenceInDays } from "date-fns"
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

import { ConfirmModal } from "~/components/confirm-modal"
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
import { getGoalProgress } from "~/database/repos/goal-repo"
import { unarchiveGoalById } from "~/database/services-sqlite/goal-service"
import { useAccounts } from "~/stores/db/account.store"
import { useGoal } from "~/stores/db/goal.store"
import { useTransactions } from "~/stores/db/transaction.store"
import { logger } from "~/utils/logger"
import { Toast } from "~/utils/toast"

/* ------------------------------------------------------------------ */
/* Detail screen                                                      */
/* ------------------------------------------------------------------ */

function GoalDetailInner({ goalId }: { goalId: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const navigation = useNavigation()
  const { theme } = useUnistyles()
  const openSwipeableRef = useRef<SwipeableMethods | null>(null)
  const [unarchiveModalVisible, setUnarchiveModalVisible] = useState(false)

  const goal = useGoal(goalId)
  const allAccounts = useAccounts()
  const [currentAmount, setCurrentAmount] = useState(0)
  const { items: transactionsFull } = useTransactions({ goalId })

  const accountNames = useMemo(
    () =>
      (goal?.accountIds ?? [])
        .map((id) => allAccounts.find((a) => a.id === id)?.name)
        .filter(Boolean) as string[],
    [goal?.accountIds, allAccounts],
  )

  useEffect(() => {
    if (!goal) return
    let cancelled = false
    const fetch = () =>
      getGoalProgress(goalId, goal.goalType || "savings").then((v) => {
        if (!cancelled) setCurrentAmount(v)
      })
    fetch()
    const unsub = on("transactions:dirty", fetch)
    return () => {
      cancelled = true
      unsub()
    }
  }, [goalId, goal])

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

  const handleUnarchive = useCallback(async () => {
    try {
      await unarchiveGoalById(goalId)
      Toast.success({ title: t("screens.settings.goals.unarchiveSuccess") })
    } catch (error) {
      logger.error("Error unarchiving goal", { error })
      Toast.error({ title: t("common.toast.error") })
    }
  }, [goalId, t])

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

  const isArchived = goal?.isArchived ?? false

  useLayoutEffect(() => {
    navigation.setOptions({
      title: goal?.name ?? t("screens.settings.goals.detail.title"),
      headerRight: () =>
        isArchived ? (
          <Button
            variant="ghost"
            size="icon"
            onPress={() => setUnarchiveModalVisible(true)}
          >
            <IconSvg name="archive-off" size={20} />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onPress={() =>
              router.push({
                pathname: "/settings/goals/[goalId]/modify",
                params: { goalId },
              })
            }
          >
            <IconSvg name="pencil" size={20} />
          </Button>
        ),
    })
  }, [navigation, router, goalId, goal?.name, isArchived, t])

  if (!goal) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="default">
            {t("screens.settings.goals.form.loadingText")}
          </Text>
        </View>
      </View>
    )
  }

  const isExpenseGoal = goal.goalType === "expense"
  const resolved = currentAmount ?? 0
  const progress = goal.targetAmount > 0 ? resolved / goal.targetAmount : 0
  const clampedProgress = Math.min(progress, 1)
  const isCompleted = progress >= 1
  const remaining = Math.max(goal.targetAmount - resolved, 0)

  const progressBarColor = isCompleted
    ? theme.colors.customColors.income
    : theme.colors.primary

  const targetDateLabel = (): string => {
    if (!goal.targetDate) return t("screens.settings.goals.card.noDeadline")
    const diff = differenceInDays(goal.targetDate, new Date())
    if (diff === 0)
      return t("screens.settings.goals.card.daysLeft", {
        count: 0,
      })
    if (diff < 0)
      return t("screens.settings.goals.card.overdue", {
        count: Math.abs(diff),
      })
    return t("screens.settings.goals.card.daysLeft", {
      count: diff,
    })
  }

  const progressLabel = isExpenseGoal
    ? t("screens.settings.goals.card.spent")
    : t("screens.settings.goals.card.saved")

  const headerContent = (
    <View style={styles.headerCard}>
      {/* Icon + name + type badge */}
      <View style={styles.headerTopRow}>
        <DynamicIcon
          icon={goal.icon || "target"}
          size={36}
          colorScheme={goal.colorScheme}
          variant="badge"
        />
        <View style={styles.headerInfo}>
          <Text style={styles.goalName}>{goal.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {isExpenseGoal
                  ? t("screens.settings.goals.card.type.expense")
                  : t("screens.settings.goals.card.type.savings")}
              </Text>
            </View>
            {isArchived ? (
              <View style={styles.archivedContainer}>
                <IconSvg name="archive" size={14} />

                <Text style={styles.archivedText}>
                  {t("screens.settings.goals.card.archived")}
                </Text>
              </View>
            ) : isCompleted ? (
              <View style={styles.completedBadge}>
                <IconSvg
                  name="check"
                  size={14}
                  color={theme.colors.customColors.income}
                />
                <Text style={styles.completedText}>
                  {t("screens.settings.goals.card.completed")}
                </Text>
              </View>
            ) : (
              <Text style={styles.dateText}>{targetDateLabel()}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Description */}
      {goal.description ? (
        <Text style={styles.description}>{goal.description}</Text>
      ) : null}

      {/* Accounts */}
      <Text style={styles.accountsText}>
        {accountNames.length > 0
          ? accountNames.join(", ")
          : t("screens.settings.goals.card.allAccounts")}
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
            {progressLabel}:{" "}
            <Money
              value={resolved}
              currency={goal.currencyCode}
              tone="transfer"
              hideSign
            />{" "}
            {t("screens.settings.goals.card.of")}{" "}
            <Money
              value={goal.targetAmount}
              currency={goal.currencyCode}
              tone="transfer"
              hideSign
            />
          </Text>
          <Text style={styles.remainingText}>
            {isCompleted ? (
              t("screens.settings.goals.card.completed")
            ) : (
              <>
                <Money
                  value={remaining}
                  currency={goal.currencyCode}
                  tone="transfer"
                  hideSign
                />{" "}
                {t("screens.settings.goals.card.remaining")}
              </>
            )}
          </Text>
        </View>
      </View>

      {/* Pending transactions notice — always shown so users know pending txns are excluded */}
      <View style={styles.pendingNoticeRow}>
        <IconSvg
          name="info-circle"
          size={14}
          color={theme.colors.onSecondary}
        />
        <Text style={styles.pendingNoticeText}>
          {t("screens.settings.goals.detail.pendingNotice")}
        </Text>
      </View>

      {/* Transactions section label */}
      <Text style={styles.transactionsLabel}>
        {t("screens.settings.goals.detail.transactions")}
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
              title={t("screens.settings.goals.detail.noTransactions")}
            />
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <ConfirmModal
        visible={unarchiveModalVisible}
        onRequestClose={() => setUnarchiveModalVisible(false)}
        onConfirm={handleUnarchive}
        title={t("screens.settings.goals.form.archiveModal.unarchiveTitle")}
        description={goal.name}
        confirmLabel={t(
          "screens.settings.goals.form.archiveModal.unarchiveConfirm",
        )}
        cancelLabel={t("common.actions.cancel")}
        variant="default"
        icon="archive-off"
      />
    </View>
  )
}

/* ------------------------------------------------------------------ */
/* Route component                                                    */
/* ------------------------------------------------------------------ */

export default function GoalDetailScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>()
  if (!goalId) return null
  return <GoalDetailInner goalId={goalId} />
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
  goalName: {
    ...theme.typography.titleMedium,
    fontWeight: "700",
    color: theme.colors.onSurface,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius,
  },
  typeBadgeText: {
    ...theme.typography.labelXSmall,
    fontWeight: "600",
    color: theme.colors.onSecondary,
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
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${theme.colors.customColors.income}20`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius,
  },
  completedText: {
    ...theme.typography.labelXSmall,
    fontWeight: "600",
    color: theme.colors.customColors.income,
  },
  dateText: {
    fontSize: theme.typography.labelMedium.fontSize,
    color: theme.colors.onSecondary,
  },
  description: {
    fontSize: theme.typography.labelLarge.fontSize,
    color: theme.colors.onSecondary,
    lineHeight: 20,
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

  // Pending notice
  pendingNoticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pendingNoticeText: {
    fontSize: theme.typography.labelMedium.fontSize,
    color: theme.colors.onSecondary,
    flex: 1,
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
