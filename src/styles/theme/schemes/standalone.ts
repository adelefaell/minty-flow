// ============================================================================
// Minty Theming System - Standalone Theme Schemes
// ============================================================================

import type { MintyColorScheme } from "../types"

/**
 * Palenight theme
 * Inspired by Material Theme Palenight
 */
export const palenight: MintyColorScheme = {
  name: "palenight",
  iconName: "palenight",
  isDark: true,
  surface: "#292d3e",
  onSurface: "#a6accd",
  primary: "#c792ea",
  onPrimary: "#292d3e",
  secondary: "#1f2233",
  onSecondary: "#a6accd",
  customColors: {
    income: "#c3e88d",
    expense: "#f07178",
    semi: "#676e95",
    success: "#c3e88d",
    warning: "#ffcb6b",
    info: "#82aaff",
  },
}

/**
 * Monochrome theme
 * Pure black and white design
 */
export const monochrome: MintyColorScheme = {
  name: "monochrome",
  iconName: "monochrome",
  isDark: false,
  surface: "#ffffff",
  onSurface: "#000000",
  primary: "#000000",
  onPrimary: "#ffffff",
  secondary: "#f5f5f5",
  onSecondary: "#000000",
  customColors: {
    income: "#2d2d2d",
    expense: "#000000",
    semi: "#666666",
    success: "#2d2d2d",
    warning: "#666666",
    info: "#4d4d4d",
  },
}

/**
 * Nord theme
 * Based on the Nord color palette
 */
export const nord: MintyColorScheme = {
  name: "nord",
  iconName: "nord",
  isDark: true,
  surface: "#2e3440",
  onSurface: "#eceff4",
  primary: "#88c0d0",
  onPrimary: "#2e3440",
  secondary: "#3b4252",
  onSecondary: "#eceff4",
  customColors: {
    income: "#a3be8c",
    expense: "#bf616a",
    semi: "#4c566a",
    success: "#a3be8c",
    warning: "#ebcb8b",
    info: "#81a1c1",
  },
}
