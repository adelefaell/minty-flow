import { useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { StyleSheet } from "react-native-unistyles"

import { SearchInput } from "~/components/search-input"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { TransactionType } from "~/types/transactions"

import { CategoryList } from "../../../components/categories/category-list"

export default function ArchivedCategoriesScreen() {
  const params = useLocalSearchParams<{
    type: TransactionType
  }>()

  const [searchQuery, setSearchQuery] = useState("")

  const clearSearch = () => {
    setSearchQuery("")
  }

  const capitalizedType = params.type
    ? params.type.charAt(0).toUpperCase() + params.type.slice(1)
    : "Category"

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="small" style={styles.subtitle}>
          Archived {capitalizedType}s
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchInput
          placeholder={`Search archived ${params.type || "categories"}...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={clearSearch}
        />
      </View>

      {/* Category List */}
      <CategoryList
        type={params.type}
        includeArchived={true}
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
  subtitle: {
    fontSize: 13,
    color: theme.colors.onSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
}))
