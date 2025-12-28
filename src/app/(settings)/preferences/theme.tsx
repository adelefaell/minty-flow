import { Pressable, ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { type ThemeMode, useThemeStore } from "~/stores/theme.store"
import { STANDALONE_THEMES, THEME_GROUPS } from "~/styles/theme/registry"

export default function ThemeSettingsScreen() {
  const { themeMode, setThemeMode } = useThemeStore()

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
  }

  // Helper function to get theme display name
  const getThemeDisplayName = (themeName: string): string => {
    // Convert camelCase to Title Case
    return themeName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Theme Groups */}
      {Object.entries(THEME_GROUPS).map(([category, groups]) => (
        <View key={category} style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>{category}</Text>
          {groups.map((group) => (
            <View key={group.name} style={styles.groupContainer}>
              <View style={styles.groupHeader}>
                {group.icon && (
                  <Text style={styles.groupIcon}>{group.icon}</Text>
                )}
                <Text style={styles.groupTitle}>{group.name}</Text>
              </View>
              <View style={styles.themesGrid}>
                {group.schemes.map((scheme) => {
                  const isSelected = themeMode === scheme.name
                  return (
                    <Pressable
                      key={scheme.name}
                      style={[
                        styles.themeOption,
                        isSelected && styles.themeOptionSelected,
                      ]}
                      onPress={() =>
                        handleThemeChange(scheme.name as ThemeMode)
                      }
                    >
                      {/* Color Preview */}
                      <View
                        style={[
                          styles.colorPreview,
                          { backgroundColor: scheme.primary },
                        ]}
                      >
                        <View
                          style={[
                            styles.colorPreviewSecondary,
                            { backgroundColor: scheme.secondary },
                          ]}
                        />
                      </View>

                      {/* Theme Info */}
                      <View style={styles.themeInfo}>
                        <Text style={styles.themeName}>
                          {getThemeDisplayName(scheme.name)}
                        </Text>
                        <Text style={styles.themeDescription}>
                          {scheme.isDark ? "Dark" : "Light"} theme
                        </Text>
                      </View>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <View style={styles.selectionIndicator}>
                          <IconSymbol name="checkmark.circle" size={20} />
                        </View>
                      )}
                    </Pressable>
                  )
                })}
              </View>
            </View>
          ))}
        </View>
      ))}

      {/* Standalone Themes */}
      {Object.keys(STANDALONE_THEMES).length > 0 && (
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>Other Themes</Text>
          <View style={styles.themesGrid}>
            {Object.values(STANDALONE_THEMES).map((scheme) => {
              const isSelected = themeMode === scheme.name
              return (
                <Pressable
                  key={scheme.name}
                  style={[
                    styles.themeOption,
                    isSelected && styles.themeOptionSelected,
                  ]}
                  onPress={() => handleThemeChange(scheme.name as ThemeMode)}
                >
                  {/* Color Preview */}
                  <View
                    style={[
                      styles.colorPreview,
                      { backgroundColor: scheme.primary },
                    ]}
                  >
                    <View
                      style={[
                        styles.colorPreviewSecondary,
                        { backgroundColor: scheme.secondary },
                      ]}
                    />
                  </View>

                  {/* Theme Info */}
                  <View style={styles.themeInfo}>
                    <Text style={styles.themeName}>
                      {getThemeDisplayName(scheme.name)}
                    </Text>
                    <Text style={styles.themeDescription}>
                      {scheme.isDark ? "Dark" : "Light"} theme
                    </Text>
                  </View>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <View style={styles.selectionIndicator}>
                      <IconSymbol name="checkmark.circle" size={20} />
                    </View>
                  )}
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
    paddingBottom: 24,
  },
  categoryContainer: {
    marginTop: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  groupContainer: {
    marginBottom: 24,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  groupIcon: {
    fontSize: 18,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  themesGrid: {
    gap: 12,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  themeOptionSelected: {
    borderColor: theme.colors.primary,
  },
  colorPreview: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  colorPreviewSecondary: {
    width: "100%",
    height: "50%",
    position: "absolute",
    bottom: 0,
  },
  themeInfo: {
    flex: 1,
    minWidth: 0,
  },
  themeName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSecondary,
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 13,
    color: theme.colors.onSecondary,
    opacity: 0.7,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
}))
