import { useState } from "react"
import { ScrollView } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { StyleSheet } from "react-native-unistyles"

import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { type ThemeMode, useThemeStore } from "~/stores/theme.store"
import { STANDALONE_THEMES, THEME_GROUPS } from "~/styles/theme/registry"
import type { MintyColorScheme } from "~/styles/theme/types"

type ThemeVariant = "Light" | "Dark" | "OLED"

export default function ThemeSettingsScreen() {
  const { themeMode, setThemeMode } = useThemeStore()
  const insets = useSafeAreaInsets()

  // Determine initial category based on current theme
  const getCategoryForTheme = (themeName: string): string => {
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

  // Determine initial variant based on current theme
  const getVariantForTheme = (themeName: string): ThemeVariant => {
    // Check for Catppuccin themes first
    if (themeName.includes("Frappe") || themeName.includes("frappe")) {
      return "Light"
    }
    if (themeName.includes("Macchiato") || themeName.includes("macchiato")) {
      return "Dark"
    }
    if (themeName.includes("Mocha") || themeName.includes("mocha")) {
      return "OLED"
    }

    // For Minty themes
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

  const [selectedCategory, setSelectedCategory] = useState<string>(
    getCategoryForTheme(themeMode),
  )
  const [selectedVariant, setSelectedVariant] = useState<ThemeVariant>(
    getVariantForTheme(themeMode),
  )

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
    setSelectedVariant(getVariantForTheme(mode))
  }

  // Helper function to get theme display name
  const getThemeDisplayName = (themeName: string): string => {
    const processedName = themeName.replace(/Oled$/, "OLED")
    return processedName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  // Get themes for selected category and variant
  const getThemesForVariant = (): MintyColorScheme[] => {
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
    } else {
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
        variantGroup = groups.find((g) =>
          g.name.toLowerCase().includes("mocha"),
        )
      }

      return variantGroup?.schemes || groups[0]?.schemes || []
    }
  }

  const categoryThemes = getThemesForVariant()

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    if (category === "Catppuccin") {
      const newVariant = getVariantForTheme(themeMode)
      setSelectedVariant(newVariant)
      const catppuccinGroups = THEME_GROUPS[category] || []
      const isCurrentThemeInCategory = catppuccinGroups.some((g) =>
        g.schemes.some((s) => s.name === themeMode),
      )
      if (!isCurrentThemeInCategory && catppuccinGroups[0]) {
        setSelectedVariant("Light")
      }
    } else {
      const newVariant = getVariantForTheme(themeMode)
      setSelectedVariant(newVariant)
    }
  }

  const handleVariantChange = (variant: ThemeVariant) => {
    setSelectedVariant(variant)
    const groups = THEME_GROUPS[selectedCategory] || []

    if (selectedCategory === "Minty") {
      const variantGroup = groups.find((g) => {
        const name = g.name.toLowerCase()
        return (
          name.includes(variant.toLowerCase()) ||
          (variant === "OLED" && name.includes("oled"))
        )
      })

      if (variantGroup && variantGroup.schemes.length > 0) {
        const currentTheme = categoryThemes.find((t) => t.name === themeMode)
        if (currentTheme) {
          const matchingTheme = variantGroup.schemes.find(
            (t) => t.primary === currentTheme.primary,
          )
          if (matchingTheme) {
            setThemeMode(matchingTheme.name as ThemeMode)
          } else if (variantGroup.schemes[0]) {
            setThemeMode(variantGroup.schemes[0].name as ThemeMode)
          }
        } else if (variantGroup.schemes[0]) {
          setThemeMode(variantGroup.schemes[0].name as ThemeMode)
        }
      }
    } else {
      let variantGroup: (typeof groups)[0] | undefined

      if (variant === "Light") {
        variantGroup = groups.find((g) => {
          const name = g.name.toLowerCase()
          return name.includes("frappé") || name.includes("frappe")
        })
      } else if (variant === "Dark") {
        variantGroup = groups.find((g) =>
          g.name.toLowerCase().includes("macchiato"),
        )
      } else if (variant === "OLED") {
        variantGroup = groups.find((g) =>
          g.name.toLowerCase().includes("mocha"),
        )
      }

      if (variantGroup && variantGroup.schemes.length > 0) {
        setThemeMode(variantGroup.schemes[0].name as ThemeMode)
      }
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 16 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {Object.keys(THEME_GROUPS).map((category) => {
          const isSelected = selectedCategory === category
          return (
            <Pressable
              key={category}
              style={[
                styles.categoryTab,
                isSelected && styles.categoryTabSelected,
              ]}
              onPress={() => handleCategoryChange(category)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  isSelected && styles.categoryTabTextSelected,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {/* Variant Tabs */}
      <View style={styles.variantTabs}>
        {(["Light", "Dark", "OLED"] as ThemeVariant[]).map((variant) => {
          const isSelected = selectedVariant === variant
          return (
            <Pressable
              key={variant}
              style={[
                styles.variantTab,
                isSelected && styles.variantTabSelected,
              ]}
              onPress={() => handleVariantChange(variant)}
            >
              <Text
                style={[
                  styles.variantTabText,
                  isSelected && styles.variantTabTextSelected,
                ]}
              >
                {variant}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {/* Selected Theme Title */}
      <View style={styles.selectedThemeContainer}>
        <Text style={styles.selectedThemeTitle}>
          {(() => {
            const selected = categoryThemes.find((t) => t.name === themeMode)
            if (selected) {
              return getThemeDisplayName(selected.name)
            }
            const standalone = Object.values(STANDALONE_THEMES).find(
              (t) => t.name === themeMode,
            )
            if (standalone) {
              return getThemeDisplayName(standalone.name)
            }
            return "Select a theme"
          })()}
        </Text>
      </View>

      {/* Color Grid */}
      <View style={styles.colorGrid}>
        {categoryThemes.map((scheme) => {
          const isSelected = themeMode === scheme.name
          return (
            <Pressable
              key={scheme.name}
              style={[styles.colorCard, isSelected && styles.colorCardSelected]}
              onPress={() => handleThemeChange(scheme.name as ThemeMode)}
            >
              <View
                style={[
                  styles.colorSwatch,
                  { backgroundColor: scheme.primary },
                  isSelected && styles.colorSwatchSelected,
                ]}
              />
            </Pressable>
          )
        })}
      </View>

      {/* Standalone Themes */}
      {Object.keys(STANDALONE_THEMES).length > 0 && (
        <View style={styles.standaloneSection}>
          <Text style={styles.standaloneTitle}>Other themes</Text>
          <View style={styles.standaloneGrid}>
            {Object.values(STANDALONE_THEMES).map((scheme) => {
              const isSelected = themeMode === scheme.name
              return (
                <Pressable
                  key={scheme.name}
                  style={[
                    styles.standaloneCard,
                    isSelected && styles.standaloneCardSelected,
                  ]}
                  onPress={() => handleThemeChange(scheme.name as ThemeMode)}
                >
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: scheme.primary },
                      isSelected && styles.colorSwatchSelected,
                    ]}
                  />
                </Pressable>
              )
            })}
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  categoryTabs: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    justifyContent: "center",
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.secondary,
    gap: 6,
  },

  categoryTabSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  categoryTabTextSelected: {
    color: theme.colors.onPrimary,
  },
  variantTabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    justifyContent: "center",
  },
  variantTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  variantTabSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  variantTabText: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  variantTabTextSelected: {
    color: theme.colors.onPrimary,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
  },
  colorCard: {
    width: "30%",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: theme.radius,
    backgroundColor: "transparent",
  },
  colorCardSelected: {
    backgroundColor: theme.colors.secondary,
  },
  colorSwatch: {
    width: 64,
    height: 64,
    borderRadius: theme.radius,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatchSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },
  selectedThemeContainer: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 12,
  },
  selectedThemeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.onSurface,
    textAlign: "center",
  },
  standaloneSection: {
    marginTop: 8,
  },
  standaloneTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.onSurface,
    marginBottom: 16,
  },
  standaloneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  standaloneCard: {
    width: "30%",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: theme.radius,
    backgroundColor: "transparent",
  },
  standaloneCardSelected: {
    backgroundColor: theme.colors.secondary,
  },
}))
