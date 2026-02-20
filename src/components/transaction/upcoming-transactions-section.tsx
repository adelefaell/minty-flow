import { useCallback, useMemo, useState, useSyncExternalStore } from "react"
import { AppState } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { ConfirmModal } from "~/components/confirm-modal"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { TransactionWithRelations } from "~/database/services/transaction-service"
import { confirmTransactionSync } from "~/database/services/transaction-service"
import { useRecurringRule } from "~/hooks/use-recurring-rule"
import { useMinuteTick } from "~/hooks/use-time-reactivity"
import {
  autoConfirmationService,
  isPreapproved,
  useAutoConfirmVersion,
} from "~/services/auto-confirmation-service"
import { usePendingTransactionsStore } from "~/stores/pending-transactions.store"
import { useTransfersPreferencesStore } from "~/stores/transfers-preferences.store"
import { useUpcomingSectionStore } from "~/stores/upcoming-section.store"
import { confirmable } from "~/utils/pending-transactions"
import { Toast } from "~/utils/toast"
import { applyTransferLayout } from "~/utils/transaction-list-utils"

import { DeleteRecurringModal } from "./delete-recurring-modal"
import { TransactionItem } from "./transaction-item"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface UpcomingTransactionsSectionProps {
  transactions: TransactionWithRelations[]
  onTransactionPress: (transactionId: string) => void
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function isUpcoming(row: TransactionWithRelations, now: Date): boolean {
  return (
    row.transaction.isPending ||
    row.transaction.transactionDate.getTime() > now.getTime()
  )
}

/* ---- AppState subscription for useSyncExternalStore ---- */

let appStateVersion = 0
const appStateListeners = new Set<() => void>()
let appStateSubscriptionRef: { remove: () => void } | null = null

function ensureAppStateSubscription() {
  if (appStateSubscriptionRef) return
  appStateSubscriptionRef = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      appStateVersion++
      for (const cb of appStateListeners) cb()
    }
  })
}

function subscribeAppState(callback: () => void): () => void {
  ensureAppStateSubscription()
  appStateListeners.add(callback)
  return () => {
    appStateListeners.delete(callback)
  }
}

function getAppStateSnapshot(): number {
  return appStateVersion
}

/** Re-renders when app comes to foreground. */
function useAppForeground(): number {
  return useSyncExternalStore(
    subscribeAppState,
    getAppStateSnapshot,
    getAppStateSnapshot,
  )
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function UpcomingTransactionsSection({
  transactions,
  onTransactionPress,
}: UpcomingTransactionsSectionProps) {
  const { theme } = useUnistyles()
  const requireConfirmation = usePendingTransactionsStore(
    (s) => s.requireConfirmation,
  )
  const updateDateUponConfirmation = usePendingTransactionsStore(
    (s) => s.updateDateUponConfirmation,
  )
  const transferLayout = useTransfersPreferencesStore((s) => s.layout)

  // Reactive ticks: minute boundary + auto-confirm version + app foreground
  const tick = useMinuteTick()
  const autoConfirmVersion = useAutoConfirmVersion()
  const foregroundVersion = useAppForeground()

  // ---------- Filter upcoming (structural filters already applied by query) ----------
  const upcoming = useMemo(() => {
    void tick
    void autoConfirmVersion
    void foregroundVersion
    const now = new Date()
    return transactions.filter(
      (r) => !r.transaction.isDeleted && isUpcoming(r, now),
    )
  }, [transactions, tick, autoConfirmVersion, foregroundVersion])

  const upcomingForDisplay = useMemo(
    () => applyTransferLayout(upcoming, transferLayout),
    [upcoming, transferLayout],
  )

  // ---------- Group + auto-confirm past-due ----------
  //
  // Two groups only: recurring and pending.
  // Pre-approved (including all recurring) past-due are auto-confirmed and excluded.
  const { recurring, pending } = useMemo(() => {
    void tick
    void autoConfirmVersion
    void foregroundVersion

    const recurringList: TransactionWithRelations[] = []
    const pendingList: TransactionWithRelations[] = []
    const toAutoConfirm: string[] = []
    const now = Date.now()

    for (const row of upcomingForDisplay) {
      const canConfirm = confirmable(row.transaction, now)
      const preapproved = isPreapproved(row, requireConfirmation)

      if (preapproved && canConfirm) {
        toAutoConfirm.push(row.transaction.id)
      } else {
        if (row.transaction.extra?.recurringId) {
          recurringList.push(row)
        } else {
          pendingList.push(row)
        }
      }
    }

    if (toAutoConfirm.length > 0) {
      for (const txId of toAutoConfirm) {
        void confirmTransactionSync(txId, {
          updateTransactionDate:
            usePendingTransactionsStore.getState().updateDateUponConfirmation,
        })
      }
    }

    return { recurring: recurringList, pending: pendingList }
  }, [
    upcomingForDisplay,
    tick,
    requireConfirmation,
    autoConfirmVersion,
    foregroundVersion,
  ])

  // Schedule timeouts for future pre-approved transactions.
  // requireConfirmation and autoConfirmVersion are intentional:
  // re-schedule when setting changes or after a confirmation fires.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional extra deps
  useMemo(() => {
    autoConfirmationService.start()
    autoConfirmationService.scheduleTransactions(upcoming)
  }, [upcoming, requireConfirmation, autoConfirmVersion])

  const { collapsed, setCollapsed } = useUpcomingSectionStore()
  const [confirmAllModalVisible, setConfirmAllModalVisible] = useState(false)
  const [recurringToDelete, setRecurringToDelete] =
    useState<TransactionWithRelations | null>(null)
  const recurringRule = useRecurringRule(
    recurringToDelete?.transaction.recurringId ?? null,
  )

  const handleConfirm = useCallback(
    async (transactionId: string) => {
      try {
        await confirmTransactionSync(transactionId, {
          updateTransactionDate: updateDateUponConfirmation,
        })
        // Toast.success({ title: "Transaction confirmed" })
      } catch {
        Toast.error({ title: "Failed to confirm" })
      }
    },
    [updateDateUponConfirmation],
  )

  const handleConfirmAll = useCallback(async () => {
    const now = Date.now()
    const toConfirm = pending.filter((r) => confirmable(r.transaction, now))
    if (toConfirm.length === 0) return
    try {
      for (const row of toConfirm) {
        await confirmTransactionSync(row.transaction.id, {
          updateTransactionDate: updateDateUponConfirmation,
        })
      }
    } catch {
      Toast.error({ title: "Failed to confirm all" })
    }
  }, [pending, updateDateUponConfirmation])

  const openConfirmAllModal = useCallback(
    () => setConfirmAllModalVisible(true),
    [],
  )
  const closeConfirmAllModal = useCallback(
    () => setConfirmAllModalVisible(false),
    [],
  )

  // When parent handles delete (e.g. recurring modal), item won't delete; we show DeleteRecurringModal. Same as transaction-form-v3.
  const handleBeforeDelete = useCallback((row: TransactionWithRelations) => {
    if (row.transaction.recurringId) {
      setRecurringToDelete(row)
      return true
    }
    return false
  }, [])

  // TransactionItem handles delete (deleteTransfer or deleteTransactionModel) and toast; we only cancel auto-confirm schedule when delete completes.
  const handleDeleteDone = useCallback((row: TransactionWithRelations) => {
    autoConfirmationService.cancelSchedule(row.transaction.id)
  }, [])

  const totalVisible = recurring.length + pending.length
  if (totalVisible === 0) return null

  const now = Date.now()
  const manualConfirmableCount = pending.filter((r) =>
    confirmable(r.transaction, now),
  ).length

  return (
    <View style={sectionStyles.wrapper}>
      <ConfirmModal
        visible={confirmAllModalVisible}
        onRequestClose={closeConfirmAllModal}
        onConfirm={handleConfirmAll}
        title="Confirm all?"
        description="All transactions awaiting confirmation will be confirmed. This cannot be undone."
        confirmLabel="Confirm all"
        cancelLabel="Cancel"
        variant="default"
        icon="check-circle"
      />

      {recurringToDelete && recurringRule && (
        <DeleteRecurringModal
          visible={true}
          transaction={recurringToDelete.transaction}
          recurringRule={recurringRule}
          onRequestClose={() => setRecurringToDelete(null)}
          onDeleted={() => {
            autoConfirmationService.cancelSchedule(
              recurringToDelete.transaction.id,
            )
            setRecurringToDelete(null)
          }}
        />
      )}

      {/* Header row */}
      <Pressable
        style={sectionStyles.headerRow}
        onPress={() => setCollapsed((c) => !c)}
      >
        <View style={sectionStyles.headerLeft}>
          <Text style={sectionStyles.headerTitle}>Upcoming</Text>
          <View
            style={[
              sectionStyles.countBadge,
              { backgroundColor: theme.colors.secondary },
            ]}
          >
            <Text style={sectionStyles.countBadgeText}>{totalVisible}</Text>
          </View>
        </View>

        <View style={sectionStyles.headerRight}>
          <IconSymbol
            name={collapsed ? "chevron-down" : "chevron-up"}
            size={16}
            color={theme.colors.customColors.semi}
          />
        </View>
      </Pressable>

      {!collapsed && (
        <>
          <View style={sectionStyles.seeAllRow}>
            <Button
              variant="link"
              size="sm"
              onPress={() => setCollapsed(false)}
              style={sectionStyles.seeAllButton}
            >
              <Text style={sectionStyles.seeAllText}>See all</Text>
              <IconSymbol
                name="chevron-right"
                size={18}
                color={theme.colors.customColors.semi}
              />
            </Button>
          </View>

          {/* Summary pills: recurring and pending only */}
          <View style={sectionStyles.pillRow}>
            {recurring.length > 0 && (
              <View
                style={[
                  sectionStyles.pill,
                  { backgroundColor: `${theme.colors.customColors.info}18` },
                ]}
              >
                <IconSymbol
                  name="repeat"
                  size={14}
                  color={theme.colors.customColors.info}
                />
                <Text
                  style={[
                    sectionStyles.pillText,
                    { color: theme.colors.customColors.info },
                  ]}
                >
                  {recurring.length} recurring
                </Text>
              </View>
            )}
            {pending.length > 0 && (
              <View
                style={[
                  sectionStyles.pill,
                  { backgroundColor: `${theme.colors.customColors.warning}18` },
                ]}
              >
                <IconSymbol
                  name="progress-clock"
                  size={14}
                  color={theme.colors.customColors.warning}
                />
                <Text
                  style={[
                    sectionStyles.pillText,
                    { color: theme.colors.customColors.warning },
                  ]}
                >
                  {pending.length} pending
                </Text>
              </View>
            )}
          </View>
        </>
      )}

      {/* Collapsible list */}
      {!collapsed && (
        <View style={sectionStyles.listContainer}>
          {recurring.length > 0 && (
            <>
              <View style={sectionStyles.subHeader}>
                <Text style={sectionStyles.subHeaderText}>RECURRING</Text>
              </View>
              {recurring.map((row) => (
                <TransactionItem
                  key={row.transaction.id}
                  transactionWithRelations={row}
                  variant="upcoming"
                  onPress={() => onTransactionPress(row.transaction.id)}
                  onConfirm={() => handleConfirm(row.transaction.id)}
                  onBeforeDelete={handleBeforeDelete}
                  onDelete={() => handleDeleteDone(row)}
                  rightActionAccessibilityLabel="Cancel transaction"
                />
              ))}
            </>
          )}

          {pending.length > 0 && (
            <>
              <View style={sectionStyles.subHeader}>
                <Text style={sectionStyles.subHeaderText}>PENDING</Text>
                {manualConfirmableCount > 1 && (
                  <Button
                    variant="ghost"
                    onPress={openConfirmAllModal}
                    style={sectionStyles.confirmAllButton}
                    accessibilityLabel="Confirm all transactions"
                    accessibilityRole="button"
                  >
                    <IconSymbol
                      name="check-all"
                      size={14}
                      color={theme.colors.customColors.success}
                    />
                    <Text
                      style={[
                        sectionStyles.confirmAllText,
                        { color: theme.colors.customColors.success },
                      ]}
                    >
                      Confirm all
                    </Text>
                  </Button>
                )}
              </View>
              {pending.map((row) => (
                <TransactionItem
                  key={row.transaction.id}
                  transactionWithRelations={row}
                  variant="upcoming"
                  onPress={() => onTransactionPress(row.transaction.id)}
                  onConfirm={() => handleConfirm(row.transaction.id)}
                  onBeforeDelete={handleBeforeDelete}
                  onDelete={() => handleDeleteDone(row)}
                  rightActionAccessibilityLabel="Cancel transaction"
                />
              ))}
            </>
          )}
        </View>
      )}
    </View>
  )
}

const sectionStyles = StyleSheet.create((theme) => ({
  wrapper: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: theme.colors.onSurface,
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  seeAllButton: {
    alignSelf: "flex-end",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.customColors.semi,
  },
  pillRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    marginTop: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: 4,
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  subHeaderText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.customColors.semi,
    letterSpacing: 0.5,
  },
  confirmAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  confirmAllText: {
    fontSize: 12,
    fontWeight: "600",
  },
}))
