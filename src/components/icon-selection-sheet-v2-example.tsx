/**
 * Example usage of IconSelectionSheet
 *
 * This file demonstrates how to use the enhanced icon selection sheet
 * with fuzzy search and dual icon libraries (Material Symbols & Brands).
 */

import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useState } from "react"
import { Pressable, View } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { useBottomSheet } from "~/components/bottom-sheet"
import { IconSelectionSheet } from "~/components/icon-selection-sheet"
import { Text } from "~/components/ui/text"

/**
 * Example component showing how to integrate IconSelectionSheet
 */
export const IconSelectionExample = () => {
  const { theme } = useUnistyles()
  const [selectedIcon, setSelectedIcon] = useState<string>("wallet-outline")
  const sheet = useBottomSheet("icon-picker-v2-demo")

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon)
    // Icon selected, you can now save to database or perform other actions
  }

  return (
    <View style={styles.container}>
      <Text variant="h2" style={styles.title}>
        Icon Selection Demo
      </Text>

      <Text variant="p" style={styles.description}>
        Tap the icon below to open the icon selector
      </Text>

      {/* Icon Display Button */}
      <Pressable
        style={[styles.iconButton, { backgroundColor: theme.colors.secondary }]}
        onPress={() => sheet.present()}
      >
        <MaterialCommunityIcons
          name={selectedIcon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={48}
          color={theme.colors.onSurface}
        />
      </Pressable>

      <Text variant="p" style={styles.selectedText}>
        Selected: <Text style={styles.iconName}>{selectedIcon}</Text>
      </Text>

      {/* The Icon Selection Sheet */}
      <IconSelectionSheet
        id="icon-picker-v2-demo"
        initialIcon={selectedIcon}
        onIconSelected={handleIconSelect}
      />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  title: {
    color: theme.colors.onSurface,
  },
  description: {
    textAlign: "center",
    color: theme.colors.onSecondary,
  },
  iconButton: {
    width: 120,
    height: 120,
    borderRadius: (theme.colors.radius || 12) * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedText: {
    color: theme.colors.onSecondary,
  },
  iconName: {
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
}))
