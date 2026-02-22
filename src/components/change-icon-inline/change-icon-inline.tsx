/**
 * Inline icon picker: trigger (icon box) + expandable panel.
 * Options: Icon (sheet), Emoji/Letter and Image (inline modes with Done/Cancel).
 */

import * as Clipboard from "expo-clipboard"
import * as ImagePicker from "expo-image-picker"
import type { ComponentRef } from "react"
import { useRef, useState } from "react"
import type { TextInput as RNTextInput } from "react-native"
import { View } from "react-native"
import { useUnistyles } from "react-native-unistyles"

import { useBottomSheet } from "~/components/bottom-sheet"
import { DynamicIcon } from "~/components/dynamic-icon"
import { IconSelectionSheet } from "~/components/icon-selection-sheet"
import { Pressable } from "~/components/ui/pressable"
import type { MintyColorScheme } from "~/styles/theme/types"
import { isImageUrl } from "~/utils/is-image-url"
import {
  getLastGrapheme,
  isSingleEmojiOrLetter,
} from "~/utils/is-single-emoji-or-letter"
import { Toast } from "~/utils/toast"

import { changeIconInlineStyles as styles } from "./change-icon-inline.styles"
import { EmojiLetterMode } from "./emoji-letter-mode"
import { ImageMode } from "./image-mode"
import { ModeSelectorList } from "./mode-selector-list"
import type { ChangeIconInlineProps, InlineMode } from "./types"

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
    onPrimary: theme.colors.onPrimary,
    secondary: theme.colors.secondary,
    onSecondary: theme.colors.onSecondary,
    error: theme.colors.error,
    onError: theme.colors.onError,
    customColors: theme.colors.customColors,
    rippleColor: theme.colors.rippleColor,
    shadow: theme.colors.shadow,
    boxShadow: theme.colors.boxShadow,
    radius: theme.colors.radius,
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
    let text: string
    try {
      text = await Clipboard.getStringAsync()
    } catch {
      Toast.error({
        title: "Error",
        description: "Failed to read clipboard content",
      })
      return
    }
    const trimmed = text ? text.trim() : ""
    if (!trimmed) {
      Toast.error({
        title: "No image link",
        description: "There is no link to copy from clipboard",
      })
      return
    }
    if (isImageUrl(trimmed)) {
      setImageUri(trimmed)
    } else {
      Toast.error({
        title: "Invalid image link",
        description: "The clipboard does not contain a valid image URL",
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
              <ModeSelectorList
                onIconPress={handleIconPress}
                onEmojiLetterPress={handleEmojiLetterPress}
                onImagePress={handleImagePress}
              />
            )}

            {mode === "emoji" && (
              <EmojiLetterMode
                value={emojiInputValue}
                onChangeText={handleEmojiTextChange}
                onDone={handleEmojiDone}
                onCancel={handleEmojiCancel}
                isValid={emojiValid}
                inputRef={emojiInputRef}
                placeholderTextColor={theme.colors.onSecondary}
              />
            )}

            {mode === "image" && (
              <ImageMode
                imageUri={imageUri}
                onPaste={handleImagePaste}
                onPick={handleImagePick}
                onDone={handleImageDone}
                onCancel={handleImageCancel}
                colorScheme={colorScheme}
              />
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
