import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet"
import { forwardRef, useCallback, useMemo, useState } from "react"
import { FlatList, Keyboard } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { SearchInput } from "~/components/search-input"
import { IconSymbol, type IconSymbolName } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

export interface SelectionItem {
  id: string
  label: string
  subLabel?: string
  icon?: string
  color?: string
  [key: string]: any
}

interface SelectionSheetProps<T extends SelectionItem> {
  title?: string
  options: T[]
  selectedId?: string | null
  onSelect: (item: T) => void
  renderItem?: (item: T, isSelected: boolean) => React.ReactNode
  searchable?: boolean
  searchPlaceholder?: string
  onClose?: () => void
  snapPoints?: string[]
}

export const SelectionSheet = forwardRef<
  BottomSheetModal,
  SelectionSheetProps<any>
>(
  (
    {
      title,
      options,
      selectedId,
      onSelect,
      renderItem,
      searchable = false,
      searchPlaceholder = "Search...",
      snapPoints = ["50%", "90%"],
    },
    ref,
  ) => {
    const { theme } = useUnistyles()
    const [searchQuery, setSearchQuery] = useState("")

    const filteredOptions = useMemo(() => {
      if (!searchQuery) return options
      const lowerQuery = searchQuery.toLowerCase()
      return options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(lowerQuery) ||
          opt.subLabel?.toLowerCase().includes(lowerQuery),
      )
    }, [options, searchQuery])

    const handleSelect = useCallback(
      (item: any) => {
        onSelect(item)
        // @ts-expect-error
        ref?.current?.dismiss()
        Keyboard.dismiss()
      },
      [onSelect, ref],
    )

    const defaultRenderItem = useCallback(
      ({ item }: { item: SelectionItem }) => {
        const isSelected = item.id === selectedId
        return (
          <Pressable
            style={[styles.item, isSelected && styles.selectedItem]}
            onPress={() => handleSelect(item)}
          >
            <View style={styles.itemContent}>
              {item.icon && (
                <View
                  style={[
                    styles.iconContainer,
                    item.color && {
                      backgroundColor: item.color + "20", // 20% opacity
                    },
                  ]}
                >
                  <IconSymbol
                    name={item.icon as IconSymbolName}
                    size={24}
                    color={item.color || theme.colors.onSurface}
                  />
                </View>
              )}
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.itemTitle,
                    isSelected && { color: theme.colors.primary },
                  ]}
                >
                  {item.label}
                </Text>
                {item.subLabel && (
                  <Text style={styles.itemSubtitle}>{item.subLabel}</Text>
                )}
              </View>
              {isSelected && (
                <IconSymbol
                  name="check"
                  size={20}
                  color={theme.colors.primary}
                />
              )}
            </View>
          </Pressable>
        )
      },
      [selectedId, theme.colors.onSurface, theme.colors.primary, handleSelect],
    )

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(props) => (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0,0,0,0.5)" },
            ]}
          />
        )}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.customColors.semi,
        }}
      >
        <BottomSheetView style={styles.container}>
          {/* Header */}
          {(title || searchable) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {searchable && (
                <View style={styles.searchContainer}>
                  <SearchInput
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onClear={() => setSearchQuery("")}
                  />
                </View>
              )}
            </View>
          )}

          {/* List */}
          <FlatList
            data={filteredOptions}
            renderItem={
              renderItem
                ? ({ item }) => (
                    <Pressable onPress={() => handleSelect(item)}>
                      {renderItem(item, item.id === selectedId)}
                    </Pressable>
                  )
                : defaultRenderItem
            }
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No options found</Text>
              </View>
            }
          />
        </BottomSheetView>
      </BottomSheetModal>
    )
  },
)

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.onSurface,
    textAlign: "center",
    marginBottom: 8,
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
  },
  selectedItem: {
    backgroundColor: theme.colors.secondary,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondary,
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
