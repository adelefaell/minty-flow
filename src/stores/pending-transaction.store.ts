import { createMMKV } from "react-native-mmkv"
import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"

/**
 * MMKV storage instance for __NAME__ preferences.
 */
export const pendingTransactionStorage = createMMKV({
  id: "pending-transaction-storage",
})

// Pending transaction range
export const PendingTransactionRange = {
  NEXT_ONE_DAY: "Next 1 day",
  NEXT_TWO_DAYS: "Next 2 days",
  NEXT_THREE_DAYS: "Next 3 days",
  NEXT_FIVE_DAYS: "Next 5 days",
  NEXT_SEVEN_DAYS: "Next 7 days",
  NEXT_FOURTEEN_DAYS: "Next 14 days",
  NEXT_THIRTY_DAYS: "Next 30 days",
} as const

// Pending transaction early reminder
export const PendingTransactionEarlyReminder = {
  NONE: "none",
  // Minutes
  FIVE_MINUTES: "5 minutes",
  FIFTEEN_MINUTES: "15 minutes",
  THIRTY_MINUTES: "30 minutes",
  // Hours
  ONE_HOUR: "1 hour",
  TWO_HOURS: "2 hours",
  SIX_HOURS: "6 hours",
  TWELVE_HOURS: "12 hours",
  // Days
  ONE_DAY: "1 day",
  TWO_DAYS: "2 days",
  THREE_DAYS: "3 days",
  SEVEN_DAYS: "7 days",
} as const

// Pending transaction type
export type PendingTransactionRangeType =
  (typeof PendingTransactionRange)[keyof typeof PendingTransactionRange]

// Pending transaction early reminder type
export type PendingTransactionEarlyReminderType =
  (typeof PendingTransactionEarlyReminder)[keyof typeof PendingTransactionEarlyReminder]

/**
 * Pending transaction store interface.
 */
interface pendingTransactionStore {
  pendingTransactionRange: PendingTransactionRangeType
  PendingTransactionEarlyReminder: PendingTransactionEarlyReminderType
  RequireConfirmation: boolean
  UpdateDateOnConfirm: boolean
  setPendingTransactionRange: (value: PendingTransactionRangeType) => void
  setPendingTransactionEarlyReminder: (
    value: PendingTransactionEarlyReminderType,
  ) => void
  setRequireConfirmation: (value: boolean) => void
  setUpdateDateOnConfirm: (value: boolean) => void
}

/**
 * Zustand store for pending transaction settings.
 */
export const usePendingTransactionStore = create<pendingTransactionStore>()(
  devtools(
    persist(
      (set) => ({
        /* ───────── State ───────── */
        pendingTransactionRange: PendingTransactionRange.NEXT_THREE_DAYS,
        PendingTransactionEarlyReminder: PendingTransactionEarlyReminder.NONE,
        RequireConfirmation: false,
        UpdateDateOnConfirm: false,

        /* ───────── Actions ───────── */
        setPendingTransactionRange: (value) =>
          set({ pendingTransactionRange: value }),
        setPendingTransactionEarlyReminder: (value) =>
          set({ PendingTransactionEarlyReminder: value }),
        setRequireConfirmation: (value) => set({ RequireConfirmation: value }),
        setUpdateDateOnConfirm: (value) => set({ UpdateDateOnConfirm: value }),
      }),
      {
        name: "pending-transaction-preferences",
        storage: createJSONStorage(() => ({
          getItem: (name) => pendingTransactionStorage.getString(name) ?? null,
          setItem: (name, value) => pendingTransactionStorage.set(name, value),
          removeItem: (name) => pendingTransactionStorage.remove(name),
        })),
      },
    ),
    { name: "pending-transaction-store-dev" },
  ),
)
