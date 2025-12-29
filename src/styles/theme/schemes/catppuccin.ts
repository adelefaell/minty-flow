// ============================================================================
// Minty Theming System - Catppuccin Theme Schemes
// ============================================================================

import type { MintyColorScheme } from "../types"
import { copyWith } from "../utils"

/**
 * Catppuccin Frappé base theme
 * Based on the Catppuccin color palette
 */
const CATPPUCCIN_FRAPPE_BASE: MintyColorScheme = {
  name: "catppuccinFrappeBase",
  isDark: true,
  surface: "#303446",
  onSurface: "#c6d0f5",
  primary: "#eebebe",
  onPrimary: "#232634",
  secondary: "#232634",
  onSecondary: "#c6d0f5",
  customColors: {
    income: "#a6d189",
    expense: "#e78284",
    semi: "#949cbb",
    success: "#a6d189",
    warning: "#ef9f76",
    info: "#8caaee",
  },
  rippleColor: "rgba(255, 255, 255, 0.25)",
  shadow: "rgba(0, 0, 0, 0.6)",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
  radius: 10,
}

/**
 * Catppuccin Macchiato base theme
 */
const CATPPUCCIN_MACCHIATO_BASE: MintyColorScheme = {
  name: "catppuccinMacchiatoBase",
  isDark: true,
  surface: "#24273a",
  onSurface: "#cad3f5",
  primary: "#f0c6c6",
  onPrimary: "#181926",
  secondary: "#181926",
  onSecondary: "#cad3f5",
  customColors: {
    income: "#a6da95",
    expense: "#ed8796",
    semi: "#5b6078",
    success: "#a6da95",
    warning: "#f5a97f",
    info: "#8aadf4",
  },
  rippleColor: "rgba(255, 255, 255, 0.25)",
  shadow: "rgba(0, 0, 0, 0.6)",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
  radius: 10,
}

/**
 * Catppuccin Mocha base theme
 */
const CATPPUCCIN_MOCHA_BASE: MintyColorScheme = {
  name: "catppuccinMochaBase",
  isDark: true,
  surface: "#1e1e2e",
  onSurface: "#cdd6f4",
  primary: "#f2cdcd",
  onPrimary: "#11111b",
  secondary: "#11111b",
  onSecondary: "#cdd6f4",
  customColors: {
    income: "#a6e3a1",
    expense: "#f38ba8",
    semi: "#9399b2",
    success: "#a6e3a1",
    warning: "#fab387",
    info: "#89b4fa",
  },
  rippleColor: "rgba(255, 255, 255, 0.25)",
  shadow: "rgba(0, 0, 0, 0.7)",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
  radius: 10,
}

/**
 * Catppuccin Frappé color variants
 * 14 variants with different primary accent colors
 */
export const catppuccinFrappeSchemes: MintyColorScheme[] = [
  copyWith(CATPPUCCIN_FRAPPE_BASE, {
    name: "catppuccinFlamingoFrappe",
    primary: "#eebebe",
  }),
  copyWith(CATPPUCCIN_FRAPPE_BASE, {
    name: "catppuccinRosewaterFrappe",
    primary: "#f2d5cf",
  }),
  copyWith(CATPPUCCIN_FRAPPE_BASE, {
    name: "catppuccinMauveFrappe",
    primary: "#ca9ee6",
  }),
  copyWith(CATPPUCCIN_FRAPPE_BASE, {
    name: "catppuccinPinkFrappe",
    primary: "#f4b8e4",
  }),
  copyWith(CATPPUCCIN_FRAPPE_BASE, {
    name: "catppuccinRedFrappe",
    primary: "#e78284",
  }),
  copyWith(CATPPUCCIN_FRAPPE_BASE, {
    name: "catppuccinMaroonFrappe",
    primary: "#ea999c",
  }),
  copyWith(CATPPUCCIN_FRAPPE_BASE, {
    name: "catppuccinPeachFrappe",
    primary: "#ef9f76",
  }),
  copyWith(CATPPUCCIN_FRAPPE_BASE, {
    name: "catppuccinYellowFrappe",
    primary: "#e5c890",
  }),
  copyWith(CATPPUCCIN_FRAPPE_BASE, {
    name: "catppuccinGreenFrappe",
    primary: "#a6d189",
  }),
  copyWith(CATPPUCCIN_FRAPPE_BASE, {
    name: "catppuccinTealFrappe",
    primary: "#81c8be",
  }),
  copyWith(CATPPUCCIN_FRAPPE_BASE, {
    name: "catppuccinSkyFrappe",
    primary: "#99d1db",
  }),
  copyWith(CATPPUCCIN_FRAPPE_BASE, {
    name: "catppuccinSapphireFrappe",
    primary: "#85c1dc",
  }),
  copyWith(CATPPUCCIN_FRAPPE_BASE, {
    name: "catppuccinBlueFrappe",
    primary: "#8caaee",
  }),
  copyWith(CATPPUCCIN_FRAPPE_BASE, {
    name: "catppuccinLavenderFrappe",
    primary: "#babbf1",
  }),
]

/**
 * Catppuccin Macchiato color variants
 * 14 variants with different primary accent colors
 */
export const catppuccinMacchiatoSchemes: MintyColorScheme[] = [
  copyWith(CATPPUCCIN_MACCHIATO_BASE, {
    name: "catppuccinFlamingoMacchiato",
    primary: "#f0c6c6",
  }),
  copyWith(CATPPUCCIN_MACCHIATO_BASE, {
    name: "catppuccinRosewaterMacchiato",
    primary: "#f4dbd6",
  }),
  copyWith(CATPPUCCIN_MACCHIATO_BASE, {
    name: "catppuccinMauveMacchiato",
    primary: "#c6a0f6",
  }),
  copyWith(CATPPUCCIN_MACCHIATO_BASE, {
    name: "catppuccinPinkMacchiato",
    primary: "#f5bde6",
  }),
  copyWith(CATPPUCCIN_MACCHIATO_BASE, {
    name: "catppuccinRedMacchiato",
    primary: "#ed8796",
  }),
  copyWith(CATPPUCCIN_MACCHIATO_BASE, {
    name: "catppuccinMaroonMacchiato",
    primary: "#ee99a0",
  }),
  copyWith(CATPPUCCIN_MACCHIATO_BASE, {
    name: "catppuccinPeachMacchiato",
    primary: "#f5a97f",
  }),
  copyWith(CATPPUCCIN_MACCHIATO_BASE, {
    name: "catppuccinYellowMacchiato",
    primary: "#eed49f",
  }),
  copyWith(CATPPUCCIN_MACCHIATO_BASE, {
    name: "catppuccinGreenMacchiato",
    primary: "#a6da95",
  }),
  copyWith(CATPPUCCIN_MACCHIATO_BASE, {
    name: "catppuccinTealMacchiato",
    primary: "#8bd5ca",
  }),
  copyWith(CATPPUCCIN_MACCHIATO_BASE, {
    name: "catppuccinSkyMacchiato",
    primary: "#91d7e3",
  }),
  copyWith(CATPPUCCIN_MACCHIATO_BASE, {
    name: "catppuccinSapphireMacchiato",
    primary: "#7dc4e4",
  }),
  copyWith(CATPPUCCIN_MACCHIATO_BASE, {
    name: "catppuccinBlueMacchiato",
    primary: "#8aadf4",
  }),
  copyWith(CATPPUCCIN_MACCHIATO_BASE, {
    name: "catppuccinLavenderMacchiato",
    primary: "#b7bdf8",
  }),
]

/**
 * Catppuccin Mocha color variants
 * 14 variants with different primary accent colors
 */
export const catppuccinMochaSchemes: MintyColorScheme[] = [
  copyWith(CATPPUCCIN_MOCHA_BASE, {
    name: "catppuccinFlamingoMocha",
    primary: "#f2cdcd",
  }),
  copyWith(CATPPUCCIN_MOCHA_BASE, {
    name: "catppuccinRosewaterMocha",
    primary: "#f5e0dc",
  }),
  copyWith(CATPPUCCIN_MOCHA_BASE, {
    name: "catppuccinMauveMocha",
    primary: "#cba6f7",
  }),
  copyWith(CATPPUCCIN_MOCHA_BASE, {
    name: "catppuccinPinkMocha",
    primary: "#f5c2e7",
  }),
  copyWith(CATPPUCCIN_MOCHA_BASE, {
    name: "catppuccinRedMocha",
    primary: "#f38ba8",
  }),
  copyWith(CATPPUCCIN_MOCHA_BASE, {
    name: "catppuccinMaroonMocha",
    primary: "#eba0ac",
  }),
  copyWith(CATPPUCCIN_MOCHA_BASE, {
    name: "catppuccinPeachMocha",
    primary: "#fab387",
  }),
  copyWith(CATPPUCCIN_MOCHA_BASE, {
    name: "catppuccinYellowMocha",
    primary: "#f9e2af",
  }),
  copyWith(CATPPUCCIN_MOCHA_BASE, {
    name: "catppuccinGreenMocha",
    primary: "#a6e3a1",
  }),
  copyWith(CATPPUCCIN_MOCHA_BASE, {
    name: "catppuccinTealMocha",
    primary: "#94e2d5",
  }),
  copyWith(CATPPUCCIN_MOCHA_BASE, {
    name: "catppuccinSkyMocha",
    primary: "#89dceb",
  }),
  copyWith(CATPPUCCIN_MOCHA_BASE, {
    name: "catppuccinSapphireMocha",
    primary: "#74c7ec",
  }),
  copyWith(CATPPUCCIN_MOCHA_BASE, {
    name: "catppuccinBlueMocha",
    primary: "#89b4fa",
  }),
  copyWith(CATPPUCCIN_MOCHA_BASE, {
    name: "catppuccinLavenderMocha",
    primary: "#b4befe",
  }),
]

// Legacy exports for backward compatibility
export const catppuccinFrappe = catppuccinFrappeSchemes[2] // Mauve (original)
export const catppuccinMacchiato = catppuccinMacchiatoSchemes[2] // Mauve (original)
export const catppuccinMocha = catppuccinMochaSchemes[2] // Mauve (original)
