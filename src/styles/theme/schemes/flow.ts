// ============================================================================
// Minty Theming System - Minty Theme Schemes
// ============================================================================

import {
  DEFAULT_DARK_BASE,
  DEFAULT_LIGHT_BASE,
  DEFAULT_OLED_BASE,
} from "../base"
import { ACCENT_COLORS, PRIMARY_COLORS } from "../colors"
import type { MintyColorScheme } from "../types"
import { copyWith, lightenColor } from "../utils"

/**
 * Minty Light themes - 16 variants based on primary colors
 * Pattern: Light surface with colored primary and pastel secondary
 */
export const mintyLightSchemes: MintyColorScheme[] = PRIMARY_COLORS.map(
  (primary, index) =>
    copyWith(DEFAULT_LIGHT_BASE, {
      name: `mintyLight${index}`,
      iconName: `mintyLight${index}`,
      primary,
      secondary: ACCENT_COLORS[index],
      onSecondary: "#33004f",
    }),
)

/**
 * Minty Dark themes - 16 variants with lightened primary colors
 * Pattern: Dark gray surface with lightened primary and very dark secondary
 */
export const mintyDarkSchemes: MintyColorScheme[] = PRIMARY_COLORS.map(
  (primary, index) =>
    copyWith(DEFAULT_DARK_BASE, {
      name: `mintyDark${index}`,
      iconName: `mintyDark${index}`,
      surface: "#141414",
      primary: lightenColor(primary, 40),
      secondary: "#050505",
    }),
)

/**
 * Minty OLED themes - 16 variants optimized for OLED displays
 * Pattern: True black surface with lightened primary
 */
export const mintyOledSchemes: MintyColorScheme[] = PRIMARY_COLORS.map(
  (primary, index) =>
    copyWith(DEFAULT_OLED_BASE, {
      name: `mintyOled${index}`,
      iconName: `mintyOled${index}`,
      primary: lightenColor(primary, 40),
      secondary: "#000000",
    }),
)
