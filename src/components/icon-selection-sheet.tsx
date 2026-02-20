import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { BottomSheetFlatList, BottomSheetTextInput } from "@gorhom/bottom-sheet"
import type { ComponentProps } from "react"
import { memo, useCallback, useMemo, useState } from "react"
import { Pressable, View } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import {
  BottomSheetModalComponent,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { Text } from "~/components/ui/text"
import {
  MATERIAL_SYMBOLS,
  type MintyIconData,
} from "~/constants/minty-icons-selection"
import type { MintyColorScheme } from "~/styles/theme/types"

import { DynamicIcon } from "./dynamic-icon"
import { IconSymbol } from "./ui/icon-symbol"

interface IconSelectionSheetV2Props {
  id: string
  onIconSelected?: (icon: string) => void
  initialIcon?: string
  colorScheme?: MintyColorScheme
}

// Grid layout configuration
const COLUMNS = 6

const IconItem = memo(
  ({
    iconName,
    isSelected,
    onPress,
    color,
    selectedColor,
  }: {
    iconName: string
    isSelected: boolean
    onPress: (name: string) => void
    color: string
    selectedColor: string
  }) => {
    return (
      <Pressable
        style={[
          styles.iconItem,
          isSelected && { backgroundColor: selectedColor },
        ]}
        onPress={() => onPress(iconName)}
      >
        <MaterialCommunityIcons
          name={
            iconName as ComponentProps<typeof MaterialCommunityIcons>["name"]
          }
          size={28}
          color={color}
        />
      </Pressable>
    )
  },
)

/**
 * SearchHeader component - Memoized search input to prevent re-renders
 */
const SearchHeader = memo(
  ({
    searchQuery,
    onSearchChange,
    onClear,
  }: {
    searchQuery: string
    onSearchChange: (text: string) => void
    onClear: () => void
  }) => {
    return (
      <View style={styles.searchContainer}>
        <IconSymbol name="magnify" size={20} color={styles.searchIcon.color} />
        <BottomSheetTextInput
          style={styles.searchInput}
          placeholder="Search icons..."
          placeholderTextColor={styles.searchInputText.color}
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={onClear}>
            <IconSymbol
              name="close"
              size={20}
              color={styles.searchInputText.color}
            />
          </Pressable>
        )}
      </View>
    )
  },
)

/**
 * IconSelectionSheet - Enhanced icon selection with fuzzy search
 * Supports Material Symbols and Simple Icons (brand icons)
 *
 * @component
 * @param {string} id - Unique identifier for the bottom sheet
 * @param {function} onIconSelected - Callback function when an icon is selected
 * @param {string} initialIcon - Initial selected icon name
 *
 * @example
 * <IconSelectionSheet
 *   id="icon-picker-v2"
 *   initialIcon="wallet-outline"
 *   onIconSelected={(icon) => console.log('Selected icon:', icon)}
 * />
 */
export const IconSelectionSheet = ({
  id,
  colorScheme,
  onIconSelected,
  initialIcon,
}: IconSelectionSheetV2Props) => {
  const sheet = useBottomSheet(id)
  const { theme } = useUnistyles()
  const [searchQuery, setSearchQuery] = useState("")

  const [selectedIcon, setSelectedIcon] = useState<string | null>(
    initialIcon || null,
  )

  // Reset selection to initialIcon when sheet opens
  const handleSheetChange = useCallback(
    (index: number) => {
      if (index >= 0) {
        // Sheet is opening or open
        setSelectedIcon(initialIcon || null)
        setSearchQuery("")
      }
    },
    [initialIcon],
  )

  /**
   * Custom search function to filter icons
   * Searches through icon names and keywords
   * Returns results sorted by relevance
   */
  const searchIcons = useCallback(
    (icons: MintyIconData[], query: string): MintyIconData[] => {
      if (!query.trim()) {
        return icons
      }

      const lowerQuery = query.toLowerCase().trim()

      // Score each icon based on match quality
      const scoredIcons = icons.map((icon) => {
        let score = 0
        const iconNameLower = icon.name.toLowerCase()

        // Check icon name matches
        if (iconNameLower === lowerQuery) {
          score += 100 // Exact match
        } else if (iconNameLower.startsWith(lowerQuery)) {
          score += 50 // Starts with query
        } else if (iconNameLower.includes(lowerQuery)) {
          score += 25 // Contains query
        }

        // Check keyword matches
        for (const keyword of icon.keywords) {
          const keywordLower = keyword.toLowerCase()
          if (keywordLower === lowerQuery) {
            score += 80 // Exact keyword match
          } else if (keywordLower.startsWith(lowerQuery)) {
            score += 40 // Keyword starts with query
          } else if (keywordLower.includes(lowerQuery)) {
            score += 20 // Keyword contains query
          }
        }

        return { icon, score }
      })

      // Filter out icons with no matches and sort by score
      return scoredIcons
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 100)
        .map(({ icon }) => icon)
    },
    [],
  )

  // Get filtered icons based on search
  const availableIcons = useMemo(() => {
    return searchIcons(MATERIAL_SYMBOLS, searchQuery)
  }, [searchQuery, searchIcons])

  const handleIconSelect = useCallback((iconName: string) => {
    setSelectedIcon(iconName)
  }, [])

  const keyExtractor = useCallback((item: MintyIconData) => item.name, [])

  const handleDone = useCallback(() => {
    if (selectedIcon) {
      onIconSelected?.(selectedIcon)
      sheet.dismiss()
      setTimeout(() => {
        setSearchQuery("")
      }, 300)
    }
  }, [selectedIcon, onIconSelected, sheet])

  const renderIconItem = useCallback(
    ({ item }: { item: MintyIconData }) => {
      return (
        <IconItem
          iconName={item.name}
          isSelected={selectedIcon === item.name}
          onPress={handleIconSelect}
          color={theme.colors.onSurface}
          selectedColor={theme.colors.secondary}
        />
      )
    },
    [selectedIcon, handleIconSelect, theme.colors],
  )

  // Handlers for SearchHeader
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchQuery("")
  }, [])

  const renderFooter = useMemo(() => {
    return (
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {selectedIcon && (
            <View style={styles.selectedPreview}>
              <DynamicIcon
                icon={selectedIcon}
                size={20}
                colorScheme={colorScheme}
              />

              <Text style={styles.selectedIconName}>{selectedIcon}</Text>
            </View>
          )}
        </View>
        <Pressable
          onPress={handleDone}
          disabled={!selectedIcon}
          style={({ pressed }) => [
            styles.doneButton,
            pressed && styles.doneButtonPressed,
            !selectedIcon && styles.doneButtonDisabled,
          ]}
        >
          <IconSymbol name="check" size={20} />
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      </View>
    )
  }, [handleDone, selectedIcon, colorScheme])

  return (
    <BottomSheetModalComponent
      id={id}
      snapPoints={["70%", "95%"]}
      backdropOpacity={0.5}
      backdropPressBehavior="close"
      keyboardBehavior="extend"
      keyboardBlurBehavior="none"
      enablePanDownToClose={false}
      enableDynamicSizing={false}
      skipBottomSheetView={true}
      footerComponent={renderFooter}
      enableContentPanningGesture={false}
      onChange={handleSheetChange}
    >
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClear={handleClearSearch}
      />
      <BottomSheetFlatList
        data={availableIcons}
        numColumns={COLUMNS}
        renderItem={renderIconItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={true}
        initialNumToRender={60}
        maxToRenderPerBatch={60}
        windowSize={7}
        removeClippedSubviews={false}
        bounces={true}
        keyboardDismissMode="none"
        keyboardShouldPersistTaps="always"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol
              name="alert-circle"
              size={48}
              color={theme.colors.onSecondary}
            />
            <Text variant="p" style={styles.emptyStateText}>
              No icons found
            </Text>
            <Text variant="p" style={styles.emptyStateSubtext}>
              Try a different search term
            </Text>
          </View>
        }
      />
    </BottomSheetModalComponent>
  )
}

const styles = StyleSheet.create((theme) => ({
  flatListContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 400,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.colors.radius,
    borderWidth: 1,
    borderColor: theme.colors.onSurface,
    backgroundColor: theme.colors.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.onSurface,
    padding: 0,
    minHeight: 24,
  },
  searchIcon: {
    color: theme.colors.onSecondary,
  },
  searchInputText: {
    color: theme.colors.onSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateText: {
    color: theme.colors.onSecondary,
    fontSize: 16,
    fontWeight: "500",
  },
  emptyStateSubtext: {
    color: theme.colors.onSecondary,
    fontSize: 14,
    opacity: 0.7,
  },
  iconItem: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: 4,
    borderRadius: theme.colors.radius,
    maxWidth: 56,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,

    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.onSurface}20`,
    backgroundColor: theme.colors.surface,
    gap: 12,
  },
  footerLeft: {
    flex: 1,
    minHeight: 40,
    justifyContent: "center",
  },
  selectedPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    // borderRadius: theme.colors.radius,
    // backgroundColor: `${theme.colors.secondary}30`,
  },
  selectedIconName: {
    fontSize: 14,
    color: theme.colors.onSurface,
    fontWeight: "500",
    flex: 1,
  },
  doneButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.colors.radius,
    backgroundColor: `${theme.colors.primary}10`,
  },
  doneButtonPressed: {
    opacity: 0.7,
    backgroundColor: `${theme.colors.primary}15`,
  },
  doneButtonDisabled: {
    opacity: 0.4,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
}))
