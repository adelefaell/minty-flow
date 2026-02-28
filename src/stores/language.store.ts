import { getLocales } from "expo-localization"
import { createMMKV } from "react-native-mmkv"
import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"

/**
 * MMKV storage instance for LanguageOption preferences.
 */
export const LanguageOptionStorage = createMMKV({
  id: "language-option-storage",
})

/**
 * LanguageOption store interface.
 */
interface LanguageOptionStore {
  languageCode: string

  setLanguageCode: (value: string) => void
}

/**
 * Zustand store for LanguageOption settings.
 */
export const useLanguageOptionStore = create<LanguageOptionStore>()(
  devtools(
    persist(
      (set) => ({
        /* ───────── State ───────── */
        languageCode: getLocales()[0].languageCode ?? "en",

        /* ───────── Actions ───────── */
        setLanguageCode: (value) => set({ languageCode: value }),
      }),
      {
        name: "language-option-preferences",
        storage: createJSONStorage(() => ({
          getItem: (name) => LanguageOptionStorage.getString(name) ?? null,
          setItem: (name, value) => LanguageOptionStorage.set(name, value),
          removeItem: (name) => LanguageOptionStorage.remove(name),
        })),
      },
    ),
    { name: "language-option-store-dev" },
  ),
)
