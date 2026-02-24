import { ScrollView, TextInput, View } from "react-native"
import { useUnistyles } from "react-native-unistyles"

import { Chip } from "~/components/ui/chips"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import type { SearchMatchType } from "~/types/transaction-filters"

import { filterHeaderStyles } from "../filter-header.styles"
import { PanelClearButton } from "../panel-clear-button"
import { PanelDoneButton } from "../panel-done-button"
import { SEARCH_MATCH_OPTIONS } from "../types"

interface SearchPanelProps {
  value: string
  onChange: (text: string) => void
  onClear: () => void
  onDone: () => void
  matchType: SearchMatchType
  onMatchTypeChange: (type: SearchMatchType) => void
  includeNotes: boolean
  onIncludeNotesChange: (value: boolean) => void
}

export function SearchPanel({
  value,
  onChange,
  onClear,
  onDone,
  matchType,
  onMatchTypeChange,
  includeNotes,
  onIncludeNotesChange,
}: SearchPanelProps) {
  const { theme } = useUnistyles()

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={filterHeaderStyles.searchMatchRow}
        style={filterHeaderStyles.searchMatchScroll}
      >
        {SEARCH_MATCH_OPTIONS.map((opt) => (
          <Chip
            key={opt.id}
            label={opt.label}
            selected={matchType === opt.id}
            onPress={() => onMatchTypeChange(opt.id)}
          />
        ))}
      </ScrollView>
      <View style={filterHeaderStyles.searchRow}>
        <IconSymbol name="magnify" size={20} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Search by title..."
          placeholderTextColor={`${theme.colors.onSurface}50`}
          style={[
            filterHeaderStyles.searchInput,
            { color: theme.colors.onSurface },
          ]}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 ? (
          <Pressable onPress={onClear} style={filterHeaderStyles.clearHit}>
            <IconSymbol name="close-circle" size={20} />
          </Pressable>
        ) : null}
      </View>
      <Pressable
        style={filterHeaderStyles.includeNotesRow}
        onPress={() => onIncludeNotesChange(!includeNotes)}
      >
        <Text
          style={[
            filterHeaderStyles.includeNotesLabel,
            { color: theme.colors.onSurface },
          ]}
        >
          Include notes
        </Text>
        {includeNotes ? (
          <IconSymbol name="check" size={20} color={theme.colors.primary} />
        ) : null}
      </Pressable>
      <View style={filterHeaderStyles.panelHeader}>
        <View />
        <View style={filterHeaderStyles.panelHeaderActions}>
          <PanelClearButton
            onPress={onClear}
            disabled={
              value === "" && matchType === "smart" && includeNotes === true
            }
          />
          <PanelDoneButton onPress={onDone} />
        </View>
      </View>
    </View>
  )
}
