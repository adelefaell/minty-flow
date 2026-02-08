import { StyleSheet } from "react-native-unistyles"

import { BottomSheetModalComponent } from "~/components/bottom-sheet"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

const H_PAD = 20

export const DELETE_FILE_SHEET_ID = "transaction-v3-delete-file"

interface DeleteFileConfirmSheetProps {
  /** Unique identifier for this sheet (use DELETE_FILE_SHEET_ID with useBottomSheet) */
  id: string
  /** Called when user taps Cancel or sheet is dismissed */
  onDismiss: () => void
  /** Called when user taps Delete (caller should remove attachment, dismiss, and clear state) */
  onConfirm: () => void
}

export function DeleteFileConfirmSheet({
  id,
  onDismiss,
  onConfirm,
}: DeleteFileConfirmSheetProps) {
  return (
    <BottomSheetModalComponent
      id={id}
      enableDynamicSizing
      enablePanDownToClose
      onDismiss={onDismiss}
    >
      <View style={styles.content}>
        <Text variant="default" style={styles.title}>
          Delete file
        </Text>
        <Text variant="muted" style={styles.message}>
          Are you sure you want to remove this attachment?
        </Text>
        <View style={styles.actions}>
          <Button variant="ghost" onPress={onDismiss} style={styles.button}>
            <Text>Cancel</Text>
          </Button>
          <Button
            variant="destructive"
            onPress={onConfirm}
            style={styles.button}
          >
            <Text>Delete</Text>
          </Button>
        </View>
      </View>
    </BottomSheetModalComponent>
  )
}

const styles = StyleSheet.create(() => ({
  content: {
    padding: H_PAD,
    paddingBottom: 34,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  message: {
    fontSize: 15,
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
  button: {
    minWidth: 90,
  },
}))
