import { useRouter } from "expo-router"
import { StyleSheet } from "react-native-unistyles"

import { DynamicIcon } from "~/components/dynamic-icon"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { Category } from "~/types/categories"

interface CategoryRowProps {
  category: Category
  transactionCount: number
}

export const CategoryRow = ({
  category,
  transactionCount,
}: CategoryRowProps) => {
  const router = useRouter()

  const handleEdit = () => {
    router.push({
      pathname: "/settings/categories/[category-modify-id]",
      params: {
        "category-modify-id": category.id,
      },
    })
  }

  return (
    <Pressable style={styles.row} onPress={handleEdit}>
      <View style={styles.rowContent}>
        {/* Icon/Color indicator */}
        <DynamicIcon
          icon={category.icon}
          size={32}
          colorScheme={category.colorScheme}
        />

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

      <IconSymbol name="chevron-right" size={20} style={styles.chevron} />
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 16,
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
