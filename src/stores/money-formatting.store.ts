import { createMMKV } from "react-native-mmkv"
import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import { logger } from "~/utils/logger"
import { formatDisplayValue, getDefaultLocale } from "~/utils/number-format"

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

  /**
   * UI-facing formatter
   * Applies currency + look + locale (+ privacy later)
   */
  formatDisplay: (value: string, currency?: string, locale?: string) => string
}

export const useMoneyFormattingStore = create<MoneyFormattingStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        /* ───────── State ───────── */

        preferredCurrency: "USD",
        currencyLook: MoneyFormatEnum.SYMBOL,
        privacyMode: false,

        /* ───────── Actions ───────── */

        setCurrency: (currency) => {
          set((state) => {
            state.preferredCurrency = currency
          })
        },

        setCurrencyLook: (value) => {
          set((state) => {
            state.currencyLook = value
          })
        },

        setPrivacyMode: (value) => {
          set((state) => {
            state.privacyMode = value
          })
        },

        togglePrivacyMode: () => {
          set((state) => {
            state.privacyMode = !state.privacyMode
          })
        },

        formatDisplay: (value, currency, locale) => {
          const { currencyLook, preferredCurrency, privacyMode } = get()

          if (privacyMode) return "••••"

          try {
            const result = formatDisplayValue(
              value,
              currency ?? preferredCurrency,
              currencyLook,
              locale ?? getDefaultLocale(),
            )

            // Final sanity check before returning to UI
            return result || value || "0"
          } catch (error) {
            logger.error("Formatting failed", { error })
            return value // Fallback to raw string if everything explodes
          }
        },
      })),
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
