import { withObservables } from "@nozbe/watermelondb/react"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback } from "react"
import { FlatList } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type CategoryModel from "~/database/models/Category"
import { observeCategoriesByType } from "~/database/services/category-service"
import { modelToCategory } from "~/database/utils/model-to-category"
import { NewEnum } from "~/types/new"
import type { TransactionType } from "~/types/transactions"

import { Separator } from "../ui/separator"
import { CategoryRow } from "./category-row"

interface CategoryListProps {
  type: TransactionType
  createdCategory?: string
  updatedCategory?: string
  deletedCategory?: string
  includeArchived?: boolean
  searchQuery?: string
}

interface CategoryListInnerProps extends CategoryListProps {
  categoryModels: CategoryModel[]
}

const CategoryListInner = ({
  type,
  createdCategory,
  updatedCategory,
  deletedCategory,
  categoryModels,
  includeArchived = false,
  searchQuery = "",
}: CategoryListInnerProps & {
  includeArchived?: boolean
  searchQuery?: string
}) => {
  const router = useRouter()

  // Convert models to domain types
  const categories = categoryModels.map(modelToCategory)

  // Clear URL params when screen comes into focus
  // The reactive observe will automatically update the list
  useFocusEffect(
    useCallback(() => {
      if (createdCategory) {
        router.setParams({ createdCategory: undefined })
      }
      if (updatedCategory) {
        router.setParams({ updatedCategory: undefined })
      }
      if (deletedCategory) {
        router.setParams({ deletedCategory: undefined })
      }
    }, [createdCategory, updatedCategory, deletedCategory, router]),
  )

  const handleAddCategory = () => {
    router.push({
      pathname: "/settings/categories/[categoryId]/modify",
      params: {
        categoryId: NewEnum.NEW,
        initialType: type,
      },
    })
  }

  const handleAddFromPresets = () => {
    router.push({
      pathname: "/settings/categories/presets",
      params: {
        type,
      },
    })
  }

  // Separate active and archived categories
  const activeCategories = categories.filter((c) => !c.isArchived)
  const archivedCategories = categories.filter((c) => c.isArchived)

  const renderHeader = () => {
    // Don't show add buttons when viewing archived categories
    if (includeArchived) {
      return null
    }

    return (
      <>
        <View style={styles.headerContainer}>
          <Button
            variant="secondary"
            size="default"
            onPress={handleAddCategory}
            style={styles.headerButton}
          >
            <IconSymbol name="plus" size={20} />
            <Text variant="default" style={styles.headerButtonText}>
              Add New Category
            </Text>
          </Button>
          <Button
            variant="secondary"
            size="default"
            onPress={handleAddFromPresets}
            style={styles.headerButton}
          >
            <IconSymbol name="shape-plus" size={20} />
            <Text variant="default" style={styles.headerButtonText}>
              Add From Presets
            </Text>
          </Button>
        </View>

        <Separator />
      </>
    )
  }

  // When viewing archived, show ONLY archived categories
  // When viewing active, show ONLY active categories
  const allCategories = includeArchived ? archivedCategories : activeCategories

  // Filter categories based on search query
  const filteredCategories = allCategories.filter((category) => {
    if (searchQuery.trim().length === 0) return true
    return category.name
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())
  })

  if (filteredCategories.length === 0) {
    if (searchQuery) {
      return (
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyContainer}>
            <IconSymbol name="magnify" size={40} style={styles.emptyIcon} />
            <Text variant="h4" style={styles.emptyTitle}>
              No results for "{searchQuery}"
            </Text>
            <Text variant="small" style={styles.emptyDescription}>
              Try a different search term or create a new category
            </Text>
          </View>
        </View>
      )
    }

    // Don't show empty state with add buttons when viewing archived
    if (includeArchived) {
      return (
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyContainer}>
            <IconSymbol name="tag" size={40} style={styles.emptyIcon} />
            <Text variant="h4" style={styles.emptyTitle}>
              No archived {type} categories
            </Text>
            <Text variant="small" style={styles.emptyDescription}>
              Archived categories will appear here
            </Text>
          </View>
        </View>
      )
    }

    return (
      <View style={styles.emptyWrapper}>
        {renderHeader()}
        <View style={styles.emptyContainer}>
          <IconSymbol name="tag" size={40} style={styles.emptyIcon} />
          <Text variant="h4" style={styles.emptyTitle}>
            No {type} categories yet
          </Text>
          <Text variant="small" style={styles.emptyDescription}>
            Create your first category to start organizing your transactions
          </Text>
          {/* <Button
            variant="default"
            onPress={handleAddFromPresets}
            style={styles.emptyButton}
          >
            <Text variant="default" style={styles.emptyButtonText}>
              Add Recommended Categories
            </Text>
          </Button> */}
        </View>
      </View>
    )
  }

  return (
    <FlatList
      data={filteredCategories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CategoryRow category={item} transactionCount={item.transactionCount} />
      )}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={renderHeader()}
    />
  )
}

const styles = StyleSheet.create((theme) => ({
  listContent: {
    paddingBottom: 100,
    gap: 8,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyWrapper: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.onSurface,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: theme.colors.onSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    minWidth: 200,
  },
  emptyButtonText: {
    fontWeight: "600",
    color: theme.colors.onPrimary,
  },
}))

// Enhance component with WatermelonDB observables
// This follows WatermelonDB best practices: https://watermelondb.dev/docs/Query
export const CategoryList = withObservables(
  ["type", "includeArchived"],
  ({ type, includeArchived = false }: CategoryListProps) => ({
    categoryModels: observeCategoriesByType(type, includeArchived),
  }),
)(CategoryListInner)
