// ============================================================================
// Minty Theming System - Theme Factory
// ============================================================================

import type { MintyColorScheme, UnistylesTheme } from "./types"

/**
 * Theme factory for converting MintyColorScheme to Unistyles theme
 * Mirrors Flutter's ThemeFactory pattern
 */
export class ThemeFactory {
  mintyColorScheme: MintyColorScheme

  constructor(mintyColorScheme: MintyColorScheme) {
    this.mintyColorScheme = mintyColorScheme
  }

  /**
   * Create ThemeFactory from theme name
   */
  // static fromThemeName(
  //   themeName: string | null,
  //   preferDark: boolean = false,
  // ): ThemeFactory {
  //   const scheme = getTheme(themeName, preferDark)
  //   return new ThemeFactory(scheme)
  // }

  /**
   * Get colors for Unistyles
   */
  get colors(): UnistylesTheme["colors"] {
    return {
      primary: this.mintyColorScheme.primary,
      onPrimary: this.mintyColorScheme.onPrimary,
      secondary: this.mintyColorScheme.secondary,
      onSecondary: this.mintyColorScheme.onSecondary,
      surface: this.mintyColorScheme.surface,
      onSurface: this.mintyColorScheme.onSurface,
      error: this.mintyColorScheme.error,
      onError: this.mintyColorScheme.onError,
      customColors: this.mintyColorScheme.customColors,
      rippleColor: this.mintyColorScheme.rippleColor,
      shadow: this.mintyColorScheme.shadow,
      boxShadow: this.mintyColorScheme.boxShadow,
      radius: this.mintyColorScheme.radius,
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
