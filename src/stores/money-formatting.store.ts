import { createMMKV } from "react-native-mmkv"
import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"
/**
 * Single MMKV storage for all money-related UI preferences
 */
export const moneyFormattingStorage = createMMKV({
  id: "money-formatting-storage",
})

/**
 * Currency display style
 */
export const MoneyFormatEnum = {
  SYMBOL: "symbol",
  CODE: "code",
  NAME: "name",
} as const

export type MoneyFormatType =
  (typeof MoneyFormatEnum)[keyof typeof MoneyFormatEnum]

/**
 * Money formatting + currency preferences store
 *
 * UI-facing only. Domain & services should NOT import this.
 */
interface MoneyFormattingStore {
  /** Preferred ISO currency code (e.g. USD, EUR) */
  preferredCurrency: string

  /** How currency is displayed */
  currencyLook: MoneyFormatType

  /** Hide sensitive values in UI */
  privacyMode: boolean

  /* ───────── Actions ───────── */

  setCurrency: (currency: string) => void
  setCurrencyLook: (value: MoneyFormatType) => void

  setPrivacyMode: (value: boolean) => void
  togglePrivacyMode: () => void
}

export const useMoneyFormattingStore = create<MoneyFormattingStore>()(
  devtools(
    persist(
      (set) => ({
        preferredCurrency: "USD",
        currencyLook: MoneyFormatEnum.SYMBOL,
        privacyMode: false,

        setCurrency: (currency) => set({ preferredCurrency: currency }),

        setCurrencyLook: (currencyLook) => set({ currencyLook }),

        setPrivacyMode: (privacyMode) => set({ privacyMode }),

        togglePrivacyMode: () =>
          set((state) => ({ privacyMode: !state.privacyMode })),
      }),
      {
        name: "money-formatting-store",
        storage: createJSONStorage(() => ({
          getItem: (name) => moneyFormattingStorage.getString(name) ?? null,
          setItem: (name, value) => moneyFormattingStorage.set(name, value),
          removeItem: (name) => moneyFormattingStorage.remove(name),
        })),
      },
    ),
    { name: "money-formatting-store-dev" },
  ),
)
