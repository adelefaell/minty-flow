import { StyleSheet } from "react-native-unistyles"

import {
  BottomSheetModalComponent,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { Category } from "~/types/categories"

interface DeleteCategorySheetProps {
  category: Category
  onConfirm: () => void
}

export function DeleteCategorySheet({
  category,
  onConfirm,
}: DeleteCategorySheetProps) {
  const sheet = useBottomSheet(`delete-category-${category.id}`)

  const handleConfirm = () => {
    onConfirm()
    sheet.dismiss()
  }

  const handleCancel = () => {
    sheet.dismiss()
  }

  const transactionCount = category.transactionCount ?? 0
  const description =
    transactionCount > 0
      ? `This category is used by ${transactionCount} transaction${transactionCount !== 1 ? "s" : ""}. Deleting it will unlink ${transactionCount === 1 ? "it" : "them"} (they will have no category). This action cannot be undone.`
      : "Deleting this category cannot be undone. This action is irreversible!"

  return (
    <BottomSheetModalComponent id={`delete-category-${category.id}`}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <IconSymbol name="trash-can" size={40} style={styles.icon} />
        </View>

        <Text variant="h3" style={styles.title}>
          Confirm deleting {category.name}?
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
    marginBottom: 10,
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
    gap: 10,
    marginBlock: 8,
  },
}))
