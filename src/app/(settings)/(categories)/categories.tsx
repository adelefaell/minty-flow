import { useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { StyleSheet } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

import { CategoryList } from "../../../components/category-list"
import type { CategoryType } from "../../../types/categories"

export default function CategoriesIndexScreen() {
  const params = useLocalSearchParams<{
    createdCategory?: string
    updatedCategory?: string
    deletedCategory?: string
  }>()
  const [activeTab, setActiveTab] = useState<CategoryType>("expense")

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
            variant={activeTab === tab.type ? "default" : "ghost"}
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
      {activeTab === "transfer" && (
        <View style={styles.helperTextContainer}>
          <Text variant="small" style={styles.helperText}>
            Used for transfers between accounts
          </Text>
        </View>
      )}

      {/* Category List */}
      <CategoryList
        type={activeTab}
        createdCategory={params.createdCategory}
        updatedCategory={params.updatedCategory}
        deletedCategory={params.deletedCategory}
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
}))
