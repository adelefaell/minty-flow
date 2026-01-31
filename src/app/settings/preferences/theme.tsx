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

  const getVariantForTheme = (themeName: string): ThemeVariant => {
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

  const getThemeDisplayName = (themeName: string): string => {
    const processedName = themeName.replace(/Oled$/, "OLED")
    return processedName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

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
      {/* Compact Header with Current Theme */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Current theme</Text>
        <Text style={styles.headerTheme}>
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

      {/* Segmented Control for Categories */}
      <View style={styles.segmentedControl}>
        {Object.keys(THEME_GROUPS).map((category) => {
          const isSelected = selectedCategory === category
          return (
            <Pressable
              key={category}
              style={[styles.segment, isSelected && styles.segmentSelected]}
              onPress={() => handleCategoryChange(category)}
            >
              <Text
                style={[
                  styles.segmentText,
                  isSelected && styles.segmentTextSelected,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {/* Compact Variant Pills */}
      <View style={styles.variantPills}>
        {(["Light", "Dark", "OLED"] as ThemeVariant[]).map((variant) => {
          const isSelected = selectedVariant === variant
          return (
            <Pressable
              key={variant}
              style={[styles.pill, isSelected && styles.pillSelected]}
              onPress={() => handleVariantChange(variant)}
            >
              <Text
                style={[styles.pillText, isSelected && styles.pillTextSelected]}
              >
                {variant}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {/* Compact Color Grid */}
      <View style={styles.colorGrid}>
        {categoryThemes.map((scheme) => {
          const isSelected = themeMode === scheme.name
          return (
            <Pressable
              key={scheme.name}
              style={[
                styles.colorOption,
                isSelected && styles.colorOptionSelected,
              ]}
              onPress={() => handleThemeChange(scheme.name as ThemeMode)}
            >
              <View
                style={[
                  styles.colorCircle,
                  { backgroundColor: scheme.primary },
                ]}
              />
              {isSelected && <View style={styles.checkmark} />}
            </Pressable>
          )
        })}
      </View>

      {/* Standalone Themes */}
      {Object.keys(STANDALONE_THEMES).length > 0 && (
        <View style={styles.standaloneSection}>
          <Text style={styles.sectionTitle}>Other</Text>
          <View style={styles.colorGrid}>
            {Object.values(STANDALONE_THEMES).map((scheme) => {
              const isSelected = themeMode === scheme.name
              return (
                <Pressable
                  key={scheme.name}
                  style={[
                    styles.colorOption,
                    isSelected && styles.colorOptionSelected,
                  ]}
                  onPress={() => handleThemeChange(scheme.name as ThemeMode)}
                >
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: scheme.primary },
                    ]}
                  />
                  {isSelected && <View style={styles.checkmark} />}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 24,
  },
  header: {
    alignItems: "center",
    paddingVertical: 8,
  },
  headerLabel: {
    fontSize: 13,
    color: theme.colors.onSurface,
    opacity: 0.6,
    marginBottom: 4,
  },
  headerTheme: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.onSurface,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  segmentSelected: {
    backgroundColor: theme.colors.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onSurface,
    opacity: 0.6,
  },
  segmentTextSelected: {
    color: theme.colors.onPrimary,
    opacity: 1,
  },
  variantPills: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
  },
  pillSelected: {
    backgroundColor: theme.colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
  pillTextSelected: {
    color: theme.colors.onPrimary,
    opacity: 1,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondary,
  },
  colorOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  checkmark: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.onPrimary,
    bottom: 4,
    right: 4,
  },
  standaloneSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.onSurface,
    opacity: 0.7,
    textAlign: "center",
  },
}))
