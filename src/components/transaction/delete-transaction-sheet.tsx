import { StyleSheet } from "react-native-unistyles"

import { BottomSheetModalComponent } from "~/components/bottom-sheet"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

export const DELETE_TRANSACTION_SHEET_ID = "delete-transaction"

interface DeleteTransactionSheetProps {
  id: string
  onDismiss: () => void
  onConfirm: () => void
}

export function DeleteTransactionSheet({
  id,
  onDismiss,
  onConfirm,
}: DeleteTransactionSheetProps) {
  const handleConfirm = () => {
    onConfirm()
    onDismiss()
  }

  return (
    <BottomSheetModalComponent
      id={id}
      enableDynamicSizing
      enablePanDownToClose
      onDismiss={onDismiss}
    >
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <IconSymbol name="trash-can" size={40} style={styles.icon} />
        </View>
        <Text variant="h3" style={styles.title}>
          Move to trash?
        </Text>
        <Text variant="p" style={styles.description}>
          This transaction will be moved to trash. You can restore it later from
          the trash.
        </Text>
        <View style={styles.buttonContainer}>
          <Button variant="outline" onPress={onDismiss} style={styles.button}>
            <Text variant="default">Cancel</Text>
          </Button>
          <Button
            variant="destructive"
            onPress={handleConfirm}
            style={styles.button}
          >
            <Text variant="default">Move to trash</Text>
          </Button>
        </View>
      </View>
    </BottomSheetModalComponent>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: 20,
    gap: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 4,
  },
  icon: {
    color: theme.colors.error,
  },
  title: {
    textAlign: "center",
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  description: {
    textAlign: "center",
    color: theme.colors.onSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
}))
