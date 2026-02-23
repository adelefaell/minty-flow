import type { ComponentRef, RefObject } from "react"
import { TextInput as RNTextInput, View } from "react-native"

import { Button } from "~/components/ui/button"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"

import { changeIconInlineStyles as styles } from "./change-icon-inline.styles"

interface EmojiLetterModeProps {
  value: string
  onChangeText: (text: string) => void
  onDone: () => void
  onCancel: () => void
  isValid: boolean
  inputRef: RefObject<ComponentRef<typeof RNTextInput> | null>
  placeholderTextColor: string
}

export function EmojiLetterMode({
  value,
  onChangeText,
  onDone,
  onCancel,
  isValid,
  inputRef,
  placeholderTextColor,
}: EmojiLetterModeProps) {
  return (
    <View style={styles.modeContent}>
      <Text variant="h3" style={styles.emojiTitle}>
        Emoji/Letter
      </Text>
      <View style={styles.emojiPreviewContainer}>
        <Pressable
          style={styles.emojiPreviewBox}
          onPress={() => inputRef.current?.focus()}
        >
          <RNTextInput
            ref={inputRef}
            style={styles.emojiPreviewInput}
            value={value}
            onChangeText={onChangeText}
            placeholder="?"
            placeholderTextColor={placeholderTextColor}
            maxLength={10}
            textAlign="center"
          />
          <Text style={styles.emojiPreviewText}>{value || "?"}</Text>
        </Pressable>
      </View>
      <View style={styles.emojiInstructionContainer}>
        <Text variant="p" style={styles.emojiInstructionText}>
          Enter an emoji or a letter to use as an icon
        </Text>
      </View>
      <View style={styles.modeActions}>
        <Button variant="outline" onPress={onCancel}>
          <Text>Cancel</Text>
        </Button>
        <Button onPress={onDone} disabled={!isValid}>
          <Text>Done</Text>
        </Button>
      </View>
    </View>
  )
}
