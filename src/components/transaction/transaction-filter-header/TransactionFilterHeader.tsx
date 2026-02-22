/**
 * Inline filter header for the transaction list.
 * Horizontal pill row + expandable inline filter panels.
 * No bottom sheets — filters are shown directly in the view.
 */

import { useCallback, useState } from "react"
import { LayoutAnimation, ScrollView, View } from "react-native"
import { useUnistyles } from "react-native-unistyles"

import { DateRangePresetModal } from "~/components/date-range-preset-modal"
import { IconSymbol, type IconSymbolName } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import type {
  GroupByOption,
  SearchMatchType,
} from "~/types/transaction-filters"
import {
  DEFAULT_SEARCH_STATE,
  DEFAULT_TRANSACTION_LIST_FILTER_STATE,
} from "~/types/transaction-filters"
import type { TransactionType } from "~/types/transactions"

import { filterHeaderStyles } from "./filter-header.styles"
import {
  AccountsPanel,
  AttachmentsPanel,
  CategoriesPanel,
  GroupByPanel,
  PendingPanel,
  SearchPanel,
  TagsPanel,
  TypePanel,
} from "./panels"
import {
  EMPTY_HIDDEN_FILTERS,
  type FilterPanelKey,
  GROUP_BY_LABELS,
  type TransactionFilterHeaderProps,
} from "./types"

const LAYOUT_ANIM = LayoutAnimation.Presets.easeInEaseOut

export function TransactionFilterHeader({
  accounts,
  categoriesByType,
  tags,
  filterState,
  onFilterChange,
  selectedRange = null,
  onDateRangeChange,
  searchState: propSearchState,
  onSearchApply,
  hiddenFilters = EMPTY_HIDDEN_FILTERS,
}: TransactionFilterHeaderProps) {
  const searchState = propSearchState ?? DEFAULT_SEARCH_STATE
  const [expandedPanel, setExpandedPanel] = useState<FilterPanelKey | null>(
    null,
  )
  const [dateModalVisible, setDateModalVisible] = useState(false)
  const { theme } = useUnistyles()

  const togglePanel = useCallback((key: FilterPanelKey) => {
    LayoutAnimation.configureNext(LAYOUT_ANIM)
    setExpandedPanel((prev) => (prev === key ? null : key))
  }, [])

  const handleDatePress = useCallback(() => {
    LayoutAnimation.configureNext(LAYOUT_ANIM)
    setExpandedPanel(null)
    setDateModalVisible(true)
  }, [])

  const handleSearchChange = useCallback(
    (text: string) => {
      const next = { ...searchState, query: text }
      onSearchApply?.(next)
    },
    [searchState, onSearchApply],
  )

  const handleSearchMatchTypeChange = useCallback(
    (matchType: SearchMatchType) => {
      const next = { ...searchState, matchType }
      onSearchApply?.(next)
    },
    [searchState, onSearchApply],
  )

  const handleSearchIncludeNotesChange = useCallback(
    (includeNotes: boolean) => {
      const next = { ...searchState, includeNotes }
      onSearchApply?.(next)
    },
    [searchState, onSearchApply],
  )

  const handleSearchClear = useCallback(() => {
    onSearchApply?.(DEFAULT_SEARCH_STATE)
  }, [onSearchApply])

  const toggleAccount = useCallback(
    (accountId: string) => {
      const ids = filterState.accountIds.includes(accountId)
        ? filterState.accountIds.filter((id) => id !== accountId)
        : [...filterState.accountIds, accountId]
      onFilterChange({ ...filterState, accountIds: ids })
    },
    [filterState, onFilterChange],
  )

  const clearAccounts = useCallback(() => {
    onFilterChange({ ...filterState, accountIds: [] })
  }, [filterState, onFilterChange])

  const toggleCategory = useCallback(
    (categoryId: string) => {
      const ids = filterState.categoryIds.includes(categoryId)
        ? filterState.categoryIds.filter((id) => id !== categoryId)
        : [...filterState.categoryIds, categoryId]
      onFilterChange({ ...filterState, categoryIds: ids })
    },
    [filterState, onFilterChange],
  )

  const clearCategories = useCallback(() => {
    onFilterChange({ ...filterState, categoryIds: [] })
  }, [filterState, onFilterChange])

  const clearTags = useCallback(() => {
    onFilterChange({ ...filterState, tagIds: [] })
  }, [filterState, onFilterChange])

  const toggleTag = useCallback(
    (tagId: string) => {
      const ids = filterState.tagIds.includes(tagId)
        ? filterState.tagIds.filter((id) => id !== tagId)
        : [...filterState.tagIds, tagId]
      onFilterChange({ ...filterState, tagIds: ids })
    },
    [filterState, onFilterChange],
  )

  const toggleType = useCallback(
    (type: TransactionType) => {
      const types = filterState.typeFilters.includes(type)
        ? filterState.typeFilters.filter((t) => t !== type)
        : [...filterState.typeFilters, type]
      onFilterChange({ ...filterState, typeFilters: types })
    },
    [filterState, onFilterChange],
  )

  const clearTypes = useCallback(() => {
    onFilterChange({ ...filterState, typeFilters: [] })
  }, [filterState, onFilterChange])

  const setPending = useCallback(
    (value: "all" | "pending" | "notPending") => {
      onFilterChange({ ...filterState, pendingFilter: value })
    },
    [filterState, onFilterChange],
  )

  const setGroupBy = useCallback(
    (value: GroupByOption) => {
      onFilterChange({ ...filterState, groupBy: value })
    },
    [filterState, onFilterChange],
  )

  const setAttachment = useCallback(
    (value: "all" | "has" | "none") => {
      onFilterChange({ ...filterState, attachmentFilter: value })
    },
    [filterState, onFilterChange],
  )

  const handleClearAll = useCallback(() => {
    LayoutAnimation.configureNext(LAYOUT_ANIM)
    setExpandedPanel(null)
    onFilterChange(DEFAULT_TRANSACTION_LIST_FILTER_STATE)
    onSearchApply?.(DEFAULT_SEARCH_STATE)
    onDateRangeChange?.(null)
  }, [onFilterChange, onSearchApply, onDateRangeChange])

  const handleDone = useCallback(() => {
    LayoutAnimation.configureNext(LAYOUT_ANIM)
    setExpandedPanel(null)
  }, [])

  const isSearchActive =
    searchState.query.length > 0 || searchState.matchType === "untitled"
  const isDateActive = selectedRange !== null
  const isAccountsActive = filterState.accountIds.length > 0
  const isCategoriesActive = filterState.categoryIds.length > 0
  const isTagsActive = filterState.tagIds.length > 0
  const isPendingActive = filterState.pendingFilter !== "all"
  const isTypeActive = filterState.typeFilters.length > 0
  const isGroupByActive = filterState.groupBy !== "day"
  const isAttachmentsActive = filterState.attachmentFilter !== "all"

  const hasAnyFilter =
    isSearchActive ||
    isDateActive ||
    isAccountsActive ||
    isCategoriesActive ||
    isTagsActive ||
    isPendingActive ||
    isTypeActive ||
    isGroupByActive ||
    isAttachmentsActive

  const accountLabel =
    filterState.accountIds.length === 0
      ? "Accounts"
      : filterState.accountIds.length === accounts.length
        ? "All"
        : `${filterState.accountIds.length} acct`

  const categoryLabel =
    filterState.categoryIds.length === 0
      ? "Categories"
      : filterState.categoryIds.length === 1
        ? "1 category"
        : `${filterState.categoryIds.length} categories`

  const tagLabel =
    filterState.tagIds.length === 0
      ? "Tags"
      : filterState.tagIds.length === 1
        ? "1 tag"
        : `${filterState.tagIds.length} tags`

  const typeLabel =
    filterState.typeFilters.length === 0
      ? "Type"
      : filterState.typeFilters.length === 3
        ? "All types"
        : `${filterState.typeFilters.length} type${filterState.typeFilters.length > 1 ? "s" : ""}`

  const groupByLabel = GROUP_BY_LABELS[filterState.groupBy]

  const dateLabel = selectedRange
    ? `${selectedRange.start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} – ${selectedRange.end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`
    : "This month"

  const borderColor = `${theme.colors.onSurface}30`
  const activeBg = theme.colors.secondary ?? `${theme.colors.onSurface}12`

  const pills: {
    key: FilterPanelKey | "date"
    icon: IconSymbolName
    label: string
    active: boolean
  }[] = [
    {
      key: "search",
      icon: "magnify",
      label: isSearchActive ? searchState.query || "Untitled" : "Search",
      active: isSearchActive,
    },
    { key: "date", icon: "calendar", label: dateLabel, active: isDateActive },
    {
      key: "accounts",
      icon: "credit-card",
      label: accountLabel,
      active: isAccountsActive,
    },
    {
      key: "categories",
      icon: "shape",
      label: categoryLabel,
      active: isCategoriesActive,
    },
    {
      key: "tags",
      icon: "tag-multiple",
      label: tagLabel,
      active: isTagsActive,
    },
    {
      key: "pending",
      icon: "clock",
      label: "Pending Status",
      active: isPendingActive,
    },
    {
      key: "type",
      icon: "swap-horizontal",
      label: typeLabel,
      active: isTypeActive,
    },
    {
      key: "groupBy",
      icon: "dots-triangle",
      label: groupByLabel,
      active: isGroupByActive,
    },
    {
      key: "attachments",
      icon: "attachment",
      label: "Attachments",
      active: isAttachmentsActive,
    },
  ]

  const visiblePills = pills.filter(
    (p) => !hiddenFilters.includes(p.key as FilterPanelKey),
  )

  return (
    <View style={filterHeaderStyles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={filterHeaderStyles.pillRow}
      >
        {hasAnyFilter ? (
          <Pressable
            style={[filterHeaderStyles.clearAllPill, { borderColor }]}
            onPress={handleClearAll}
          >
            <IconSymbol name="close-circle" size={18} />
            <Text
              variant="default"
              style={[
                filterHeaderStyles.clearAllLabel,
                { color: theme.colors.primary },
              ]}
            >
              Clear all
            </Text>
          </Pressable>
        ) : null}
        {visiblePills.map(({ key, icon, label, active }) => {
          const isExpanded = expandedPanel === key
          return (
            <Pressable
              key={key}
              style={[
                filterHeaderStyles.pill,
                {
                  borderColor: isExpanded
                    ? theme.colors.primary
                    : active
                      ? `${theme.colors.primary}60`
                      : borderColor,
                  backgroundColor:
                    active || isExpanded ? activeBg : "transparent",
                },
              ]}
              onPress={() =>
                key === "date"
                  ? handleDatePress()
                  : togglePanel(key as FilterPanelKey)
              }
            >
              <IconSymbol name={icon} size={18} />
              <Text
                variant="default"
                style={[
                  filterHeaderStyles.pillLabel,
                  {
                    color:
                      isExpanded || active
                        ? theme.colors.primary
                        : theme.colors.onSurface,
                  },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {expandedPanel !== null ? (
        <View
          style={[
            filterHeaderStyles.panel,
            {
              backgroundColor: `${theme.colors.onSurface}06`,
              borderColor,
            },
          ]}
        >
          {expandedPanel === "search" ? (
            <SearchPanel
              value={searchState.query}
              onChange={handleSearchChange}
              onClear={handleSearchClear}
              onDone={handleDone}
              matchType={searchState.matchType}
              onMatchTypeChange={handleSearchMatchTypeChange}
              includeNotes={searchState.includeNotes}
              onIncludeNotesChange={handleSearchIncludeNotesChange}
            />
          ) : null}
          {expandedPanel === "accounts" ? (
            <AccountsPanel
              accounts={accounts}
              selectedIds={filterState.accountIds}
              onToggle={toggleAccount}
              onClear={clearAccounts}
              onDone={handleDone}
            />
          ) : null}
          {expandedPanel === "categories" ? (
            <CategoriesPanel
              categoriesByType={categoriesByType}
              selectedIds={filterState.categoryIds}
              onToggle={toggleCategory}
              onClear={clearCategories}
              onDone={handleDone}
            />
          ) : null}
          {expandedPanel === "tags" ? (
            <TagsPanel
              tags={tags}
              selectedIds={filterState.tagIds}
              onToggle={toggleTag}
              onClear={clearTags}
              onDone={handleDone}
            />
          ) : null}
          {expandedPanel === "pending" ? (
            <PendingPanel
              value={filterState.pendingFilter}
              onSelect={setPending}
              onDone={handleDone}
            />
          ) : null}
          {expandedPanel === "type" ? (
            <TypePanel
              value={filterState.typeFilters}
              onToggle={toggleType}
              onClear={clearTypes}
              onDone={handleDone}
            />
          ) : null}
          {expandedPanel === "groupBy" ? (
            <GroupByPanel
              value={filterState.groupBy}
              onSelect={setGroupBy}
              onDone={handleDone}
            />
          ) : null}
          {expandedPanel === "attachments" ? (
            <AttachmentsPanel
              value={filterState.attachmentFilter}
              onSelect={setAttachment}
              onDone={handleDone}
            />
          ) : null}
        </View>
      ) : null}

      <DateRangePresetModal
        visible={dateModalVisible}
        initialStart={selectedRange?.start}
        initialEnd={selectedRange?.end}
        onSave={(start, end) => {
          onDateRangeChange?.({ start, end })
          setDateModalVisible(false)
        }}
        onRequestClose={() => setDateModalVisible(false)}
      />
    </View>
  )
}
