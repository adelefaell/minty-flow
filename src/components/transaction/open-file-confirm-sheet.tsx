import { StyleSheet } from "react-native-unistyles"

import { BottomSheetModalComponent } from "~/components/bottom-sheet"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { TransactionAttachment } from "~/types/transactions"
import { openFileInExternalApp } from "~/utils/open-file"

const H_PAD = 20

export const OPEN_FILE_SHEET_ID = "transaction-v3-open-file"

interface OpenFileConfirmSheetProps {
  /** Unique identifier for this sheet (use OPEN_FILE_SHEET_ID with useBottomSheet) */
  id: string
  /** File to show in the confirmation (for title and opening) */
  fileToOpen: TransactionAttachment | null
  /** Called when user taps Cancel or sheet is dismissed */
  onDismiss: () => void
  /** Called when user taps Confirm (caller should dismiss and clear state) */
  onConfirm: (file: TransactionAttachment) => void
}

export function OpenFileConfirmSheet({
  id,
  fileToOpen,
  onDismiss,
  onConfirm,
}: OpenFileConfirmSheetProps) {
  const handleConfirm = async () => {
    if (fileToOpen) {
      try {
        await openFileInExternalApp(fileToOpen.uri, fileToOpen.ext)
      } finally {
        onConfirm(fileToOpen)
      }
    }
  }

  return (
    <BottomSheetModalComponent
      id={id}
      enableDynamicSizing
      enablePanDownToClose
      onDismiss={onDismiss}
    >
      <View style={styles.content}>
        <Text variant="default" style={styles.title}>
          Open {fileToOpen?.name ?? "file"}?
        </Text>
        <Text variant="muted" style={styles.message}>
          Are you sure you want to open this file?
        </Text>
        <View style={styles.actions}>
          <Button variant="ghost" onPress={onDismiss} style={styles.button}>
            <Text>Cancel</Text>
          </Button>
          <Button
            variant="secondary"
            onPress={handleConfirm}
            style={styles.button}
          >
            <Text>Confirm</Text>
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
