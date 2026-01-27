import * as Clipboard from "expo-clipboard"
import * as ImagePicker from "expo-image-picker"
import { useState } from "react"
import { ScrollView } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import {
  BottomSheetModalComponent,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { DynamicIcon } from "~/components/dynamic-icon"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { MintyColorScheme } from "~/styles/theme/types"
import { isImageUrl } from "~/utils/is-image-url"
import { Toast } from "~/utils/toast"

interface ImageSelectionSheetProps {
  id: string
  onIconSelected?: (icon: string) => void
}

export const ImageSelectionSheet = ({
  id,
  onIconSelected,
}: ImageSelectionSheetProps) => {
  const sheet = useBottomSheet(id)
  const { theme } = useUnistyles()
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null)

  // Create colorScheme from theme for DynamicIcon
  const colorScheme: MintyColorScheme = {
    name: "preview",
    isDark: theme.isDark,
    surface: theme.colors.surface,
    onSurface: theme.colors.onSurface,
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    customColors: theme.colors.customColors,
  }

  const handlePasteImage = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync()

      if (!clipboardText || clipboardText.trim() === "") {
        Toast.error({
          title: "No image link",
          description: "There is no link to copy from clipboard",
        })
        return
      }

      // Check if it's a valid image URL
      if (isImageUrl(clipboardText.trim())) {
        setSelectedImageUri(clipboardText.trim())
      } else {
        Toast.error({
          title: "Invalid image link",
          description: "The clipboard does not contain a valid image URL",
        })
      }
    } catch {
      Toast.error({
        title: "Error",
        description: "Failed to read clipboard content",
      })
    }
  }

  const handlePickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Toast.error({
        title: "Permission Required",
        description: "We need access to your photos to select an image.",
      })
      return
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setSelectedImageUri(result.assets[0].uri)
    }
  }

  const handleDone = () => {
    if (selectedImageUri) {
      onIconSelected?.(selectedImageUri)
      sheet.dismiss()
    }
  }

  return (
    <BottomSheetModalComponent
      id={id}
      snapPoints={["70%"]}
      backdropOpacity={0.5}
      backdropPressBehavior="close"
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Title */}
          <Text variant="h2" style={styles.title}>
            Image
          </Text>

          {/* Paste Image Option */}
          <Pressable style={styles.pasteOption} onPress={handlePasteImage}>
            <IconSymbol
              name="clipboard-outline"
              size={20}
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Paste an image</Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Image Preview */}
          <View style={styles.previewContainer}>
            <Pressable
              style={styles.previewBox}
              onPress={handlePickImage}
              disabled={!!selectedImageUri}
            >
              {selectedImageUri ? (
                <DynamicIcon
                  icon={selectedImageUri}
                  size={96}
                  colorScheme={colorScheme}
                />
              ) : (
                <IconSymbol
                  name="image-outline"
                  size={48}
                  style={styles.previewPlaceholderIcon}
                />
              )}
            </Pressable>
          </View>

          {/* Pick Image Option */}
          <Pressable style={styles.pickOption} onPress={handlePickImage}>
            <IconSymbol
              name="image-multiple-outline"
              size={20}
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Pick an image</Text>
          </Pressable>

          {/* Done Button */}
          <View style={styles.footer}>
            <Button
              onPress={handleDone}
              variant="ghost"
              disabled={!selectedImageUri}
            >
              <IconSymbol name="check" size={20} />
              <Text>Done</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </BottomSheetModalComponent>
  )
}

const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
    color: theme.colors.onSurface,
  },
  pasteOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.onSurface,
    opacity: 0.1,
    marginVertical: 16,
  },
  previewContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
  },
  previewBox: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary || theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  previewPlaceholderIcon: {
    color: theme.colors.primary,
    opacity: 0.6,
  },
  pickOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  optionIcon: {
    color: theme.colors.primary,
  },
  optionText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 16,
  },
}))
