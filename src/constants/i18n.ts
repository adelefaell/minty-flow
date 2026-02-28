import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import { useLanguageOptionStore } from "~/stores/language.store"

import ar from "./translation/ar.json"
import en from "./translation/en.json"

const resources = {
  en: { translation: en },
  ar: { translation: ar },
}

const initialLanguage = useLanguageOptionStore.getState().languageCode

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "en",
  debug: true,

  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
})

export default i18n
