/**
 * Inline filter header for the transaction list.
 * Horizontal pill row + expandable inline filter panels.
 * No bottom sheets — filters are shown directly in the view.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import { LayoutAnimation, ScrollView, TextInput, View } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { DateRangePresetModal } from "~/components/date-range-preset-modal"
import { DynamicIcon } from "~/components/dynamic-icon"
import { IconSymbol, type IconSymbolName } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import type { Account } from "~/types/accounts"
import type { Category } from "~/types/categories"
import type { Tag } from "~/types/tags"
import type {
  GroupByOption,
  TransactionListFilterState,
} from "~/types/transaction-filters"
import {
  ATTACHMENT_OPTIONS,
  DEFAULT_TRANSACTION_LIST_FILTER_STATE,
  GROUP_BY_OPTIONS,
  PENDING_OPTIONS,
  TYPE_OPTIONS,
} from "~/types/transaction-filters"
import type { TransactionType } from "~/types/transactions"
import { TransactionTypeEnum } from "~/types/transactions"

import { Button } from "../ui/button"

export type FilterPanelKey =
  | "search"
  | "accounts"
  | "categories"
  | "tags"
  | "pending"
  | "type"
  | "groupBy"
  | "attachments"

const GROUP_BY_LABELS: Record<GroupByOption, string> = {
  hour: "Hour",
  day: "Day",
  week: "Week",
  month: "Month",
  year: "Year",
  allTime: "All time",
}

const LAYOUT_ANIM = LayoutAnimation.Presets.easeInEaseOut

// ─── Chip toggle ──────────────────────────────────────────────────────────────

function Chip({
  label,
  selected,
  onPress,
  leading,
}: {
  label: string
  selected: boolean
  onPress: () => void
  leading?: React.ReactNode
}) {
  const { theme } = useUnistyles()
  const borderColor = `${theme.colors.onSurface}30`
  const selectedBg = theme.colors.secondary ?? `${theme.colors.onSurface}15`

  return (
    <Pressable
      style={[
        styles.chip,
        {
          backgroundColor: selected ? selectedBg : "transparent",
          borderColor: selected ? "transparent" : borderColor,
          borderWidth: 1,
        },
      ]}
      onPress={onPress}
    >
      {leading}
      <Text
        style={[
          styles.chipLabel,
          {
            color: selected ? theme.colors.primary : theme.colors.onSurface,
            fontWeight: selected ? "600" : "400",
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {selected ? <IconSymbol name="check" size={14} /> : null}
    </Pressable>
  )
}

// ─── Inline filter panels ─────────────────────────────────────────────────────

const CHIPS_PER_ROW = 4

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

function SearchPanel({
  value,
  onChange,
  onClear,
}: {
  value: string
  onChange: (text: string) => void
  onClear: () => void
}) {
  const { theme } = useUnistyles()
  return (
    <View style={styles.searchRow}>
      <IconSymbol name="magnify" size={20} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Memo, amount, category…"
        placeholderTextColor={`${theme.colors.onSurface}50`}
        style={[styles.searchInput, { color: theme.colors.onSurface }]}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
      />
      {value.length > 0 ? (
        <Pressable onPress={onClear} style={styles.clearHit}>
          <IconSymbol name="close-circle" size={20} />
        </Pressable>
      ) : null}
    </View>
  )
}

function AccountsPanel({
  accounts,
  selectedIds,
  onToggle,
  onClear,
}: {
  accounts: Account[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onClear: () => void
}) {
  const { theme } = useUnistyles()
  return (
    <View>
      {chunk(accounts, CHIPS_PER_ROW).map((row) => (
        <ScrollView
          key={row.map((a) => a.id).join(",")}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScrollRow}
          style={styles.categoryRow}
        >
          {row.map((account) => (
            <Chip
              key={account.id}
              label={account.name}
              selected={selectedIds.includes(account.id)}
              onPress={() => onToggle(account.id)}
              leading={
                account.icon ? (
                  <DynamicIcon
                    icon={account.icon}
                    size={18}
                    colorScheme={account.colorScheme}
                    variant="raw"
                  />
                ) : (
                  <IconSymbol name="wallet" size={18} />
                )
              }
            />
          ))}
        </ScrollView>
      ))}

      {selectedIds.length > 0 ? (
        <View style={styles.panelHeader}>
          <View />
          <Button variant="ghost" onPress={onClear} style={styles.clearHit}>
            <Text style={[styles.clearText, { color: theme.colors.primary }]}>
              Clear
            </Text>
          </Button>
        </View>
      ) : null}
    </View>
  )
}

function PendingPanel({
  value,
  onSelect,
}: {
  value: "all" | "pending" | "notPending"
  onSelect: (v: "all" | "pending" | "notPending") => void
}) {
  return (
    <View>
      {chunk(PENDING_OPTIONS, CHIPS_PER_ROW).map((row) => (
        <View
          key={row.map((o) => o.id).join(",")}
          style={[styles.chipScrollRow, styles.categoryRow]}
        >
          {row.map((opt) => (
            <Chip
              key={opt.id}
              label={opt.label}
              selected={value === opt.id}
              onPress={() => onSelect(opt.id)}
            />
          ))}
        </View>
      ))}
    </View>
  )
}

function TypePanel({
  value,
  onToggle,
  onClear,
}: {
  value: TransactionType[]
  onToggle: (type: TransactionType) => void
  onClear: () => void
}) {
  const { theme } = useUnistyles()
  return (
    <View>
      {chunk(
        TYPE_OPTIONS.filter((o) => o.id !== "all"),
        CHIPS_PER_ROW,
      ).map((row) => (
        <View
          key={row.map((o) => o.id).join(",")}
          style={[styles.chipScrollRow, styles.categoryRow]}
        >
          {row.map((opt) => (
            <Chip
              key={opt.id}
              label={opt.label}
              selected={value.includes(opt.id as TransactionType)}
              onPress={() => onToggle(opt.id as TransactionType)}
            />
          ))}
        </View>
      ))}
      {value.length > 0 ? (
        <View style={styles.panelHeader}>
          <View />
          <Button variant="ghost" onPress={onClear} style={styles.clearHit}>
            <Text style={[styles.clearText, { color: theme.colors.primary }]}>
              Clear
            </Text>
          </Button>
        </View>
      ) : null}
    </View>
  )
}

function GroupByPanel({
  value,
  onSelect,
}: {
  value: GroupByOption
  onSelect: (v: GroupByOption) => void
}) {
  return (
    <View>
      {chunk(GROUP_BY_OPTIONS, CHIPS_PER_ROW).map((row) => (
        <View
          key={row.map((o) => o.id).join(",")}
          style={[styles.chipScrollRow, styles.categoryRow]}
        >
          {row.map((opt) => (
            <Chip
              key={opt.id}
              label={opt.label}
              selected={value === opt.id}
              onPress={() => onSelect(opt.id)}
            />
          ))}
        </View>
      ))}
    </View>
  )
}

function AttachmentsPanel({
  value,
  onSelect,
}: {
  value: "all" | "has" | "none"
  onSelect: (v: "all" | "has" | "none") => void
}) {
  return (
    <View>
      {chunk(ATTACHMENT_OPTIONS, CHIPS_PER_ROW).map((row) => (
        <View
          key={row.map((o) => o.id).join(",")}
          style={[styles.chipScrollRow, styles.categoryRow]}
        >
          {row.map((opt) => (
            <Chip
              key={opt.id}
              label={opt.label}
              selected={value === opt.id}
              onPress={() => onSelect(opt.id)}
            />
          ))}
        </View>
      ))}
    </View>
  )
}

const CATEGORY_TYPE_OPTIONS: { id: TransactionType; label: string }[] = [
  { id: TransactionTypeEnum.EXPENSE, label: "Expense" },
  { id: TransactionTypeEnum.INCOME, label: "Income" },
  { id: TransactionTypeEnum.TRANSFER, label: "Transfer" },
]

/** Infer which category type to show first when panel opens, from current selection. */
function inferInitialCategoryType(
  selectedIds: string[],
  categoriesByType: Record<TransactionType, Category[]>,
): TransactionType | null {
  if (selectedIds.length === 0) return null
  const types: TransactionType[] = [
    TransactionTypeEnum.EXPENSE,
    TransactionTypeEnum.INCOME,
    TransactionTypeEnum.TRANSFER,
  ]
  for (const type of types) {
    const cats = categoriesByType[type] ?? []
    if (cats.some((c) => selectedIds.includes(c.id))) return type
  }
  return null
}

function CategoriesPanel({
  categoriesByType,
  selectedIds,
  onToggle,
  onClear,
}: {
  categoriesByType: Record<TransactionType, Category[]>
  selectedIds: string[]
  onToggle: (id: string) => void
  onClear: () => void
}) {
  const { theme } = useUnistyles()
  const initialType = useMemo(
    () => inferInitialCategoryType(selectedIds, categoriesByType),
    [selectedIds, categoriesByType],
  )
  const [selectedType, setSelectedType] = useState<TransactionType | null>(
    () => initialType,
  )

  const categories =
    selectedType !== null ? (categoriesByType[selectedType] ?? []) : []

  const categoryRows = chunk(categories, CHIPS_PER_ROW)

  const renderCategoryRow = (items: Category[], rowKey: string) => (
    <ScrollView
      key={rowKey}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipScrollRow}
      style={styles.categoryRow}
    >
      {items.map((category) => (
        <Chip
          key={category.id}
          label={category.name}
          selected={selectedIds.includes(category.id)}
          onPress={() => onToggle(category.id)}
          leading={
            category.icon ? (
              <DynamicIcon
                icon={category.icon}
                size={18}
                colorScheme={category.colorScheme}
                variant="raw"
              />
            ) : undefined
          }
        />
      ))}
    </ScrollView>
  )

  return (
    <View>
      <View style={styles.chipWrap}>
        {CATEGORY_TYPE_OPTIONS.map((opt) => (
          <Chip
            key={opt.id}
            label={opt.label}
            selected={selectedType === opt.id}
            onPress={() => setSelectedType(opt.id)}
          />
        ))}
      </View>
      {selectedType !== null && categories.length > 0 ? (
        <View style={styles.categorySection}>
          {categoryRows.map((row) =>
            renderCategoryRow(row, row.map((c) => c.id).join(",")),
          )}
        </View>
      ) : selectedType !== null && categories.length === 0 ? (
        <Text
          style={[styles.categoryEmptyHint, { color: theme.colors.onSurface }]}
        >
          No categories for this type
        </Text>
      ) : null}

      {selectedIds.length > 0 ? (
        <View style={styles.panelHeader}>
          <View />
          <Button variant="ghost" onPress={onClear} style={styles.clearHit}>
            <Text style={[styles.clearText, { color: theme.colors.primary }]}>
              Clear
            </Text>
          </Button>
        </View>
      ) : null}
    </View>
  )
}

function TagsPanel({
  tags,
  selectedIds,
  onToggle,
  onClear,
}: {
  tags: Tag[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onClear: () => void
}) {
  const { theme } = useUnistyles()
  return (
    <View>
      {chunk(tags, CHIPS_PER_ROW).map((row) => (
        <ScrollView
          key={row.map((t) => t.id).join(",")}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScrollRow}
          style={styles.categoryRow}
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
      {selectedIds.length > 0 ? (
        <View style={styles.panelHeader}>
          <View />
          <Button variant="ghost" onPress={onClear} style={styles.clearHit}>
            <Text style={[styles.clearText, { color: theme.colors.primary }]}>
              Clear
            </Text>
          </Button>
        </View>
      ) : null}
    </View>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface TransactionFilterHeaderProps {
  accounts: Account[]
  /** Categories grouped by transaction type (expense, income, transfer). */
  categoriesByType: Record<TransactionType, Category[]>
  /** All tags for the tags filter. */
  tags: Tag[]
  filterState: TransactionListFilterState
  onFilterChange: (state: TransactionListFilterState) => void
  selectedRange?: { start: Date; end: Date } | null
  onDateRangeChange?: (range: { start: Date; end: Date } | null) => void
  searchQuery?: string
  onSearchApply?: (query: string) => void
  /** Filter panel keys to hide from the pill bar (e.g. ["accounts"] on account detail). */
  hiddenFilters?: FilterPanelKey[]
}

export function TransactionFilterHeader({
  accounts,
  categoriesByType,
  tags,
  filterState,
  onFilterChange,
  selectedRange = null,
  onDateRangeChange,
  searchQuery = "",
  onSearchApply,
  hiddenFilters = [],
}: TransactionFilterHeaderProps) {
  const [expandedPanel, setExpandedPanel] = useState<FilterPanelKey | null>(
    null,
  )
  const [dateModalVisible, setDateModalVisible] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const { theme } = useUnistyles()

  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  // ── Panel toggling ──

  const togglePanel = useCallback((key: FilterPanelKey) => {
    LayoutAnimation.configureNext(LAYOUT_ANIM)
    setExpandedPanel((prev) => (prev === key ? null : key))
  }, [])

  const handleDatePress = useCallback(() => {
    LayoutAnimation.configureNext(LAYOUT_ANIM)
    setExpandedPanel(null)
    setDateModalVisible(true)
  }, [])

  // ── Search handlers ──

  const handleSearchChange = useCallback(
    (text: string) => {
      setLocalSearch(text)
      onSearchApply?.(text)
    },
    [onSearchApply],
  )

  const handleSearchClear = useCallback(() => {
    setLocalSearch("")
    onSearchApply?.("")
  }, [onSearchApply])

  // ── Filter handlers (apply immediately) ──

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

  const toggleTag = useCallback(
    (tagId: string) => {
      const ids = filterState.tagIds.includes(tagId)
        ? filterState.tagIds.filter((id) => id !== tagId)
        : [...filterState.tagIds, tagId]
      onFilterChange({ ...filterState, tagIds: ids })
    },
    [filterState, onFilterChange],
  )

  const clearTags = useCallback(() => {
    onFilterChange({ ...filterState, tagIds: [] })
  }, [filterState, onFilterChange])

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
    setLocalSearch("")
    onFilterChange(DEFAULT_TRANSACTION_LIST_FILTER_STATE)
    onSearchApply?.("")
    onDateRangeChange?.(null)
  }, [onFilterChange, onSearchApply, onDateRangeChange])

  // ── Derived state ──

  const isSearchActive = searchQuery.length > 0
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
      label: isSearchActive ? searchQuery : "Search",
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
    <View style={styles.container}>
      {/* ── Pill bar ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {hasAnyFilter ? (
          <Pressable
            style={[styles.clearAllPill, { borderColor }]}
            onPress={handleClearAll}
          >
            <IconSymbol name="close-circle" size={18} />
            <Text
              variant="default"
              style={[styles.clearAllLabel, { color: theme.colors.primary }]}
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
                styles.pill,
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
              <IconSymbol
                name={icon}
                size={18}
                // color={
                //   isExpanded || active
                //     ? theme.colors.primary
                //     : theme.colors.onSurface
                // }
              />
              <Text
                variant="default"
                style={[
                  styles.pillLabel,
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

      {/* ── Expanded inline panel ── */}
      {expandedPanel !== null ? (
        <View
          style={[
            styles.panel,
            {
              backgroundColor: `${theme.colors.onSurface}06`,
              borderColor,
            },
          ]}
        >
          {expandedPanel === "search" ? (
            <SearchPanel
              value={localSearch}
              onChange={handleSearchChange}
              onClear={handleSearchClear}
            />
          ) : null}
          {expandedPanel === "accounts" ? (
            <AccountsPanel
              accounts={accounts}
              selectedIds={filterState.accountIds}
              onToggle={toggleAccount}
              onClear={clearAccounts}
            />
          ) : null}
          {expandedPanel === "categories" ? (
            <CategoriesPanel
              categoriesByType={categoriesByType}
              selectedIds={filterState.categoryIds}
              onToggle={toggleCategory}
              onClear={clearCategories}
            />
          ) : null}
          {expandedPanel === "tags" ? (
            <TagsPanel
              tags={tags}
              selectedIds={filterState.tagIds}
              onToggle={toggleTag}
              onClear={clearTags}
            />
          ) : null}
          {expandedPanel === "pending" ? (
            <PendingPanel
              value={filterState.pendingFilter}
              onSelect={setPending}
            />
          ) : null}
          {expandedPanel === "type" ? (
            <TypePanel
              value={filterState.typeFilters}
              onToggle={toggleType}
              onClear={clearTypes}
            />
          ) : null}
          {expandedPanel === "groupBy" ? (
            <GroupByPanel value={filterState.groupBy} onSelect={setGroupBy} />
          ) : null}
          {expandedPanel === "attachments" ? (
            <AttachmentsPanel
              value={filterState.attachmentFilter}
              onSelect={setAttachment}
            />
          ) : null}
        </View>
      ) : null}

      {/* ── Date modal (kept as modal since it's a calendar picker) ── */}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  container: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.colors.radius ?? 12,
    borderWidth: 1,
    gap: 6,
  },
  pillLabel: {
    fontSize: 13,
    maxWidth: 100,
  },
  clearAllPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.colors.radius ?? 12,
    borderWidth: 1,
    gap: 6,
  },
  clearAllLabel: {
    fontSize: 13,
    fontWeight: "500",
  },

  /* Expanded panel */
  panel: {
    marginTop: 10,
    borderRadius: theme.colors.radius ?? 12,
    padding: 12,
    borderWidth: 1,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  clearText: {
    fontSize: 13,
    fontWeight: "500",
  },
  clearHit: {
    marginLeft: "auto",
    padding: 4,
  },

  /* Chips */
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipScrollRow: {
    flexDirection: "row",
    gap: 8,
  },
  categoryRow: {
    marginBottom: 8,
  },
  categorySection: {
    marginTop: 14,
  },
  categoryEmptyHint: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: "400",
    opacity: 0.5,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.colors.radius ?? 12,
    gap: 6,
  },
  chipLabel: {
    fontSize: 14,
  },

  /* Search */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: `${theme.colors.onSurface}10`,
    borderRadius: theme.colors.radius ?? 10,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
}))
