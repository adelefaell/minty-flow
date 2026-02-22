// ============================================================================
// Minty Theming System - Typography Tokens
// Poppins, scale + weights
// TODO: use this file later in the project so the font family and sizes are consistent across the app
// ============================================================================

/**
 * Single style entry: fontSize + fontWeight
 */
export interface MintyTextStyle {
  fontSize: number
  fontWeight: "100" | "200" | "300" | "400" | "500" | "600" | "700"
}

/**
 * Minty typography scale
 * Font family: Poppins (primary), fallback: SF Pro Display → Helvetica → Roboto → sans-serif
 */
export interface MintyTypographyTokens {
  fontFamily: string
  fontFamilyFallback: string[]
  fontFamilyMono: string

  displayLarge: MintyTextStyle
  displayMedium: MintyTextStyle
  displaySmall: MintyTextStyle
  headlineLarge: MintyTextStyle
  headlineMedium: MintyTextStyle
  headlineSmall: MintyTextStyle
  titleLarge: MintyTextStyle
  titleMedium: MintyTextStyle
  titleSmall: MintyTextStyle
  bodyLarge: MintyTextStyle
  bodyMedium: MintyTextStyle
  bodySmall: MintyTextStyle
  labelLarge: MintyTextStyle
  labelMedium: MintyTextStyle
  labelSmall: MintyTextStyle
}

export const typography: MintyTypographyTokens = {
  fontFamily: "Poppins",
  fontFamilyFallback: ["SF Pro Display", "Helvetica", "Roboto", "sans-serif"],
  fontFamilyMono: "monospace",

  displayLarge: { fontSize: 48, fontWeight: "500" },
  displayMedium: { fontSize: 36, fontWeight: "500" },
  displaySmall: { fontSize: 24, fontWeight: "500" },
  headlineLarge: { fontSize: 26, fontWeight: "700" },
  headlineMedium: { fontSize: 22, fontWeight: "700" },
  headlineSmall: { fontSize: 18, fontWeight: "700" },
  titleLarge: { fontSize: 24, fontWeight: "500" },
  titleMedium: { fontSize: 20, fontWeight: "500" },
  titleSmall: { fontSize: 16, fontWeight: "500" },
  bodyLarge: { fontSize: 16, fontWeight: "400" },
  bodyMedium: { fontSize: 13, fontWeight: "400" },
  bodySmall: { fontSize: 10, fontWeight: "400" },
  labelLarge: { fontSize: 14, fontWeight: "400" },
  labelMedium: { fontSize: 12, fontWeight: "400" },
  labelSmall: { fontSize: 10, fontWeight: "400" },
}
