import { withObservables } from "@nozbe/watermelondb/react"
import { useRouter } from "expo-router"
import { useState } from "react"
import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { SearchInput } from "~/components/search-input"
import { TagCard } from "~/components/tags/tag-card"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type TagModel from "~/database/models/Tag"
import { observeTags } from "~/database/services/tag-service"
import { modelToTag } from "~/database/utils/model-to-tag"
import { NewEnum } from "~/types/new"

interface TagsScreenInnerProps {
  tagModels: TagModel[]
}

const TagsScreenInner = ({ tagModels }: TagsScreenInnerProps) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredModels = tagModels.filter((model) => {
    if (!searchQuery.trim()) return true
    return model.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Convert models to domain types for the UI
  const displayTags = filteredModels.map(modelToTag)

  const handleAddTag = () => {
    router.push({
      pathname: "/settings/tags/[tagId]",
      params: { tagId: NewEnum.NEW },
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchInput
          placeholder="Search tags..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.newTagButton} onPress={handleAddTag}>
          <IconSymbol name="plus" size={24} />
          <Text variant="default" style={styles.newTagText}>
            New tag
          </Text>
        </Pressable>

        {displayTags.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="muted">
              {searchQuery.trim() ? "No tags found" : "No tags yet"}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {displayTags.map((tag) => (
              <TagCard key={tag.id} tag={tag} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const enhance = withObservables([], () => ({
  tagModels: observeTags(),
}))

export default enhance(TagsScreenInner)

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  list: {
    // gap: 12,
  },
  newTagButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  newTagText: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
}))
