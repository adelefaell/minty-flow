/**
 * Tags picker block for the transaction form: chips + inline dropdown with search.
 * Optional scroll-into-view when scroll refs are passed.
 */

import { useRouter } from "expo-router"
import { useMemo, useState } from "react"
import { View as RNView, ScrollView } from "react-native"
import { useUnistyles } from "react-native-unistyles"

import { DynamicIcon } from "~/components/dynamic-icon"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Input } from "~/components/ui/input"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { useScrollIntoView } from "~/hooks/use-scroll-into-view"
import { getThemeStrict } from "~/styles/theme/registry"
import { NewEnum } from "~/types/new"
import type { Tag } from "~/types/tags"

import { styles } from "./form.styles"

export interface FormTagsPickerProps {
  tags: Tag[]
  tagIds: string[] | undefined
  setValue: (
    name: "tags",
    value: string[],
    opts: { shouldDirty: boolean },
  ) => void
  addTag: (tagId: string) => void
  removeTag: (tagId: string) => void
}

export function FormTagsPicker({
  tags,
  tagIds,
  addTag,
  removeTag,
  setValue,
}: FormTagsPickerProps) {
  const router = useRouter()
  const { theme } = useUnistyles()
  const { wrapperRef, scrollIntoView } = useScrollIntoView()
  const [tagPickerOpen, setTagPickerOpen] = useState(false)
  const [tagSearchQuery, setTagSearchQuery] = useState("")

  const selectedTags = useMemo(
    () => tags.filter((t) => (tagIds ?? []).includes(t.id)),
    [tags, tagIds],
  )

  const filteredTagsForPicker = useMemo(() => {
    if (!tagSearchQuery.trim()) return tags
    const lower = tagSearchQuery.toLowerCase()
    return tags.filter((t) => t.name.toLowerCase().includes(lower))
  }, [tags, tagSearchQuery])

  const handleToggle = () => {
    setTagPickerOpen((o) => {
      const next = !o
      if (next) {
        scrollIntoView()
        setTagSearchQuery("")
      }
      return next
    })
  }

  return (
    <RNView ref={wrapperRef} style={styles.fieldBlock}>
      <View style={styles.sectionLabelRow}>
        <Text variant="small" style={styles.sectionLabelInRow}>
          Tags
        </Text>
        <Pressable
          onPress={() =>
            (tagIds ?? []).length > 0 &&
            setValue("tags", [], { shouldDirty: true })
          }
          style={[
            styles.clearButton,
            (tagIds ?? []).length === 0 && styles.clearButtonDisabled,
          ]}
          pointerEvents={(tagIds ?? []).length > 0 ? "auto" : "none"}
          accessibilityLabel="Clear all tags"
          accessibilityState={{
            disabled: (tagIds ?? []).length === 0,
          }}
        >
          <Text variant="small" style={styles.clearButtonText}>
            Clear
          </Text>
        </Pressable>
      </View>
      <View style={styles.tagsWrapGrid}>
        <Pressable
          style={[
            styles.tagChipBase,
            styles.tagChipAdd,
            tagPickerOpen && styles.tagChipCancel,
          ]}
          onPress={handleToggle}
          accessible
          accessibilityRole="button"
          accessibilityLabel={tagPickerOpen ? "Cancel" : "Add tag"}
        >
          <Text
            variant="default"
            style={[
              styles.tagChipAddText,
              tagPickerOpen && { color: theme.colors.customColors.semi },
            ]}
          >
            {tagPickerOpen ? "Cancel" : "Add tag"}
          </Text>
          <IconSymbol
            name={tagPickerOpen ? "close" : "plus"}
            size={16}
            style={tagPickerOpen && { color: theme.colors.customColors.semi }}
          />
        </Pressable>
        {selectedTags.map((tag) => (
          <Pressable
            key={tag.id}
            style={[styles.tagChipBase, styles.tagChip]}
            onPress={() => removeTag(tag.id)}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Remove ${tag.name} tag`}
          >
            <DynamicIcon
              icon={tag.icon || "tag"}
              size={16}
              colorScheme={getThemeStrict(tag.colorSchemeName)}
              variant="badge"
            />
            <Text
              variant="default"
              style={styles.tagChipText}
              numberOfLines={1}
            >
              {tag.name}
            </Text>
            <IconSymbol
              name="close"
              size={14}
              style={styles.tagChipRemoveIcon}
            />
          </Pressable>
        ))}
      </View>

      {tagPickerOpen && (
        <View native style={styles.inlineTagPicker}>
          <Input
            placeholder="Search tags..."
            value={tagSearchQuery}
            onChangeText={setTagSearchQuery}
            placeholderTextColor={theme.colors.customColors.semi}
            style={styles.tagSearchInput}
          />
          <ScrollView
            style={styles.tagPickerList}
            contentContainerStyle={styles.pickerListContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            {filteredTagsForPicker.map((tag) => {
              const isSelected = (tagIds ?? []).includes(tag.id)
              return (
                <Pressable
                  key={tag.id}
                  style={[
                    styles.tagPickerRow,
                    isSelected && styles.inlinePickerRowSelected,
                  ]}
                  onPress={() => {
                    if (isSelected) removeTag(tag.id)
                    else addTag(tag.id)
                  }}
                >
                  <DynamicIcon
                    icon={tag.icon || "tag"}
                    size={20}
                    colorScheme={getThemeStrict(tag.colorSchemeName)}
                    variant="badge"
                  />
                  <Text
                    variant="default"
                    style={styles.tagPickerRowText}
                    numberOfLines={1}
                  >
                    {tag.name}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
          <Pressable
            style={styles.createTagRow}
            onPress={() => {
              setTagPickerOpen(false)
              router.push({
                pathname: "/settings/tags/[tagId]",
                params: { tagId: NewEnum.NEW },
              })
            }}
          >
            <IconSymbol name="tag-plus" size={20} />
            <Text variant="default" style={styles.createTagRowText}>
              Create new tag
            </Text>
          </Pressable>
        </View>
      )}
    </RNView>
  )
}
