import { StyleSheet } from "react-native-unistyles"

import {
  BottomSheetModalComponent,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { Tag } from "~/types/tags"

interface DeleteTagSheetProps {
  tag: Tag
  onConfirm: () => void
}

export function DeleteTagSheet({ tag, onConfirm }: DeleteTagSheetProps) {
  const sheet = useBottomSheet(`delete-tag-${tag.id}`)

  const handleConfirm = () => {
    onConfirm()
    sheet.dismiss()
  }

  const handleCancel = () => {
    sheet.dismiss()
  }

  const transactionCount = tag.transactionCount ?? 0
  const description =
    transactionCount > 0
      ? `This tag is used by ${transactionCount} transaction${transactionCount !== 1 ? "s" : ""}. Deleting the tag will unlink it from all of them. This action cannot be undone.`
      : "Deleting this tag cannot be undone. This action is irreversible!"

  return (
    <BottomSheetModalComponent id={`delete-tag-${tag.id}`}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <IconSymbol name="trash-can" size={40} style={styles.icon} />
        </View>

        <Text variant="h4" style={styles.title}>
          Confirm deleting {tag.name}?
        </Text>

        <Text variant="p" style={styles.description}>
          {description}
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            variant="outline"
            onPress={handleCancel}
            style={styles.button}
          >
            <Text variant="default">Cancel</Text>
          </Button>
          <Button
            variant="destructive"
            onPress={handleConfirm}
            style={styles.button}
          >
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
    paddingBottom: 40,
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
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
}))
