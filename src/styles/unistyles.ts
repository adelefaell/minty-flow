import { StyleSheet } from "react-native-unistyles"

import { themeStorage } from "~/stores/theme.store"

import { breakpoints } from "./breakpoints"
import { ALL_THEMES } from "./theme/registry"
import { unistylesThemes } from "./theme/unistyles-themes"

type AppBreakpoints = typeof breakpoints
type AppThemes = typeof unistylesThemes

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

// Export ThemeKey type for backward compatibility
export type ThemeKey = keyof typeof ALL_THEMES

StyleSheet.configure({
  settings: {
    initialTheme: () => {
      const storedPreferences = themeStorage.getString("theme-preferences")
      if (storedPreferences) {
        try {
          // Zustand persist stores data as JSON: {"state":{"themeMode":"..."},"version":0}
          const parsed = JSON.parse(storedPreferences)
          const themeMode = parsed?.state?.themeMode
          if (themeMode && themeMode in ALL_THEMES) {
            return themeMode as ThemeKey
          }
        } catch {
          // If parsing fails, check if it's a direct string (legacy format)
          if (storedPreferences in ALL_THEMES) {
            return storedPreferences as ThemeKey
          }
        }
      }
      return "frostedMintHills"
    },
  },
  themes: unistylesThemes,
  breakpoints,
})
