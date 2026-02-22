import type { ComponentRef } from "react"
import { TextInput as RNTextInput, View } from "react-native"

import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"

import { changeIconInlineStyles as styles } from "./change-icon-inline.styles"

interface EmojiLetterModeProps {
  value: string
  onChangeText: (text: string) => void
  onDone: () => void
  onCancel: () => void
  isValid: boolean
  inputRef: React.RefObject<ComponentRef<typeof RNTextInput> | null>
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
        <Button variant="ghost" onPress={onDone} disabled={!isValid}>
          <IconSymbol name="check" size={20} />
          <Text>Done</Text>
        </Button>
      </View>
    </View>
  )
}
