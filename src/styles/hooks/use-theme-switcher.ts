// ============================================================================
// Flow Theming System - useThemeSwitcher Hook
// ============================================================================

/**
 * Hook for switching themes
 */

import { useUnistyles } from "react-native-unistyles"

import useThemeStore from "~/stores/theme.store"
import { logger } from "~/utils/logger"

import { validateThemeName } from "../theme/registry"

export const useThemeSwitcher = () => {
  const { theme } = useUnistyles()

  const setThemeMode = useThemeStore((state) => state.setThemeMode)

  const switchTheme = (themeName: string) => {
    if (validateThemeName(themeName)) {
      setThemeMode(themeName)
    } else {
      logger.warn(`Theme "${themeName}" not found`)
    }
  }

  return {
    currentTheme: theme,
    switchTheme,
  }
}
