import { BottomSheetTextInput } from "@gorhom/bottom-sheet"
import type { ComponentRef } from "react"
import { useRef, useState } from "react"
import { Text as RNText } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import {
  BottomSheetModalComponent,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { isSingleEmojiOrLetter } from "~/utils/is-single-emoji-or-letter"

import { Button } from "./ui/button"

interface EmojiLetterSelectionSheetProps {
  id: string
  onIconSelected?: (icon: string) => void
}

export const EmojiLetterSelectionSheet = ({
  id,
  onIconSelected,
}: EmojiLetterSelectionSheetProps) => {
  const sheet = useBottomSheet(id)
  const inputRef = useRef<ComponentRef<typeof BottomSheetTextInput>>(null)
  const [inputValue, setInputValue] = useState("")
  const [displayValue, setDisplayValue] = useState("?")

  const handleTextChange = (text: string) => {
    setInputValue(text)
    setDisplayValue(text || "?")
  }

  const handleDone = () => {
    const trimmed = inputValue.trim()
    if (trimmed && isSingleEmojiOrLetter(trimmed)) {
      onIconSelected?.(trimmed)
      sheet.dismiss()
    }
    // If invalid, just don't dismiss - user can try again
  }

  return (
    <BottomSheetModalComponent id={id} keyboardBehavior="interactive">
      <View style={styles.container}>
        {/* Title */}
        <Text variant="h3" style={styles.title}>
          Emoji/Letter
        </Text>

        {/* Icon Preview Container */}
        <View style={styles.previewContainer}>
          <Pressable
            style={styles.previewBox}
            onPress={() => {
              inputRef.current?.focus()
            }}
          >
            <BottomSheetTextInput
              ref={inputRef}
              style={styles.previewInput}
              value={inputValue}
              onChangeText={handleTextChange}
              placeholder="?"
              placeholderTextColor={styles.placeholderText.color}
              maxLength={10} // Allow some buffer for emoji input
              autoFocus
              textAlign="center"
            />
            <RNText style={styles.previewText}>{displayValue}</RNText>
          </Pressable>
        </View>

        {/* Instructional Text */}
        <View style={styles.instructionContainer}>
          <Text variant="p" style={styles.instructionText}>
            Enter an emoji or a letter to use as an icon
          </Text>
        </View>

        {/* Done Button */}
        <View style={styles.footer}>
          <Button onPress={handleDone} variant="ghost">
            <IconSymbol name="check" size={20} />
            <Text>Done</Text>
          </Button>
        </View>
      </View>
    </BottomSheetModalComponent>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 32,
    color: theme.colors.onSurface,
  },
  previewContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  previewBox: {
    width: 120,
    height: 120,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.secondary || theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  previewInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    fontSize: 64,
    fontWeight: "600",
    color: theme.colors.primary,
    textAlign: "center",
    opacity: 0, // Hide the actual input, we'll show the display value
    // Don't set fontFamily - let the system use native emoji fonts for input
  },
  previewText: {
    fontSize: 64,
    fontWeight: "600",
    color: theme.colors.primary,
    textAlign: "center",
    // Don't set fontFamily - let the system use native emoji fonts
    // This ensures emojis render correctly on iOS (Apple Color Emoji) and Android (Noto Color Emoji)
    // Ensure proper lineHeight to avoid clipping on Android
    lineHeight: 72,
  },
  placeholderText: {
    color: theme.colors.onSecondary,
  },
  instructionContainer: {
    paddingHorizontal: 8,
    marginBottom: 32,
    width: "100%",
    alignItems: "center",
  },
  instructionText: {
    textAlign: "center",
    color: theme.colors.onSecondary,
    flexShrink: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: "auto",
  },
}))
