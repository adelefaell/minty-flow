import type TransactionModel from "~/database/models/Transaction"
import { getPendingTransactionModels } from "~/database/services/transaction-service"
import { usePendingTransactionsStore } from "~/stores/pending-transactions.store"
import { startOfNextMinute } from "~/utils/pending-transactions"

/**
 * Payload type for transaction reminder notifications.
 * Use itemType: "txn" and id: transaction.id (or uuid when available).
 */
export interface TransactionReminderPayload {
  itemType: "txn"
  id: string
}

/**
 * Clear all scheduled notifications of type "transaction".
 * Stub: implement with expo-notifications when wiring UI.
 */
export async function clearPlannedTransactionNotifications(): Promise<void> {
  // TODO: expo-notifications: get pending, filter by content.data.itemType === "txn", cancel each
}

/**
 * Schedule a single notification at transactionDate and optionally at transactionDate - earlyReminderInSeconds.
 * Stub: implement with expo-notifications when wiring UI.
 */
export async function scheduleForPlannedTransaction(
  _transaction: TransactionModel,
  _earlyReminderSeconds: number,
): Promise<void> {
  // TODO: expo-notifications: schedule at transactionDate; if earlyReminderSeconds >= 60, also schedule at transactionDate - earlyReminderSeconds
}

/**
 * Resync all planned-transaction notifications:
 * - Clear existing transaction reminders
 * - If notify preference is true, query pending transactions and schedule each (skip if transactionDate in the past).
 * Call after: app startup/foreground, preference changes, add/edit/delete of pending transactions.
 */
export async function synchronizePlannedTransactionNotifications(): Promise<void> {
  await clearPlannedTransactionNotifications()

  const notify = usePendingTransactionsStore.getState().notify
  if (!notify) return

  const earlyReminderInSeconds =
    usePendingTransactionsStore.getState().earlyReminderInSeconds
  const pending = await getPendingTransactionModels()
  const now = startOfNextMinute()

  for (const t of pending) {
    if (t.transactionDate.getTime() <= now.getTime()) continue
    await scheduleForPlannedTransaction(t, earlyReminderInSeconds)
  }
}
