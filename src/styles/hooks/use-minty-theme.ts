// ============================================================================
// Minty Theming System - useMintyTheme Hook
// ============================================================================

/**
 * Custom hook for accessing Minty theme
 */

import { useUnistyles } from "react-native-unistyles"

import type { MintyCustomColors } from "../theme/types"

export const useMintyTheme = () => {
  const { theme } = useUnistyles()

  return {
    colors: theme.colors,
    customColors: theme.customColors as MintyCustomColors,
    isDark: theme.isDark,
  }
}

// Backward compatibility alias
