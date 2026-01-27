import { BottomSheetScrollView } from "@gorhom/bottom-sheet"
import { useState } from "react"
import { StyleSheet } from "react-native-unistyles"

import { useThemeStore } from "~/stores/theme.store"
import { getThemeStrict, THEME_GROUPS } from "~/styles/theme/registry"
import type { MintyColorScheme } from "~/styles/theme/types"

import { BottomSheetModalComponent, useBottomSheet } from "./bottom-sheet"
import { Pressable } from "./ui/pressable"
import { Text } from "./ui/text"
import { View } from "./ui/view"

interface ColorVariantSheetProps {
  /** Unique identifier for this bottom sheet */
  id: string
  /** Callback when a color variant is selected - returns the scheme name */
  onColorSelected?: (schemeName: string) => void
  /** Callback when selection is cleared */
  onClearSelection?: () => void
  /** Callback when the sheet is dismissed */
  onDismiss?: () => void
  /** Currently selected scheme name (optional, for controlled component) */
  selectedSchemeName?: string | null
}

/**
 * Color Variant Selection Bottom Sheet
 * Shows color variants based on the currently selected theme group
 * Does NOT change the app theme - only for selecting colors for other purposes
 */
export const ColorVariantSheet = ({
  id,
  onColorSelected,
  onClearSelection,
  onDismiss,
  selectedSchemeName: controlledSelectedSchemeName,
}: ColorVariantSheetProps) => {
  const { themeMode } = useThemeStore()
  const sheet = useBottomSheet(id)

  // Internal state for selected scheme name (if not controlled)
  const [internalSelectedSchemeName, setInternalSelectedSchemeName] = useState<
    string | null
  >(null)

  // Use controlled or internal state
  const selectedSchemeName =
    controlledSelectedSchemeName !== undefined
      ? controlledSelectedSchemeName
      : internalSelectedSchemeName

  // Resolve the scheme object from the name for display
  const selectedScheme = selectedSchemeName
    ? getThemeStrict(selectedSchemeName)
    : undefined

  // Determine which theme group and variant the current theme belongs to
  const getCurrentThemeInfo = (): {
    category: string
    variant: string
    schemes: MintyColorScheme[]
  } | null => {
    for (const [category, groups] of Object.entries(THEME_GROUPS)) {
      for (const group of groups) {
        const foundScheme = group.schemes.find((s) => s.name === themeMode)
        if (foundScheme) {
          return {
            category,
            variant: group.name,
            schemes: group.schemes,
          }
        }
      }
    }
    return null
  }

  const themeInfo = getCurrentThemeInfo()

  // Extract the color variant name from the theme name
  const getVariantName = (themeName: string): string => {
    // Remove common prefixes and suffixes
    const name = themeName
      .replace(/^catppuccin/i, "")
      .replace(/Frappe$/i, "")
      .replace(/Macchiato$/i, "")
      .replace(/Mocha$/i, "")
      .replace(/^minty/i, "")
      .replace(/Light$/i, "")
      .replace(/Dark$/i, "")
      .replace(/Oled$/i, "")

    // Convert camelCase to Title Case
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  const handleColorSelect = (scheme: MintyColorScheme) => {
    // Update internal state if not controlled
    if (controlledSelectedSchemeName === undefined) {
      setInternalSelectedSchemeName(scheme.name)
    }
    // Notify parent with scheme name (not the full object)
    onColorSelected?.(scheme.name)
    // Close the sheet after selection
    sheet.dismiss()
  }

  const handleClearSelection = () => {
    // Clear internal state if not controlled
    if (controlledSelectedSchemeName === undefined) {
      setInternalSelectedSchemeName(null)
    }
    // Notify parent
    onClearSelection?.()
    sheet.dismiss()
  }

  return (
    <BottomSheetModalComponent
      id={id}
      snapPoints={["75%"]}
      onDismiss={onDismiss}
      enablePanDownToClose={true}
      backdropPressBehavior="close"
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerLabel}>Current Theme</Text>
            {themeInfo && (
              <Text style={styles.headerTheme}>{themeInfo.variant}</Text>
            )}
          </View>

          {/* Color Grid */}
          {themeInfo && themeInfo.schemes.length > 0 ? (
            <View style={styles.colorGrid}>
              {themeInfo.schemes.map((scheme) => {
                const isSelected = selectedScheme?.name === scheme.name
                const variantName = getVariantName(scheme.name)
                return (
                  <View key={scheme.name} style={styles.colorOptionContainer}>
                    <Pressable
                      style={[
                        styles.colorOption,
                        isSelected && styles.colorOptionSelected,
                      ]}
                      onPress={() => handleColorSelect(scheme)}
                    >
                      <View
                        style={[
                          styles.colorCircle,
                          { backgroundColor: scheme.primary },
                        ]}
                      />
                      {isSelected && <View style={styles.checkmark} />}
                    </Pressable>
                    <Text style={styles.variantLabel} numberOfLines={1}>
                      {variantName}
                    </Text>
                  </View>
                )
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No color variants available for the current theme
              </Text>
            </View>
          )}

          {/* Clear Button */}
          {themeInfo && themeInfo.schemes.length > 0 && selectedSchemeName && (
            <Pressable
              style={styles.clearButton}
              onPress={handleClearSelection}
            >
              <Text style={styles.clearButtonText}>Clear Selection</Text>
            </Pressable>
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModalComponent>
  )
}

const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
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
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  colorOptionContainer: {
    alignItems: "center",
    width: 64,
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
  variantLabel: {
    fontSize: 10,
    color: theme.colors.onSurface,
    opacity: 0.6,
    marginTop: 4,
    textAlign: "center",
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.5,
    textAlign: "center",
  },
  clearButton: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.colors.radius,
    alignSelf: "center",
    marginTop: 8,
  },
  clearButtonText: {
    color: theme.colors.onSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
}))
