import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { FlatList } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { logger } from "~/utils/logger"

import type { Category, CategoryType } from "../types/categories"
import { CategoryRow } from "./category-row"

interface CategoryListProps {
  type: CategoryType
  createdCategory?: string
  updatedCategory?: string
  deletedCategory?: string
}

// Mock data - replace with actual data source
const getMockCategories = (type: CategoryType): Category[] => {
  // Return empty array for now - will be populated from actual data source
  return []
}

export function CategoryList({
  type,
  createdCategory,
  updatedCategory,
  deletedCategory,
}: CategoryListProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>(() =>
    getMockCategories(type),
  )

  // Listen for when screen comes into focus and check for created/updated category
  useFocusEffect(
    useCallback(() => {
      if (createdCategory) {
        try {
          const categoryData = JSON.parse(createdCategory)
          const newCategory: Category = {
            ...categoryData,
            id: `cat_${Date.now()}`,
            transactionCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          setCategories((prev) => [...prev, newCategory])
          // Clear the param to avoid re-adding
          router.setParams({ createdCategory: undefined })
        } catch (error) {
          logger.error("Error parsing created category", { error })
        }
      }

      if (updatedCategory) {
        try {
          const updateData = JSON.parse(updatedCategory)
          setCategories((prev) =>
            prev.map((cat) =>
              cat.id === updateData.id
                ? { ...cat, name: updateData.name, updatedAt: new Date() }
                : cat,
            ),
          )
          // Clear the param to avoid re-updating
          router.setParams({ updatedCategory: undefined })
        } catch (error) {
          logger.error("Error parsing updated category", { error })
        }
      }

      if (deletedCategory) {
        try {
          const deleteData = JSON.parse(deletedCategory)
          setCategories((prev) =>
            prev.filter((cat) => cat.id !== deleteData.id),
          )
          // Clear the param to avoid re-deleting
          router.setParams({ deletedCategory: undefined })
        } catch (error) {
          logger.error("Error parsing deleted category", { error })
        }
      }
    }, [createdCategory, updatedCategory, deletedCategory, router]),
  )

  const handleAddCategory = () => {
    router.push({
      pathname: "/(settings)/(categories)/[categoryId]",
      params: {
        categoryId: "add-category",
        initialType: type,
      },
    })
  }

  const handleEditCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, ...updates, updatedAt: new Date() } : cat,
      ),
    )
  }

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id))
  }

  const activeCategories = categories.filter(
    (cat) => cat.type === type && !cat.isArchived,
  )

  if (activeCategories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <IconSymbol name="tag" size={40} style={styles.emptyIcon} />
        <Text variant="h4" style={styles.emptyTitle}>
          No {type} categories yet
        </Text>
        <Text variant="small" style={styles.emptyDescription}>
          Create your first category to start organizing your transactions
        </Text>
        <Button
          variant="default"
          size="default"
          onPress={handleAddCategory}
          style={styles.emptyButton}
        >
          <IconSymbol name="plus" size={20} />
          <Text variant="default" style={styles.emptyButtonText}>
            Add Category
          </Text>
        </Button>
      </View>
    )
  }

  return (
    <FlatList
      data={activeCategories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CategoryRow
          category={item}
          onEdit={(updates) => handleEditCategory(item.id, updates)}
          onDelete={() => handleDeleteCategory(item.id)}
          transactionCount={item.transactionCount}
        />
      )}
      contentContainerStyle={styles.listContent}
      ListFooterComponent={
        <Pressable style={styles.addButton} onPress={handleAddCategory}>
          <IconSymbol name="plus" size={24} />
          <Text variant="default" style={styles.addButtonText}>
            Add Category
          </Text>
        </Pressable>
      }
    />
  )
}

const styles = StyleSheet.create((theme) => ({
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
    gap: 8,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onPrimary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginTop: 12,
    marginBottom: 20,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
}))
