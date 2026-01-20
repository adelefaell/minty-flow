import { StyleSheet } from "react-native-unistyles"

import {
  BottomSheetModalComponent,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

import type { Category } from "../types/categories"

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

  return (
    <BottomSheetModalComponent id={`delete-category-${category.id}`}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <IconSymbol name="trash" size={40} style={styles.icon} />
        </View>

        <Text variant="h3" style={styles.title}>
          Delete Category
        </Text>

        <Text variant="p" style={styles.description}>
          Are you sure you want to delete "{category.name}"? This action cannot
          be undone.
          {category.transactionCount > 0 && (
            <>
              {"\n\n"}
              This category has {category.transactionCount} transaction
              {category.transactionCount !== 1 ? "s" : ""} associated with it.
            </>
          )}
        </Text>

        <View style={styles.buttonContainer}>
          <Button variant="destructive" onPress={handleConfirm}>
            <Text variant="default">Delete</Text>
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
