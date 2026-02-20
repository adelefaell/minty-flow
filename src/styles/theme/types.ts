// ============================================================================
// Minty Theming System - Type Definitions
// ============================================================================

/**
 * Custom colors specific to Minty app
 */
export interface MintyCustomColors {
  income: string // Green for income transactions
  expense: string // Red for expense transactions
  semi: string // Gray for secondary text/labels
  success: string // Green for success states
  warning: string // Orange/yellow for warning states
  info: string // Blue for info states
}

/**
 * Core color scheme structure
 * Mirrors Flutter's MintyColorScheme
 */
export interface MintyColorScheme {
  name: string // Unique theme identifier
  iconName?: string // iOS app icon variant name
  isDark: boolean // Light/dark mode flag
  surface: string // Background color
  onSurface: string // Text color on surface
  primary: string // Primary brand color
  onPrimary: string // Text color on primary
  secondary: string // Secondary/card background
  onSecondary: string // Text color on secondary
  error: string // Error color
  onError: string // Text color on error
  customColors: MintyCustomColors
  // Utility colors
  rippleColor: string // Ripple effect color
  shadow: string // Shadow color
  boxShadow: string // Box shadow for web
  radius: number // Border radius
}

/**
 * Theme group structure for organizing related themes
 */
export interface ThemeGroup {
  name: string
  icon?: string
  schemes: MintyColorScheme[]
}

/**
 * Unistyles theme structure
 * This is the structure that Unistyles expects
 */
export interface UnistylesTheme {
  colors: Omit<MintyColorScheme, "name" | "iconName" | "isDark">
  isDark: boolean
}
