/**
 * Inline icon picker: trigger (icon box) + expandable panel.
 * Options: Icon (sheet), Emoji/Letter and Image (inline modes with Done/Cancel).
 */

import * as Clipboard from "expo-clipboard"
import * as ImagePicker from "expo-image-picker"
import type { ComponentRef } from "react"
import { useRef, useState } from "react"
import { TextInput as RNTextInput, ScrollView, View } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { useBottomSheet } from "~/components/bottom-sheet"
import { DynamicIcon } from "~/components/dynamic-icon"
import { IconSelectionSheet } from "~/components/icon-selection-sheet"
import { Button } from "~/components/ui/button"
import type { IconSize } from "~/components/ui/icon-symbol"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import type { MintyColorScheme } from "~/styles/theme/types"
import { isImageUrl } from "~/utils/is-image-url"
import {
  getLastGrapheme,
  isSingleEmojiOrLetter,
} from "~/utils/is-single-emoji-or-letter"
import { Toast } from "~/utils/toast"

export interface ChangeIconInlineProps {
  /** Unique id for this instance (e.g. change-icon-category-123). Used for nested sheet ids. */
  id: string
  /** Currently selected icon (name, emoji, or image uri). */
  currentIcon?: string
  /** Called when user selects an icon from any source. */
  onIconSelected?: (icon: string) => void
  /** Color scheme for the icon box and icon picker. */
  colorScheme?: MintyColorScheme
  /** Icon box size in px. Default 96. Must be a valid IconSize. */
  iconSize?: IconSize
}

type InlineMode = null | "emoji" | "image"

export function ChangeIconInline({
  id,
  currentIcon,
  onIconSelected,
  colorScheme: colorSchemeProp,
  iconSize = 64,
}: ChangeIconInlineProps) {
  const { theme } = useUnistyles()
  const [expanded, setExpanded] = useState(false)
  const [mode, setMode] = useState<InlineMode>(null)
  const [emojiInputValue, setEmojiInputValue] = useState("")
  const [imageUri, setImageUri] = useState<string | null>(null)
  const emojiInputRef = useRef<ComponentRef<typeof RNTextInput>>(null)

  const colorScheme: MintyColorScheme = colorSchemeProp ?? {
    name: "preview",
    isDark: theme.isDark,
    surface: theme.colors.surface,
    onSurface: theme.colors.onSurface,
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    customColors: theme.colors.customColors,
  }

  const iconSheetId = `${id}-icon`
  const iconSheet = useBottomSheet(iconSheetId)

  const handleToggle = () => {
    if (mode !== null) return
    setExpanded((v) => !v)
  }

  const handleIconPress = () => {
    iconSheet.present()
  }

  const handleEmojiLetterPress = () => {
    setEmojiInputValue("")
    setMode("emoji")
  }

  const handleEmojiTextChange = (text: string) => {
    // Each key press replaces the previous character/emoji (use last grapheme)
    const single = getLastGrapheme(text)
    setEmojiInputValue(single)
  }

  const handleImagePress = () => {
    setImageUri(null)
    setMode("image")
  }

  const handleEmojiDone = () => {
    const trimmed = emojiInputValue.trim()
    if (trimmed && isSingleEmojiOrLetter(trimmed)) {
      onIconSelected?.(trimmed)
      setMode(null)
      setEmojiInputValue("")
    }
  }

  const handleEmojiCancel = () => {
    setMode(null)
    setEmojiInputValue("")
  }

  const handleImagePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync()
      if (!text?.trim()) {
        Toast.error({
          title: "No image link",
          description: "There is no link to copy from clipboard",
        })
        return
      }
      const trimmed = text.trim()
      if (isImageUrl(trimmed)) {
        setImageUri(trimmed)
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

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Toast.error({
        title: "Permission Required",
        description: "We need access to your photos to select an image.",
      })
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri)
    }
  }

  const handleImageDone = () => {
    if (imageUri) {
      onIconSelected?.(imageUri)
      setMode(null)
      setImageUri(null)
    }
  }

  const handleImageCancel = () => {
    setMode(null)
    setImageUri(null)
  }

  const emojiValid =
    emojiInputValue.trim() !== "" &&
    isSingleEmojiOrLetter(emojiInputValue.trim())

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={[
          styles.iconBox,
          colorScheme?.secondary && { backgroundColor: colorScheme.secondary },
        ]}
        onPress={handleToggle}
      >
        <DynamicIcon
          icon={currentIcon}
          size={iconSize}
          colorScheme={colorScheme}
        />
      </Pressable>

      {expanded && (
        <View style={styles.panel}>
          <View style={styles.listWrapper}>
            {mode === null && (
              <>
                <Pressable
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.item,
                    pressed && styles.itemPressed,
                  ]}
                  onPress={handleIconPress}
                >
                  <View style={styles.itemLeft}>
                    <IconSymbol name="shape" size={24} />
                    <Text variant="large" style={styles.itemTitle}>
                      Icon
                    </Text>
                  </View>
                  <IconSymbol
                    name="chevron-right"
                    size={20}
                    style={styles.itemChevron}
                  />
                </Pressable>
                <Pressable
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.item,
                    pressed && styles.itemPressed,
                  ]}
                  onPress={handleEmojiLetterPress}
                >
                  <View style={styles.itemLeft}>
                    <IconSymbol name="tag" size={24} />
                    <Text variant="large" style={styles.itemTitle}>
                      Emoji/Letter
                    </Text>
                  </View>
                  <IconSymbol
                    name="chevron-right"
                    size={20}
                    style={styles.itemChevron}
                  />
                </Pressable>
                <Pressable
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.item,
                    pressed && styles.itemPressed,
                  ]}
                  onPress={handleImagePress}
                >
                  <View style={styles.itemLeft}>
                    <IconSymbol name="image" size={24} />
                    <Text variant="large" style={styles.itemTitle}>
                      Image
                    </Text>
                  </View>
                  <IconSymbol
                    name="chevron-right"
                    size={20}
                    style={styles.itemChevron}
                  />
                </Pressable>
              </>
            )}

            {mode === "emoji" && (
              <View style={styles.modeContent}>
                <Text variant="h3" style={styles.emojiTitle}>
                  Emoji/Letter
                </Text>
                <View style={styles.emojiPreviewContainer}>
                  <Pressable
                    style={styles.emojiPreviewBox}
                    onPress={() => emojiInputRef.current?.focus()}
                  >
                    <RNTextInput
                      ref={emojiInputRef}
                      style={styles.emojiPreviewInput}
                      value={emojiInputValue}
                      onChangeText={handleEmojiTextChange}
                      placeholder="?"
                      placeholderTextColor={theme.colors.onSecondary}
                      maxLength={10}
                      autoFocus
                      textAlign="center"
                    />
                    <Text style={styles.emojiPreviewText}>
                      {emojiInputValue || "?"}
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.emojiInstructionContainer}>
                  <Text variant="p" style={styles.emojiInstructionText}>
                    Enter an emoji or a letter to use as an icon
                  </Text>
                </View>
                <View style={styles.modeActions}>
                  <Button variant="outline" onPress={handleEmojiCancel}>
                    <Text>Cancel</Text>
                  </Button>
                  <Button
                    variant="ghost"
                    onPress={handleEmojiDone}
                    disabled={!emojiValid}
                  >
                    <IconSymbol name="check" size={20} />
                    <Text>Done</Text>
                  </Button>
                </View>
              </View>
            )}

            {mode === "image" && (
              <ScrollView
                contentContainerStyle={styles.modeScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modeContent}>
                  <Text variant="h3" style={styles.modeTitle}>
                    Image
                  </Text>
                  <Pressable
                    style={styles.pasteOption}
                    onPress={handleImagePaste}
                  >
                    <IconSymbol
                      name="clipboard"
                      size={20}
                      style={styles.optionIcon}
                    />
                    <Text style={styles.optionText}>Paste an image</Text>
                  </Pressable>
                  <View style={styles.divider} />
                  <View style={styles.previewContainer}>
                    <Pressable
                      style={styles.previewBox}
                      onPress={handleImagePick}
                      disabled={!!imageUri}
                    >
                      {imageUri ? (
                        <DynamicIcon
                          icon={imageUri}
                          size={96}
                          colorScheme={colorScheme}
                        />
                      ) : (
                        <IconSymbol
                          name="image"
                          size={48}
                          style={styles.previewPlaceholderIcon}
                        />
                      )}
                    </Pressable>
                  </View>
                  <Pressable
                    style={styles.pickOption}
                    onPress={handleImagePick}
                  >
                    <IconSymbol
                      name="image-multiple"
                      size={20}
                      style={styles.optionIcon}
                    />
                    <Text style={styles.optionText}>Pick an image</Text>
                  </Pressable>
                  <View style={styles.modeActions}>
                    <Button variant="outline" onPress={handleImageCancel}>
                      <Text>Cancel</Text>
                    </Button>
                    <Button
                      variant="default"
                      onPress={handleImageDone}
                      disabled={!imageUri}
                    >
                      <Text>Done</Text>
                    </Button>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      )}

      <IconSelectionSheet
        id={iconSheetId}
        colorScheme={colorScheme}
        initialIcon={currentIcon}
        onIconSelected={(selectedIcon) => {
          onIconSelected?.(selectedIcon)
          iconSheet.dismiss()
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 20,
    gap: 16,
  },
  iconBox: {
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: 0,
  },
  listWrapper: {
    borderRadius: theme.colors.radius ?? 12,
    overflow: "hidden",
    backgroundColor: `${theme.colors.onSurface}08`,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  itemPressed: {
    opacity: 0.7,
    backgroundColor: `${theme.colors.onSurface}10`,
  },
  itemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemTitle: {
    fontWeight: "500",
    fontSize: 18,
    color: theme.colors.onSurface,
  },
  itemChevron: {
    color: theme.colors.onSecondary,
    opacity: 0.6,
  },
  // Inline mode content (emoji / image)
  modeScrollContent: {
    flexGrow: 1,
  },
  modeContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  modeTitle: {
    marginBottom: 24,
    textAlign: "center",
    color: theme.colors.onSurface,
  },
  // Emoji/Letter – same as original EmojiLetterSelectionSheet
  emojiTitle: {
    textAlign: "center",
    marginBottom: 32,
    color: theme.colors.onSurface,
  },
  emojiPreviewContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emojiPreviewBox: {
    width: 120,
    height: 120,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.secondary ?? theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  emojiPreviewInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    fontSize: 64,
    fontWeight: "600",
    color: theme.colors.primary,
    textAlign: "center",
    opacity: 0,
  },
  emojiPreviewText: {
    fontSize: 64,
    fontWeight: "600",
    color: theme.colors.primary,
    textAlign: "center",
    lineHeight: 72,
  },
  emojiInstructionContainer: {
    paddingHorizontal: 8,
    marginBottom: 32,
    width: "100%",
    alignItems: "center",
  },
  emojiInstructionText: {
    textAlign: "center",
    color: theme.colors.onSecondary,
    flexShrink: 1,
  },
  modeActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    paddingTop: 8,
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
    width: 160,
    height: 160,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary ?? theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
}))
