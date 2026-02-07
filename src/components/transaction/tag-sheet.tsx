import { BottomSheetScrollView } from "@gorhom/bottom-sheet"
import { useCallback, useMemo, useState } from "react"
import { Keyboard } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import {
  BottomSheetModalComponent,
  type BottomSheetModalProps,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { DynamicIcon } from "~/components/dynamic-icon"
import { SearchInput } from "~/components/search-input"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { getThemeStrict } from "~/styles/theme/registry"
import type { Tag } from "~/types/tags"

interface TagSheetProps extends Omit<BottomSheetModalProps, "children"> {
  tags: Tag[]
  selectedTagIds: string[]
  onConfirm: (tagIds: string[]) => void
  onNewTag?: () => void
}

export function TagSheet({
  id,
  tags,
  selectedTagIds,
  onConfirm,
  onNewTag,
  onChange,
  onDismiss,
  ...bottomSheetProps
}: TagSheetProps) {
  const { theme } = useUnistyles()
  const sheet = useBottomSheet(id)
  const [searchQuery, setSearchQuery] = useState("")
  const [localSelection, setLocalSelection] = useState<string[]>(selectedTagIds)

  const filteredTags = useMemo(() => {
    if (!searchQuery) return tags
    const lower = searchQuery.toLowerCase()
    return tags.filter((t) => t.name.toLowerCase().includes(lower))
  }, [tags, searchQuery])

  const handleToggle = useCallback((tagId: string) => {
    setLocalSelection((prev) =>
      prev.includes(tagId) ? prev.filter((i) => i !== tagId) : [...prev, tagId],
    )
  }, [])

  const handleDone = useCallback(() => {
    onConfirm(localSelection)
    sheet.dismiss()
    Keyboard.dismiss()
  }, [localSelection, onConfirm, sheet])

  const handleClear = useCallback(() => {
    setLocalSelection([])
  }, [])

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index >= 0) {
        setLocalSelection(selectedTagIds)
      }
      onChange?.(index)
    },
    [selectedTagIds, onChange],
  )

  const handleNewTagPress = useCallback(() => {
    sheet.dismiss()
    onNewTag?.()
  }, [sheet, onNewTag])

  const tagScheme = useCallback((tag: Tag) => {
    return getThemeStrict(tag.colorSchemeName)
  }, [])

  return (
    <BottomSheetModalComponent
      id={id}
      snapPoints={["60%", "90%"]}
      enableDynamicSizing={false}
      skipBottomSheetView={true}
      onChange={handleSheetChange}
      onDismiss={onDismiss}
      {...bottomSheetProps}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Select tags</Text>
        <SearchInput
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
        />
        <Pressable style={styles.newTagButton} onPress={handleNewTagPress}>
          <IconSymbol name="plus" size={20} color={theme.colors.onSurface} />
          <Text style={styles.newTagText}>New tag</Text>
        </Pressable>
      </View>

      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.chipsWrap}>
          {filteredTags.map((tag) => {
            const isSelected = localSelection.includes(tag.id)
            const scheme = tagScheme(tag)
            return (
              <Pressable
                key={tag.id}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => handleToggle(tag.id)}
              >
                <DynamicIcon
                  icon={tag.icon || "tag"}
                  size={18}
                  colorScheme={scheme ?? undefined}
                  color={!scheme ? theme.colors.primary : undefined}
                  variant="badge"
                />
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {tag.name}
                </Text>
              </Pressable>
            )
          })}
        </View>
        {filteredTags.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tags found</Text>
          </View>
        )}
      </BottomSheetScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.footerAction,
            localSelection.length === 0 && styles.footerActionDisabled,
          ]}
          onPress={handleClear}
          disabled={localSelection.length === 0}
        >
          <IconSymbol name="close-circle" size={20} style={styles.clearIcon} />
          <Text
            style={[
              styles.clearText,
              localSelection.length === 0 && styles.footerActionTextDisabled,
            ]}
          >
            Clear selections
          </Text>
        </Pressable>
        <Button onPress={handleDone}>
          <IconSymbol name="check" size={20} color={theme.colors.onPrimary} />
          <Text>Done</Text>
        </Button>
      </View>
    </BottomSheetModalComponent>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.customColors.semi}20`,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.onSurface,
    textAlign: "center",
  },
  searchWrap: {
    borderWidth: 1,
    borderColor: theme.colors.customColors.semi,
    borderRadius: theme.colors.radius,
    overflow: "hidden",
  },
  newTagButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.colors.radius,
    borderWidth: 1,
    borderColor: theme.colors.customColors.semi,
    alignSelf: "flex-start",
  },
  newTagText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipSelected: {
    backgroundColor: `${theme.colors.primary}20`,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.onSurface,
    maxWidth: 160,
  },
  chipTextSelected: {
    color: theme.colors.primary,
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: theme.colors.customColors.semi,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.customColors.semi}30`,
  },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  footerActionDisabled: {
    opacity: 0.5,
  },
  footerActionTextDisabled: {
    color: theme.colors.customColors.semi,
  },
  clearIcon: {
    color: theme.colors.customColors.semi,
  },
  clearText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
}))
