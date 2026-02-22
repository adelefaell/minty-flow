import { ScrollView, View } from "react-native"

import { DynamicIcon } from "~/components/dynamic-icon"
import { IconSymbol } from "~/components/ui/icon-symbol"
import type { Tag } from "~/types/tags"

import { Chip } from "../Chip"
import { filterHeaderStyles } from "../filter-header.styles"
import { PanelClearButton } from "../PanelClearButton"
import { PanelDoneButton } from "../PanelDoneButton"
import { CHIPS_PER_ROW } from "../types"
import { chunk } from "../utils"

interface TagsPanelProps {
  tags: Tag[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onClear: () => void
  onDone: () => void
}

export function TagsPanel({
  tags,
  selectedIds,
  onToggle,
  onClear,
  onDone,
}: TagsPanelProps) {
  return (
    <View>
      {chunk(tags, CHIPS_PER_ROW).map((row) => (
        <ScrollView
          key={row.map((t) => t.id).join(",")}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={filterHeaderStyles.chipScrollRow}
          style={filterHeaderStyles.categoryRow}
        >
          {row.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              selected={selectedIds.includes(tag.id)}
              onPress={() => onToggle(tag.id)}
              leading={
                tag.icon ? (
                  <DynamicIcon
                    icon={tag.icon}
                    size={18}
                    colorScheme={tag.colorScheme}
                    variant="raw"
                  />
                ) : (
                  <IconSymbol name="tag" size={18} />
                )
              }
            />
          ))}
        </ScrollView>
      ))}
      <View style={filterHeaderStyles.panelHeader}>
        <View />
        <View style={filterHeaderStyles.panelHeaderActions}>
          <PanelClearButton
            onPress={onClear}
            disabled={selectedIds.length === 0}
          />
          <PanelDoneButton onPress={onDone} />
        </View>
      </View>
    </View>
  )
}
