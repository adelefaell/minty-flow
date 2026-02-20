import { createMMKV } from "react-native-mmkv"
import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"

/**
 * MMKV storage for custom exchange rate overrides.
 * All rates are per 1 USD. Used when converting or displaying amounts in other currencies.
 */
export const exchangeRatesPreferencesStorage = createMMKV({
  id: "flow-exchange-rates-preferences-storage",
})

/** Custom rates: currency code (uppercase) -> amount per 1 USD */
export interface CustomExchangeRates {
  customRates: Record<string, number>
}

const DEFAULTS: CustomExchangeRates = {
  customRates: {},
}

interface ExchangeRatesPreferencesStore extends CustomExchangeRates {
  setCustomRate: (currencyCode: string, rate: number) => void
  getCustomRate: (currencyCode: string) => number | undefined
  removeCustomRate: (currencyCode: string) => void
  clearAllCustomRates: () => void
}

const PERSIST_NAME = "minty.flow.exchangeRatesPreferences"

function normalizeCode(code: string): string {
  return code.trim().toUpperCase()
}

export const useExchangeRatesPreferencesStore =
  create<ExchangeRatesPreferencesStore>()(
    devtools(
      persist(
        (set, get) => ({
          ...DEFAULTS,
          setCustomRate: (currencyCode, rate) => {
            const key = normalizeCode(currencyCode)
            set((state) => ({
              customRates: {
                ...state.customRates,
                [key]: rate,
              },
            }))
          },
          getCustomRate: (currencyCode) => {
            const key = normalizeCode(currencyCode)
            return get().customRates[key]
          },
          removeCustomRate: (currencyCode) => {
            const key = normalizeCode(currencyCode)
            set((state) => {
              const next = { ...state.customRates }
              delete next[key]
              return { customRates: next }
            })
          },
          clearAllCustomRates: () => set({ customRates: {} }),
        }),
        {
          name: PERSIST_NAME,
          storage: createJSONStorage(() => ({
            getItem: (name) =>
              exchangeRatesPreferencesStorage.getString(name) ?? null,
            setItem: (name, value) =>
              exchangeRatesPreferencesStorage.set(name, value),
            removeItem: (name) => exchangeRatesPreferencesStorage.remove(name),
          })),
        },
      ),
      { name: "exchange-rates-preferences-store" },
    ),
  )
