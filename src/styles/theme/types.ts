// ============================================================================
// Minty Theming System - Type Definitions
// ============================================================================

/**
 * Custom colors (income, expense, semi + success/warning/info for compatibility)
 */
export interface MintyCustomColors {
  income: string // Green for income transactions (#32CC70 default)
  expense: string // Red for expense transactions (#FF4040 default)
  semi: string // Muted/secondary text labels (dark: #97919B, light: #6A666D)
  success: string // Green for success states
  warning: string // Orange/yellow for warning states
  info: string // Blue for info states
}

/**
 * Core color scheme structure
 */
export interface MintyColorScheme {
  name: string // Unique theme identifier
  iconName?: string // iOS app icon variant name
  isDark: boolean // Light/dark mode flag
  surface: string // Page/screen background
  onSurface: string // Primary text, icons on surface
  primary: string // Accent (buttons, active states, highlights)
  onPrimary: string // Text/icons on primary
  secondary: string // Card backgrounds, nav bar, chip selected bg
  onSecondary: string // Text on secondary surfaces
  error: string // Error states (#FF4040 default)
  onError: string // Text on error (#F5F6FA default)
  customColors: MintyCustomColors
  rippleColor: string // Ripple/highlight = onSurface at 8.6%
  shadow: string // Shadow color
  boxShadow: string // Box shadow for web
  radius: number // Border radius (8px)
}

/**
 * Derived colors computed by ThemeFactory from MintyColorScheme
 * Used by bottom nav, FAB, cards, bottom sheet, text selection
 */
export interface MintyDerivedColors {
  navbarBackground: string // = secondary
  navbarActiveIcon: string // = primary (light) | onSurface (dark)
  navbarInactiveIcon: string // = navbarActiveIcon at 50% opacity
  fabBackground: string // = primary
  fabForeground: string // = onPrimary
  cardBackground: string // = secondary
  bottomSheetBackground: string // = surface
  textSelection: string // = primary 37.5% (dark) | secondary 62.5% (light)
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
 * colors = full MintyColorScheme + Minty-derived tokens (name/isDark included for compatibility)
 */
export interface UnistylesTheme {
  colors: MintyColorScheme & MintyDerivedColors
  isDark: boolean
}
