import { createMMKV } from "react-native-mmkv"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

/**
 * Single MMKV storage for transaction location preferences
 */
export const transactionLocationStorage = createMMKV({
  id: "transaction-location-storage",
})

/**
 * Transaction location settings store
 */
interface TransactionLocationStore {
  /** Enable location permission for transaction tagging */
  enableLocation: boolean

  /** Auto attach location to new transactions */
  autoAttach: boolean

  /* ───────── Actions ───────── */

  setEnableLocation: (value: boolean) => void
  setAutoAttach: (value: boolean) => void
}

export const useTransactionLocationStore = create<TransactionLocationStore>()(
  persist(
    (set) => ({
      /* ───────── State ───────── */

      enableLocation: false,
      autoAttach: false,

      /* ───────── Actions ───────── */

      setEnableLocation: (value) => {
        set({ enableLocation: value })
      },

      setAutoAttach: (value) => {
        set({ autoAttach: value })
      },
    }),
    {
      name: "transaction-location-store",
      storage: createJSONStorage(() => ({
        getItem: (name) => transactionLocationStorage.getString(name) ?? null,
        setItem: (name, value) => transactionLocationStorage.set(name, value),
        removeItem: (name) => transactionLocationStorage.remove(name),
      })),
    },
  ),
)
