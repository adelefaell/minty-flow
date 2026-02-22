import { useCallback, useEffect, useMemo, useState } from "react"
import { useUnistyles } from "react-native-unistyles"

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

import { DeleteRecurringModal } from "../delete-recurring-modal"
import { TransactionItem } from "../transaction-item"
import type { UpcomingTransactionsSectionProps } from "./types"
import { upcomingSectionStyles as sectionStyles } from "./upcoming-transactions-section.styles"
import { useAppForeground } from "./use-app-foreground"
import { isUpcoming } from "./utils"

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

  const tick = useMinuteTick()
  const autoConfirmVersion = useAutoConfirmVersion()
  const foregroundVersion = useAppForeground()

  const nowMs = tick * 60_000
  const nowDate = useMemo(() => new Date(nowMs), [nowMs])

  const upcoming = useMemo(() => {
    void autoConfirmVersion
    void foregroundVersion
    return transactions.filter(
      (r) => !r.transaction.isDeleted && isUpcoming(r, nowDate),
    )
  }, [transactions, nowDate, autoConfirmVersion, foregroundVersion])

  const upcomingForDisplay = useMemo(
    () => applyTransferLayout(upcoming, transferLayout),
    [upcoming, transferLayout],
  )

  const { recurring, pending } = useMemo(() => {
    void autoConfirmVersion
    void foregroundVersion

    const recurringList: TransactionWithRelations[] = []
    const pendingList: TransactionWithRelations[] = []
    const toAutoConfirm: string[] = []

    for (const row of upcomingForDisplay) {
      const canConfirm = confirmable(row.transaction, nowMs)
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
          updateTransactionDate: updateDateUponConfirmation,
        })
      }
    }

    return { recurring: recurringList, pending: pendingList }
  }, [
    upcomingForDisplay,
    nowMs,
    requireConfirmation,
    updateDateUponConfirmation,
    autoConfirmVersion,
    foregroundVersion,
  ])

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional extra deps
  useEffect(() => {
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
      const opts = { updateTransactionDate: updateDateUponConfirmation }
      try {
        await confirmTransactionSync(transactionId, opts)
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
    const ids = toConfirm.map((r) => r.transaction.id)
    const opts = { updateTransactionDate: updateDateUponConfirmation }
    try {
      await Promise.all(ids.map((id) => confirmTransactionSync(id, opts)))
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

  const handleBeforeDelete = useCallback((row: TransactionWithRelations) => {
    if (row.transaction.recurringId) {
      setRecurringToDelete(row)
      return true
    }
    return false
  }, [])

  const handleDeleteDone = useCallback((row: TransactionWithRelations) => {
    autoConfirmationService.cancelSchedule(row.transaction.id)
  }, [])

  const totalVisible = recurring.length + pending.length
  if (totalVisible === 0) return null

  const manualConfirmableCount = pending.filter((r) =>
    confirmable(r.transaction, nowMs),
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
