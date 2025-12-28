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
    const isDark = this.mintyColorScheme.isDark

    // Use values from scheme if provided, otherwise generate defaults
    const border =
      this.mintyColorScheme.border ||
      (isDark ? "rgba(51, 51, 51, 1)" : "rgba(235, 235, 235, 1)")

    const shadow =
      this.mintyColorScheme.shadow ||
      (isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.08)")

    const boxShadow =
      this.mintyColorScheme.boxShadow ||
      (isDark ? "0 1px 3px rgba(0, 0, 0, 0.3)" : "0 1px 3px rgba(0, 0, 0, 0.1)")

    const rippleColor =
      this.mintyColorScheme.rippleColor ||
      (isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.25)")

    return {
      primary: this.mintyColorScheme.primary,
      onPrimary:
        this.mintyColorScheme.onPrimary || this.mintyColorScheme.surface,
      secondary: this.mintyColorScheme.secondary,
      onSecondary:
        this.mintyColorScheme.onSecondary || this.mintyColorScheme.onSurface,
      surface: this.mintyColorScheme.surface,
      onSurface: this.mintyColorScheme.onSurface,
      background: this.mintyColorScheme.surface,
      error: this.mintyColorScheme.error || "#FF4040",
      onError: this.mintyColorScheme.onError || "#ffffff",
      border,
      rippleColor,
      shadow,
      boxShadow,
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
      customColors: this.customColors,
      isDark: this.isDark,
      radius: this.mintyColorScheme.radius || 10,
    }
  }
}
