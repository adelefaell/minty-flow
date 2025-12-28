// ============================================================================
// Minty Theming System - Main Export
// ============================================================================

// Export base themes
export {
  DEFAULT_DARK_BASE,
  DEFAULT_LIGHT_BASE,
  DEFAULT_OLED_BASE,
} from "./base"
// Export color arrays
export { ACCENT_COLORS, PRIMARY_COLORS } from "./colors"
// Export factory
export { ThemeFactory } from "./factory"
// Export registry functions
export {
  ALL_THEMES,
  getAllThemeNames,
  getGroupByTheme,
  getTheme,
  getThemeStrict,
  getThemesByBrightness,
  STANDALONE_THEMES,
  THEME_GROUPS,
  validateThemeName,
} from "./registry"
export {
  catppuccinFrappe,
  catppuccinMacchiato,
  catppuccinMocha,
} from "./schemes/catppuccin"
// Export theme schemes
export {
  mintyDarkSchemes,
  mintyLightSchemes,
  mintyOledSchemes,
} from "./schemes/flow"
export { monochrome, nord, palenight } from "./schemes/standalone"
// Export types
export type {
  MintyColorScheme,
  MintyCustomColors,
  ThemeGroup,
  UnistylesTheme,
} from "./types"
// Export utilities
export { copyWith, darkenColor, lightenColor } from "./utils"
