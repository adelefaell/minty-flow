// ============================================================================
// Minty Theming System - Base Theme Definitions
// ============================================================================

import type { MintyColorScheme } from "./types"

/**
 * Default light theme base
 * Used as foundation for all light theme variants
 */
export const DEFAULT_LIGHT_BASE: MintyColorScheme = {
  name: "defaultLightBase",
  isDark: false,
  surface: "#f5f6fa",
  onSurface: "#0a000d",
  primary: "#8500a6",
  onPrimary: "#f5f6fa",
  secondary: "#f5ccff",
  onSecondary: "#33004f",
  error: "#FF4040",
  onError: "#ffffff",
  customColors: {
    income: "#32CC70",
    expense: "#FF4040",
    semi: "#6A666D",
    success: "#32CC70",
    warning: "#FFA500",
    info: "#4A90E2",
  },
  rippleColor: "rgba(0, 0, 0, 0.25)",
  shadow: "rgba(0, 0, 0, 0.08)",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  radius: 10,
}

/**
 * Default dark theme base
 * Used as foundation for all dark theme variants
 */
export const DEFAULT_DARK_BASE: MintyColorScheme = {
  name: "defaultDarkBase",
  isDark: true,
  surface: "#222222",
  onSurface: "#f5f6fa",
  primary: "#f2c0ff",
  onPrimary: "#222222",
  secondary: "#111111",
  onSecondary: "#f5f6fa",
  error: "#FF6B6B",
  onError: "#000000",
  customColors: {
    income: "#4ADE80",
    expense: "#FF6B6B",
    semi: "#9CA3AF",
    success: "#4ADE80",
    warning: "#FBBF24",
    info: "#60A5FA",
  },
  rippleColor: "rgba(255, 255, 255, 0.25)",
  shadow: "rgba(0, 0, 0, 0.6)",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
  radius: 10,
}

/**
 * Default OLED theme base
 * True black for OLED displays
 * Note: secondary is #101010 (very dark gray) to provide contrast for navbar/tab bar
 */
export const DEFAULT_OLED_BASE: MintyColorScheme = {
  ...DEFAULT_DARK_BASE,
  name: "defaultOledBase",
  surface: "#000000",
  secondary: "#101010",
  error: DEFAULT_DARK_BASE.error,
  onError: DEFAULT_DARK_BASE.onError,
  shadow: "rgba(0, 0, 0, 0.7)",
}
