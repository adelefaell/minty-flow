import { useEffect } from "react"
import { AppState } from "react-native"

import { synchronizePlannedTransactionNotifications } from "~/services/pending-transaction-notifications"
import { usePendingTransactionsStore } from "~/stores/pending-transactions.store"
import { logger } from "~/utils/logger"

/**
 * Syncs pending-transaction notifications: once on mount, whenever the app
 * returns to foreground, and whenever the notify/earlyReminderInSeconds
 * preferences change.
 */
export function useNotificationSync(): void {
  useEffect(() => {
    const run = () =>
      synchronizePlannedTransactionNotifications().catch((e) =>
        logger.error("Notification sync failed", { error: String(e) }),
      )

    run()

    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") run()
    })

    let prevNotify = usePendingTransactionsStore.getState().notify
    let prevEarly =
      usePendingTransactionsStore.getState().earlyReminderInSeconds
    const storeSub = usePendingTransactionsStore.subscribe((s) => {
      if (s.notify !== prevNotify || s.earlyReminderInSeconds !== prevEarly) {
        prevNotify = s.notify
        prevEarly = s.earlyReminderInSeconds
        run()
      }
    })

    return () => {
      appStateSub.remove()
      storeSub()
    }
  }, [])
}
