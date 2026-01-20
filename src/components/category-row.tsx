import { useRouter } from "expo-router"
import { useState } from "react"
import { StyleSheet } from "react-native-unistyles"

import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

import type { Category } from "../types/categories"

interface CategoryRowProps {
  category: Category
  transactionCount: number
  onEdit: (updates: Partial<Category>) => void
  onDelete: () => void
}

export function CategoryRow({
  category,
  transactionCount,
  onEdit,
  onDelete,
}: CategoryRowProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleEdit = () => {
    router.push({
      pathname: "/(settings)/(categories)/[categoryId]",
      params: {
        categoryId: category.id,
        categoryName: category.name,
        categoryType: category.type,
        transactionCount: transactionCount.toString(),
      },
    })
  }

  const handleDelete = (action: "archive" | "delete") => {
    // TODO: Handle archive vs delete action appropriately
    // For now, both actions trigger the same onDelete callback
    // This should be updated to handle archiving separately
    onDelete()
    setIsDeleteDialogOpen(false)
  }

  return (
    <Pressable style={styles.row} onPress={handleEdit}>
      <View style={styles.rowContent}>
        {/* Icon/Color indicator */}
        <View
          style={[
            styles.iconContainer,
            category.color && {
              backgroundColor: getColorValue(category.color.name),
            },
          ]}
        >
          {category.icon ? (
            <IconSymbol
              name={category.icon as any}
              size={20}
              color={
                category.color
                  ? getContrastColor(category.color.name)
                  : undefined
              }
            />
          ) : (
            <View
              style={[
                styles.colorDot,
                category.color && {
                  backgroundColor: getColorValue(category.color.name),
                },
              ]}
            />
          )}
        </View>

        {/* Category name */}
        <View style={styles.nameContainer}>
          <Text variant="default" style={styles.name}>
            {category.name}
          </Text>
          {transactionCount > 0 && (
            <Text variant="small" style={styles.count}>
              {transactionCount} transaction
              {transactionCount !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
      </View>

      <IconSymbol name="chevron.right" size={20} style={styles.chevron} />
    </Pressable>
  )
}

// Helper functions for colors (simplified - replace with actual color system)
function getColorValue(colorName: string): string {
  const colorMap: Record<string, string> = {
    emerald: "#10b981",
    blue: "#3b82f6",
    red: "#ef4444",
    purple: "#a855f7",
    pink: "#ec4899",
    green: "#22c55e",
    amber: "#f59e0b",
    teal: "#14b8a6",
    indigo: "#6366f1",
    rose: "#f43f5e",
    orange: "#f97316",
  }
  return colorMap[colorName] || "#6b7280"
}

function getContrastColor(colorName: string): string {
  // Return white or black based on color brightness
  const darkColors = ["blue", "purple", "indigo", "emerald", "teal"]
  return darkColors.includes(colorName) ? "#ffffff" : "#000000"
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    minHeight: 60,
  },
  rowContent: {
    backgroundColor: theme.colors.secondary,
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,

    alignItems: "center",
    justifyContent: "center",
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
  },
  nameContainer: {
    backgroundColor: theme.colors.secondary,

    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  count: {
    fontSize: 12,
    color: theme.colors.onSecondary,
  },
  chevron: {
    color: theme.colors.onSecondary,
    opacity: 0.5,
  },
}))
