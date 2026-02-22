import { THEME_GROUPS } from "~/styles/theme/registry"
import type { MintyColorScheme } from "~/styles/theme/types"

export type ThemeVariant = "Light" | "Dark" | "OLED"

export function getCategoryForTheme(themeName: string): string {
  for (const [category, groups] of Object.entries(THEME_GROUPS)) {
    if (
      groups.some((group) =>
        group.schemes.some((scheme) => scheme.name === themeName),
      )
    ) {
      return category
    }
  }
  return Object.keys(THEME_GROUPS)[0] || "Minty"
}

export function getVariantForTheme(themeName: string): ThemeVariant {
  if (themeName.includes("Frappe") || themeName.includes("frappe")) {
    return "Light"
  }
  if (themeName.includes("Macchiato") || themeName.includes("macchiato")) {
    return "Dark"
  }
  if (themeName.includes("Mocha") || themeName.includes("mocha")) {
    return "OLED"
  }
  if (themeName.includes("Oled") || themeName.endsWith("Oled")) {
    return "OLED"
  }
  const allThemes = Object.values(THEME_GROUPS)
    .flat()
    .flatMap((g) => g.schemes)
  const foundTheme = allThemes.find((t) => t.name === themeName)
  if (foundTheme?.isDark) {
    return "Dark"
  }
  return "Light"
}

export function getThemeDisplayName(themeName: string): string {
  const processedName = themeName.replace(/Oled$/, "OLED")
  return processedName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

export function getThemesForVariant(
  selectedCategory: string,
  selectedVariant: ThemeVariant,
): MintyColorScheme[] {
  const groups = THEME_GROUPS[selectedCategory] || []

  if (selectedCategory === "Minty") {
    const variantGroup = groups.find((g) => {
      const name = g.name.toLowerCase()
      return (
        name.includes(selectedVariant.toLowerCase()) ||
        (selectedVariant === "OLED" && name.includes("oled"))
      )
    })
    return variantGroup?.schemes || []
  }

  let variantGroup: (typeof groups)[0] | undefined

  if (selectedVariant === "Light") {
    variantGroup = groups.find((g) => {
      const name = g.name.toLowerCase()
      return name.includes("frappé") || name.includes("frappe")
    })
  } else if (selectedVariant === "Dark") {
    variantGroup = groups.find((g) =>
      g.name.toLowerCase().includes("macchiato"),
    )
  } else if (selectedVariant === "OLED") {
    variantGroup = groups.find((g) => g.name.toLowerCase().includes("mocha"))
  }

  return variantGroup?.schemes || groups[0]?.schemes || []
}
