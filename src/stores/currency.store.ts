import { createMMKV } from "react-native-mmkv"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

/**
 * MMKV storage instance for app currency.
 *
 * This instance is optimized for storing application currency with high performance.
 * MMKV is ~30x faster than AsyncStorage and provides synchronous operations.
 *
 * @see https://github.com/mrousavy/react-native-mmkv
 */
export const currencyStorage = createMMKV({
  id: "app-currency-storage",
  // You can optionally add encryption here if currency are sensitive
  // encryptionKey: 'my-secret-key',
})

/**
 * Currency store interface defining the shape of the currency state and actions.
 */
interface CurrencyStore {
  /** The user's preferred currency code (e.g., "USD", "EUR") */
  preferredCurrency: string
  /**
   * Sets the preferred currency.
   * @param currency - The currency code to set (e.g., "USD", "EUR")
   */
  setCurrency: (currency: string) => void
}

/**
 * Zustand store hook for managing application currency.
 *
 * This store is persisted to MMKV storage, providing fast and reliable
 * persistence of user preferences across app sessions.
 *
 * @example
 * ```tsx
 * const { preferredCurrency, setCurrency } = useCurrencyStore()
 *
 * // Update currency
 * setCurrency("EUR")
 * ```
 *
 * @see https://github.com/pmndrs/zustand
 */
export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      // State definitions
      preferredCurrency: "USD",

      // Actions
      setCurrency: (currency) => set({ preferredCurrency: currency }),
    }),
    {
      name: "app-currency", // Name for the store (MMKV key)
      // Use the custom MMKV instance for storage
      storage: createJSONStorage(() => ({
        getItem: (name) => currencyStorage.getString(name) ?? null,
        setItem: (name, value) => currencyStorage.set(name, value),
        removeItem: (name) => currencyStorage.remove(name),
      })),
      // Optional: limit which parts of the state are persisted
      // partialize: (state) => ({ preferredCurrency: state.preferredCurrency }),
    },
  ),
)

export default useCurrencyStore
