import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { useCallback, useMemo, useState } from "react"
import { Keyboard } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import {
  BottomSheetModalComponent,
  type BottomSheetModalProps,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { DynamicIcon } from "~/components/dynamic-icon"
import { SearchInput } from "~/components/search-input"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { Category } from "~/types/categories"

interface CategorySheetProps extends Omit<BottomSheetModalProps, "children"> {
  categories: Category[]
  selectedCategoryId: string | null
  onSelect: (categoryId: string) => void
}

export function CategorySheet({
  id,
  categories,
  selectedCategoryId,
  onSelect,
  onChange,
  onDismiss,
  ...bottomSheetProps
}: CategorySheetProps) {
  const sheet = useBottomSheet(id)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories
    const lower = searchQuery.toLowerCase()
    return categories.filter((c) => c.name.toLowerCase().includes(lower))
  }, [categories, searchQuery])

  const handleSelect = useCallback(
    (category: Category) => {
      onSelect(category.id)
      sheet.dismiss()
      Keyboard.dismiss()
    },
    [onSelect, sheet],
  )

  const renderItem = useCallback(
    ({ item }: { item: Category }) => {
      const isSelected = item.id === selectedCategoryId
      return (
        <Pressable
          style={[styles.item, isSelected && styles.selectedItem]}
          onPress={() => handleSelect(item)}
        >
          <View style={styles.itemContent}>
            <DynamicIcon
              icon={item.icon}
              size={20}
              colorScheme={item.colorScheme}
            />
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              {item.transactionCount > 0 && (
                <Text style={styles.itemSubtitle}>
                  {item.transactionCount} transaction
                  {item.transactionCount !== 1 ? "s" : ""}
                </Text>
              )}
            </View>
          </View>
        </Pressable>
      )
    },
    [selectedCategoryId, handleSelect],
  )

  return (
    <BottomSheetModalComponent
      id={id}
      snapPoints={["50%", "90%"]}
      skipBottomSheetView={true}
      enableDynamicSizing={false}
      onChange={onChange}
      onDismiss={onDismiss}
      {...bottomSheetProps}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Select Category</Text>
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery("")}
          />
        </View>
      </View>
      <BottomSheetFlatList
        data={filteredCategories}
        renderItem={renderItem}
        keyExtractor={(item: Category) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No categories found</Text>
          </View>
        }
      />
    </BottomSheetModalComponent>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    marginBottom: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.customColors.semi}20`,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.onSurface,
    textAlign: "center",
    marginBottom: 4,
  },
  searchContainer: {
    marginBottom: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedItem: {
    borderColor: theme.colors.primary,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  itemSubtitle: {
    fontSize: 13,
    color: theme.colors.customColors.semi,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: theme.colors.customColors.semi,
  },
}))
