import { useEffect } from "react"
import { AppState } from "react-native"

import { synchronizeAllRecurringTransactions } from "~/database/services/recurring-transaction-service"
import { logger } from "~/utils/logger"

const SYNC_DEBOUNCE_MS = 1_000

/**
 * Syncs recurring transactions: once on mount and whenever the app returns to foreground.
 * Syncs with reality: AppState + DB. No orchestration—just "when app is active, keep
 * recurrings in sync". Debounces rapid AppState flapping to avoid redundant syncs.
 */
export function useRecurringTransactionSync(): void {
  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const sync = () => {
      if (cancelled) return
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (cancelled) return
        synchronizeAllRecurringTransactions().catch((e) =>
          logger.error("Recurring sync failed", { error: String(e) }),
        )
      }, SYNC_DEBOUNCE_MS)
    }

    // Initial sync without debounce
    synchronizeAllRecurringTransactions().catch((e) =>
      logger.error("Recurring sync failed", { error: String(e) }),
    )

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") sync()
    })

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
      sub.remove()
    }
  }, [])
}
