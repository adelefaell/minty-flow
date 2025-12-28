// ============================================================================
// Minty Theming System - Theme Registry
// ============================================================================

import { DEFAULT_DARK_BASE, DEFAULT_LIGHT_BASE } from "./base"
import {
  catppuccinFrappe,
  catppuccinMacchiato,
  catppuccinMocha,
} from "./schemes/catppuccin"
import {
  mintyDarkSchemes,
  mintyLightSchemes,
  mintyOledSchemes,
} from "./schemes/flow"
import { monochrome, nord, palenight } from "./schemes/standalone"
import type { MintyColorScheme, ThemeGroup } from "./types"

/**
 * Theme groups for organized UI display
 */
const mintyLights: ThemeGroup = {
  name: "Minty Light",
  icon: "☀️",
  schemes: mintyLightSchemes,
}

const mintyDarks: ThemeGroup = {
  name: "Minty Dark",
  icon: "🌙",
  schemes: mintyDarkSchemes,
}

const mintyOleds: ThemeGroup = {
  name: "Minty OLED",
  icon: "⚫",
  schemes: mintyOledSchemes,
}

const catppuccinFrappeGroup: ThemeGroup = {
  name: "Catppuccin Frappé",
  icon: "☕",
  schemes: [catppuccinFrappe],
}

const catppuccinMacchiatoGroup: ThemeGroup = {
  name: "Catppuccin Macchiato",
  icon: "🍫",
  schemes: [catppuccinMacchiato],
}

const catppuccinMochaGroup: ThemeGroup = {
  name: "Catppuccin Mocha",
  icon: "🌑",
  schemes: [catppuccinMocha],
}

/**
 * All theme groups organized by category
 */
export const THEME_GROUPS: Record<string, ThemeGroup[]> = {
  Minty: [mintyLights, mintyDarks, mintyOleds],
  Catppuccin: [
    catppuccinFrappeGroup,
    catppuccinMacchiatoGroup,
    catppuccinMochaGroup,
  ],
}

/**
 * Standalone themes not part of any group
 */
export const STANDALONE_THEMES: Record<string, MintyColorScheme> = {
  palenight,
  monochrome,
  nord,
}

/**
 * All themes flattened into a single map
 */
export const ALL_THEMES: Record<string, MintyColorScheme> = {
  ...Object.values(THEME_GROUPS)
    .flat()
    .reduce(
      (acc, group) => {
        group.schemes.forEach((scheme) => {
          acc[scheme.name] = scheme
        })
        return acc
      },
      {} as Record<string, MintyColorScheme>,
    ),
  ...STANDALONE_THEMES,
}

/**
 * Get a theme by name with fallback
 */
export const getTheme = (
  themeName: string | null,
  preferDark: boolean = false,
): MintyColorScheme => {
  if (themeName && ALL_THEMES[themeName]) {
    return ALL_THEMES[themeName]
  }
  return preferDark ? DEFAULT_DARK_BASE : DEFAULT_LIGHT_BASE
}

/**
 * Get a theme by name without fallback
 */
export const getThemeStrict = (themeName: string): MintyColorScheme | null => {
  return ALL_THEMES[themeName] || null
}

/**
 * Check if a theme name exists
 */
export const validateThemeName = (themeName: string): boolean => {
  return themeName in ALL_THEMES
}

/**
 * Get the group containing a specific theme
 */
export const getGroupByTheme = (themeName: string): ThemeGroup | null => {
  for (const groupList of Object.values(THEME_GROUPS)) {
    for (const group of groupList) {
      if (group.schemes.some((s) => s.name === themeName)) {
        return group
      }
    }
  }
  return null
}

/**
 * Get all theme names
 */
export const getAllThemeNames = (): string[] => {
  return Object.keys(ALL_THEMES)
}

/**
 * Get themes by brightness
 */
export const getThemesByBrightness = (isDark: boolean): MintyColorScheme[] => {
  return Object.values(ALL_THEMES).filter((theme) => theme.isDark === isDark)
}
