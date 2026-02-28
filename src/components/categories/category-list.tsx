import { withObservables } from "@nozbe/watermelondb/react"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { FlatList } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import {
  observeArchivedCategoryCountByType,
  observeCategoriesByType,
} from "~/database/services/category-service"
import type { Category } from "~/types/categories"
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
  categories: Category[]
  archivedCount: number
}

interface CategoryListHeaderProps {
  onAddCategory: () => void
  onAddFromPresets: () => void
}

function CategoryListHeader({
  onAddCategory,
  onAddFromPresets,
}: CategoryListHeaderProps) {
  const { t } = useTranslation()

  return (
    <>
      <View style={styles.headerContainer}>
        <Button
          variant="secondary"
          size="default"
          onPress={onAddCategory}
          style={styles.headerButton}
        >
          <IconSymbol name="plus" size={20} />
          <Text variant="default" style={styles.headerButtonText}>
            {t("components.categories.actions.addNew")}
          </Text>
        </Button>
        <Button
          variant="secondary"
          size="default"
          onPress={onAddFromPresets}
          style={styles.headerButton}
        >
          <IconSymbol name="shape-plus" size={20} />
          <Text variant="default" style={styles.headerButtonText}>
            {t("components.categories.actions.addFromPresets")}
          </Text>
        </Button>
      </View>
      <Separator />
    </>
  )
}

interface CategoryListFooterProps {
  type: TransactionType
  archivedCount: number
  onViewArchived: () => void
}

function CategoryListFooter({
  type,
  archivedCount,
  onViewArchived,
}: CategoryListFooterProps) {
  const { t } = useTranslation()
  if (archivedCount === 0) return null
  const typeLabel = t(`components.categories.types.${type}`)
  return (
    <>
      <Separator style={styles.footerSeparator} />
      <View style={styles.footerContainer}>
        <Button variant="secondary" size="default" onPress={onViewArchived}>
          <View style={styles.archivedEntryLeft} variant="muted">
            <IconSymbol name="archive" size={20} style={styles.archivedIcon} />
            <Text style={styles.archivedText}>
              {t("components.categories.viewArchived", {
                type: typeLabel,
                count: archivedCount,
              })}
            </Text>
          </View>
        </Button>
      </View>
    </>
  )
}

const CategoryListInner = ({
  type,
  createdCategory,
  updatedCategory,
  deletedCategory,
  categories,
  archivedCount,
  includeArchived = false,
  searchQuery = "",
}: CategoryListInnerProps) => {
  const router = useRouter()
  const { t } = useTranslation()
  const typeLabel = t(`components.categories.types.${type}`)

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

  const handleViewArchived = () => {
    router.push({
      pathname: "/settings/categories/archived",
      params: {
        type,
      },
    })
  }

  // Separate active and archived categories
  const activeCategories = categories.filter((c) => !c.isArchived)
  const archivedCategories = categories.filter((c) => c.isArchived)

  const header = includeArchived ? null : (
    <CategoryListHeader
      onAddCategory={handleAddCategory}
      onAddFromPresets={handleAddFromPresets}
    />
  )

  const footer =
    includeArchived || archivedCount === 0 ? null : (
      <CategoryListFooter
        type={type}
        archivedCount={archivedCount}
        onViewArchived={handleViewArchived}
      />
    )

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

  const renderItem = useCallback(
    ({ item }: { item: Category }) => (
      <CategoryRow category={item} transactionCount={item.transactionCount} />
    ),
    [],
  )

  const keyExtractor = useCallback((item: Category) => item.id, [])

  if (filteredCategories.length === 0) {
    if (searchQuery) {
      return (
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyContainer}>
            <IconSymbol name="magnify" size={40} style={styles.emptyIcon} />
            <Text variant="h4" style={styles.emptyTitle}>
              {t("components.categories.empty.noResults.title", {
                query: searchQuery,
              })}
            </Text>
            <Text variant="small" style={styles.emptyDescription}>
              {t("components.categories.empty.noResults.description")}
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
            <IconSymbol name="shape" size={40} style={styles.emptyIcon} />
            <Text variant="h4" style={styles.emptyTitle}>
              {t("components.categories.empty.noArchived.title", {
                type: typeLabel,
              })}
            </Text>
            <Text variant="small" style={styles.emptyDescription}>
              {t("components.categories.empty.noArchived.description")}
            </Text>
          </View>
        </View>
      )
    }

    // SMART EMPTY STATE HANDLER:
    // If no active categories but archivedCount > 0, showScenario B
    if (!includeArchived && archivedCount > 0) {
      return (
        <View style={styles.emptyWrapper}>
          {header}
          <View style={styles.emptyContainer}>
            <IconSymbol
              name="shape"
              size={40}
              style={[styles.emptyIcon, { opacity: 0.3 }]}
            />
            <Text variant="h4" style={styles.emptyTitle}>
              {t("components.categories.empty.noActive.title", {
                type: typeLabel,
              })}
            </Text>
            <Text variant="small" style={styles.emptyDescription}>
              {t("components.categories.empty.noActive.description", {
                type: typeLabel,
              })}
            </Text>
            <Button
              variant="default"
              onPress={handleViewArchived}
              style={styles.emptyButton}
            >
              <Text variant="default" style={styles.emptyButtonText}>
                {t("components.categories.viewArchived", {
                  type: typeLabel,
                  count: archivedCount,
                })}
              </Text>
            </Button>
          </View>
        </View>
      )
    }

    return (
      <View style={styles.emptyWrapper}>
        {header}
        <View style={styles.emptyContainer}>
          <IconSymbol name="shape" size={40} style={styles.emptyIcon} />
          <Text variant="h4" style={styles.emptyTitle}>
            {t("components.categories.empty.noCategories.title", {
              type: typeLabel,
            })}
          </Text>
          <Text variant="small" style={styles.emptyDescription}>
            {t("components.categories.empty.noCategories.description")}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <FlatList
      data={filteredCategories}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
    />
  )
}

const styles = StyleSheet.create((theme) => ({
  listContent: {
    paddingBottom: 100,
    gap: 10,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
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
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.onSurface,
    marginBottom: 10,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: theme.colors.onSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyButton: {
    minWidth: 200,
    marginTop: 10,
  },
  emptyButtonText: {
    fontWeight: "600",
    color: theme.colors.onPrimary,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  footerSeparator: {
    marginVertical: 20,
  },
  archivedEntryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  archivedIcon: {
    color: theme.colors.onSecondary,
  },
  archivedText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.onSecondary,
  },
}))

// Enhance component with WatermelonDB observables
// This follows WatermelonDB best practices: https://watermelondb.dev/docs/Query
export const CategoryList = withObservables(
  ["type", "includeArchived"],
  ({ type, includeArchived = false }: CategoryListProps) => ({
    categories: observeCategoriesByType(type, includeArchived),
    archivedCount: observeArchivedCategoryCountByType(type),
  }),
)(CategoryListInner)
