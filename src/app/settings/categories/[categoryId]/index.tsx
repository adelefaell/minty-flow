import { withObservables } from "@nozbe/watermelondb/react"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { useLayoutEffect } from "react"
import { StyleSheet } from "react-native-unistyles"

import { DynamicIcon } from "~/components/dynamic-icon"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { observeCategoryDetailsById } from "~/database/services/category-service"
import { getThemeStrict } from "~/styles/theme/registry"
import type { Category } from "~/types/categories"

interface CategoryDetailsProps {
  category: Category
}

const CategoryDetailsScreenInner = ({ category }: CategoryDetailsProps) => {
  // Convert models to domain types
  // const category = modelToCategory(categoryModel)
  const router = useRouter()
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          variant="ghost"
          size="icon"
          onPress={() =>
            router.push({
              pathname: "/settings/categories/[categoryId]/modify",
              params: { categoryId: category.id },
            })
          }
        >
          <IconSymbol name="pencil" size={20} />
        </Button>
      ),
    })
  }, [navigation, router, category.id])

  if (!category) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="default">Loading category...</Text>
        </View>
      </View>
    )
  }

  const colorScheme = getThemeStrict(category.colorSchemeName)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <DynamicIcon
          icon={category.icon || "shapes"}
          size={40}
          colorScheme={colorScheme}
        />

        <Text variant="h3" style={styles.categoryName}>
          {category.name}
        </Text>
        <Text variant="default" style={styles.categoryType}>
          {category.type.toUpperCase()}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.placeholderContainer}>
          <IconSymbol name="chart-box" size={48} color="gray" outline />
          <Text variant="default" style={styles.placeholderText}>
            Transactions coming soon
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.onSurface,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  categoryType: {
    fontSize: 12,
    color: theme.colors.customColors.semi,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
    gap: 10,
  },
  placeholderText: {
    color: theme.colors.onSurface,
  },
}))

const EnhancedCategoryDetailsScreen = withObservables(
  ["categoryId"],
  ({ categoryId }) => ({
    category: observeCategoryDetailsById(categoryId),
  }),
)(CategoryDetailsScreenInner)

export default function CategoryDetailsScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>()

  if (!categoryId) return null

  return <EnhancedCategoryDetailsScreen categoryId={categoryId} />
}
