import { useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { StyleSheet } from "react-native-unistyles"

import { SearchInput } from "~/components/search-input"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { type TransactionType, TransactionTypeEnum } from "~/types/transactions"

import { CategoryList } from "../../../components/categories/category-list"

export default function CategoriesIndexScreen() {
  const params = useLocalSearchParams<{
    createdCategory?: string
    updatedCategory?: string
    deletedCategory?: string
  }>()
  const [activeTab, setActiveTab] = useState<TransactionType>(
    TransactionTypeEnum.EXPENSE,
  )

  const [searchQuery, setSearchQuery] = useState("")

  const clearSearch = () => {
    setSearchQuery("")
  }

  const tabs: { type: TransactionType; label: string }[] = [
    { type: TransactionTypeEnum.EXPENSE, label: "Expense" },
    { type: TransactionTypeEnum.INCOME, label: "Income" },
    { type: TransactionTypeEnum.TRANSFER, label: "Transfer" },
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchInput
          placeholder="Search categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={clearSearch}
        />
      </View>

      {/* Category List */}
      <CategoryList
        type={activeTab}
        createdCategory={params.createdCategory}
        updatedCategory={params.updatedCategory}
        deletedCategory={params.deletedCategory}
        includeArchived={false}
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
}))
