import { useCallback, useState } from "react"
import { KeyboardAvoidingView, Modal, Platform, Pressable } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  StyleSheet as UnistylesSheet,
  useUnistyles,
} from "react-native-unistyles"

import { Input } from "~/components/ui/input"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

const MAX_NOTES_LENGTH = 500

interface NotesModalProps {
  visible: boolean
  initialValue: string
  onSave: (notes: string) => void
  onRequestClose: () => void
}

function NotesModalContent({
  initialValue,
  onSave,
  onRequestClose,
}: {
  initialValue: string
  onSave: (notes: string) => void
  onRequestClose: () => void
}) {
  const { theme } = useUnistyles()
  const insets = useSafeAreaInsets()
  const [localValue, setLocalValue] = useState(initialValue)

  const handleSave = useCallback(() => {
    onSave(localValue.trim())
    onRequestClose()
  }, [localValue, onSave, onRequestClose])

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: 16,
            paddingHorizontal: 20,
          },
        ]}
      >
        <Pressable
          onPress={onRequestClose}
          hitSlop={12}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>Notes</Text>
        <Pressable onPress={handleSave} hitSlop={12} style={styles.doneButton}>
          <Text style={[styles.doneText, { color: theme.colors.primary }]}>
            Done
          </Text>
        </Pressable>
      </View>

      <View style={[styles.content, { paddingHorizontal: 20 }]}>
        <Input
          style={styles.textInput}
          placeholder="Add notes about this transaction..."
          placeholderTextColor={theme.colors.customColors.semi}
          value={localValue}
          onChangeText={(text) =>
            setLocalValue(text.slice(0, MAX_NOTES_LENGTH))
          }
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>
          {localValue.length}/{MAX_NOTES_LENGTH}
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}

export function NotesModal({
  visible,
  initialValue,
  onSave,
  onRequestClose,
}: NotesModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      onRequestClose={onRequestClose}
    >
      {visible ? (
        <NotesModalContent
          key={initialValue}
          initialValue={initialValue}
          onSave={onSave}
          onRequestClose={onRequestClose}
        />
      ) : null}
    </Modal>
  )
}

const styles = UnistylesSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.customColors.semi,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  cancelButton: {
    minWidth: 70,
    alignItems: "flex-start",
  },
  doneButton: {
    minWidth: 70,
    alignItems: "flex-end",
  },
  cancelText: {
    fontSize: 17,
    color: theme.colors.onSurface,
  },
  doneText: {
    fontSize: 17,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingTop: 20,
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 160,
    fontSize: 16,
    color: theme.colors.onSurface,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderWidth: 0,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.customColors.semi,
    textAlign: "right",
  },
}))
