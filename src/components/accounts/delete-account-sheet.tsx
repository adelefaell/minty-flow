import { StyleSheet } from "react-native-unistyles"

import {
  BottomSheetModalComponent,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { Account } from "~/types/accounts"

interface DeleteAccountSheetProps {
  account: Account
  onConfirm: () => void
}

export function DeleteAccountSheet({
  account,
  onConfirm,
}: DeleteAccountSheetProps) {
  const sheet = useBottomSheet(`delete-account-${account.id}`)

  const handleConfirm = () => {
    onConfirm()
    sheet.dismiss()
  }

  // TODO: add trasnaction count here when deleting

  const handleCancel = () => {
    sheet.dismiss()
  }

  const description =
    "Deleting this account cannot be undone. This action is irreversible!"

  return (
    <BottomSheetModalComponent id={`delete-account-${account.id}`}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <IconSymbol name="trash-can" size={40} style={styles.icon} />
        </View>

        <Text variant="h3" style={styles.title}>
          Confirm deleting {account.name}?
        </Text>

        <Text variant="p" style={styles.description}>
          {description}
        </Text>

        <View style={styles.buttonContainer}>
          <Button variant="outline" onPress={handleCancel}>
            <Text variant="default">Cancel</Text>
          </Button>
          <Button variant="destructive" onPress={handleConfirm}>
            <Text variant="default">Delete</Text>
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
    marginBottom: 8,
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
    gap: 12,
    marginBlock: 8,
  },
}))
