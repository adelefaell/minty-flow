import { StyleSheet } from "react-native-unistyles"

import {
  BottomSheetModalComponent,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { AccountModel } from "~/database"

interface ArchiveAccountSheetProps {
  account: AccountModel
  onConfirm: () => void
}

export const ArchiveAccountSheet = ({
  account,
  onConfirm,
}: ArchiveAccountSheetProps) => {
  const sheet = useBottomSheet(`archive-account-${account.id}`)

  const handleConfirm = () => {
    onConfirm()
    sheet.dismiss()
  }

  const handleCancel = () => {
    sheet.dismiss()
  }

  return (
    <BottomSheetModalComponent id={`archive-account-${account.id}`}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <IconSymbol name="archive-arrow-down" size={40} style={styles.icon} />
        </View>

        <Text variant="h3" style={styles.title}>
          Archive Account
        </Text>

        <Text variant="p" style={styles.description}>
          Are you sure you want to archive "{account.name}"? Archived accounts
          will be hidden from the main list but can be restored later.
        </Text>

        <View style={styles.buttonContainer}>
          <Button variant="default" onPress={handleConfirm}>
            <Text variant="default">Archive</Text>
          </Button>
          <Button variant="outline" onPress={handleCancel}>
            <Text variant="default">Cancel</Text>
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
    color: theme.colors.primary,
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
