// ============================================================================
// Minty Theming System - Theme Factory
// Builds Unistyles theme from MintyColorScheme with derived tokens
// ============================================================================

import type { MintyColorScheme, UnistylesTheme } from "./types"

/**
 * Append hex alpha to 6-char hex (0-255 scale, e.g. 0x16 = 8.6%)
 */
function hexWithAlpha(hex: string, alpha255: number): string {
  const clean = hex.replace("#", "")
  if (clean.length !== 6) return hex
  const a = Math.round(alpha255).toString(16).padStart(2, "0")
  return `#${clean}${a}`
}

/**
 * Theme factory for converting MintyColorScheme to Unistyles theme
 * Derives: navbar, FAB, card, bottom sheet, ripple, text selection
 */
export class ThemeFactory {
  mintyColorScheme: MintyColorScheme

  constructor(mintyColorScheme: MintyColorScheme) {
    this.mintyColorScheme = mintyColorScheme
  }

  /**
   * Get colors for Unistyles (base + Minty-derived tokens)
   */
  get colors(): UnistylesTheme["colors"] {
    const s = this.mintyColorScheme
    const isDark = s.isDark
    // Bottom nav active: dark = onSurface, light = primary
    const navbarActiveIcon = isDark ? s.onSurface : s.primary
    const navbarInactiveIcon = hexWithAlpha(navbarActiveIcon, 0x80) // 50%
    const rippleColor = hexWithAlpha(s.onSurface, 0x16) // 8.6%
    const textSelection = isDark
      ? hexWithAlpha(s.primary, 0x60) // 37.5%
      : hexWithAlpha(s.secondary, 0xa0) // 62.5%

    return {
      // Base scheme (so theme.colors is castable to MintyColorScheme where needed)
      name: s.name,
      iconName: s.iconName,
      isDark: s.isDark,
      primary: s.primary,
      onPrimary: s.onPrimary,
      secondary: s.secondary,
      onSecondary: s.onSecondary,
      surface: s.surface,
      onSurface: s.onSurface,
      error: s.error,
      onError: s.onError,
      customColors: s.customColors,
      rippleColor,
      shadow: s.shadow,
      boxShadow: s.boxShadow,
      radius: s.radius,
      // Minty derived (ThemeFactory rules)
      navbarBackground: s.secondary,
      navbarActiveIcon,
      navbarInactiveIcon,
      fabBackground: s.primary,
      fabForeground: s.onPrimary,
      cardBackground: s.secondary,
      bottomSheetBackground: s.surface,
      textSelection,
    }
  }

  /**
   * Get custom Minty colors
   */
  get customColors(): MintyColorScheme["customColors"] {
    return this.mintyColorScheme.customColors
  }

  /**
   * Check if theme is dark
   */
  get isDark(): boolean {
    return this.mintyColorScheme.isDark
  }

  /**
   * Get theme name
   */
  get name(): string {
    return this.mintyColorScheme.name
  }

  /**
   * Get icon name for app icon switching
   */
  get iconName(): string | undefined {
    return this.mintyColorScheme.iconName
  }

  /**
   * Build complete Unistyles theme
   */
  buildTheme(): UnistylesTheme {
    return {
      colors: this.colors,
      isDark: this.isDark,
    }
  }
}
