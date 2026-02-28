import { getLocales } from "expo-localization"
import { I18nManager } from "react-native"
import { createMMKV } from "react-native-mmkv"
import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"

import i18n from "~/i18n/config"
import {
  DirectionEnum,
  type DirectionType,
  LangCodeEnum,
  type LangCodeType,
} from "~/i18n/language.constants"

export {
  DirectionEnum,
  type DirectionType,
  LangCodeEnum,
  type LangCodeType,
} from "~/i18n/language.constants"

export const LanguageStorage = createMMKV({
  id: "language-storage",
})

interface LanguageStore {
  languageCode: LangCodeType
  direction: DirectionType

  // Derived
  isRTL: boolean
  isLTR: boolean

  setLanguageCode: (value: LangCodeType) => void
  setDirection: (value: DirectionType) => void
}

export const useLanguageStore = create<LanguageStore>()(
  devtools(
    persist(
      (set) => {
        const locale = getLocales()[0]

        const initialLang = (locale.languageCode ??
          LangCodeEnum.EN) as LangCodeType

        const initialDirection = (locale.textDirection ??
          DirectionEnum.LTR) as DirectionType

        return {
          /* ───────── State ───────── */
          languageCode: initialLang,
          direction: initialDirection,

          /* ───────── Derived ───────── */
          isRTL: initialDirection === DirectionEnum.RTL,
          isLTR: initialDirection === DirectionEnum.LTR,

          /* ───────── Actions ───────── */
          setLanguageCode: (value) => {
            const newDirection =
              value === LangCodeEnum.AR ? DirectionEnum.RTL : DirectionEnum.LTR

            i18n.changeLanguage(value)
            i18n.dir(newDirection)

            // Optional: sync with native layout direction
            I18nManager.allowRTL(newDirection === DirectionEnum.RTL)
            I18nManager.forceRTL(newDirection === DirectionEnum.RTL)

            set({
              languageCode: value,
              direction: newDirection,
              isRTL: newDirection === DirectionEnum.RTL,
              isLTR: newDirection === DirectionEnum.LTR,
            })
          },

          setDirection: (value) => {
            set({
              direction: value,
              isRTL: value === DirectionEnum.RTL,
              isLTR: value === DirectionEnum.LTR,
            })
          },
        }
      },
      {
        name: "language-preferences",
        storage: createJSONStorage(() => ({
          getItem: (name) => LanguageStorage.getString(name) ?? null,
          setItem: (name, value) => LanguageStorage.set(name, value),
          removeItem: (name) => LanguageStorage.remove(name),
        })),
        onRehydrateStorage: () => (state) => {
          if (state?.languageCode) {
            i18n.changeLanguage(state.languageCode)
            const isRTL = state.direction === DirectionEnum.RTL
            I18nManager.allowRTL(isRTL)
            I18nManager.forceRTL(isRTL)
          }
        },
      },
    ),
    { name: "language-store-dev" },
  ),
)
