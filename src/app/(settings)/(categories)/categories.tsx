import { useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { StyleSheet } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Input } from "~/components/ui/input"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { useCategorySearchStore } from "~/stores/category-search.store"

import { CategoryList } from "../../../components/category-list"
import type { CategoryType } from "../../../types/categories"

export default function CategoriesIndexScreen() {
  const params = useLocalSearchParams<{
    createdCategory?: string
    updatedCategory?: string
    deletedCategory?: string
  }>()
  const [activeTab, setActiveTab] = useState<CategoryType>("expense")
  const [showArchived, setShowArchived] = useState(false)
  const { searchQuery, setSearchQuery, clearSearch } = useCategorySearchStore()

  const tabs: { type: CategoryType; label: string }[] = [
    { type: "expense", label: "Expense" },
    { type: "income", label: "Income" },
    { type: "transfer", label: "Transfer" },
  ]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="small" style={styles.subtitle}>
          Organize how your money flows
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <Button
            key={tab.type}
            variant={activeTab === tab.type ? "default" : "secondary"}
            size="sm"
            onPress={() => setActiveTab(tab.type)}
            style={styles.tab}
          >
            <Text
              variant="default"
              style={[
                styles.tabText,
                activeTab === tab.type && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Button>
        ))}
      </View>

      {/* Transfer category helper text */}
      {/* {activeTab === "transfer" && (
        <View style={styles.helperTextContainer}>
          <Text variant="small" style={styles.helperText}>
            Used for transfers between accounts
          </Text>
        </View>
      )} */}
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <IconSymbol name="magnify" size={20} style={styles.searchIcon} />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            clearButtonMode="while-editing"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onPress={clearSearch}
              style={styles.clearButton}
            >
              <IconSymbol name="close" size={20} style={styles.clearIcon} />
            </Button>
          )}
        </View>
      </View>
      {/* Show Archived Toggle */}
      <View style={styles.toggleContainer}>
        <Button
          style={styles.toggleButton}
          onPress={() => setShowArchived(!showArchived)}
          variant="ghost"
        >
          <IconSymbol
            name={showArchived ? "eye-outline" : "eye-off-outline"}
            size={20}
            style={styles.toggleIcon}
          />
          <Text variant="small" style={styles.toggleText}>
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Text>
        </Button>
      </View>

      {/* Category List */}
      <CategoryList
        type={activeTab}
        createdCategory={params.createdCategory}
        updatedCategory={params.updatedCategory}
        deletedCategory={params.deletedCategory}
        includeArchived={showArchived}
        searchQuery={searchQuery}
      />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.onSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  tabTextActive: {
    color: theme.colors.onPrimary,
  },
  helperTextContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.onSecondary,
    fontStyle: "italic",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    paddingVertical: 8,
  },
  toggleIcon: {
    color: theme.colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: {
    color: theme.colors.onSecondary,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderWidth: 0,
    fontSize: 14,
    shadowColor: "transparent",
    elevation: 0,
    paddingHorizontal: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    color: theme.colors.onSecondary,
  },
}))
