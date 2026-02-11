/**
 * Inline currency selector: trigger row + expandable panel with search and scroll.
 * Same pattern as ContactSelectorInline / AccountTypeInline.
 */

import { useMemo, useState } from "react"
import { LayoutAnimation, ScrollView, View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { SearchInput } from "~/components/search-input"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { currencyRegistryService } from "~/services/currency-registry"
import type { Currency } from "~/types/currency"

const LAYOUT_ANIM = LayoutAnimation.Presets.easeInEaseOut
const LIST_MAX_HEIGHT = 280

export interface CurrencySelectorInlineProps {
  /** Currently selected currency code (e.g. "USD"). */
  selectedCurrencyCode: string
  /** Called when user selects a currency (select and close). */
  onCurrencySelected: (code: string) => void
  /** When false, the trigger row is not tappable. */
  editable?: boolean
}

export function CurrencySelectorInline({
  selectedCurrencyCode,
  onCurrencySelected,
  editable = true,
}: CurrencySelectorInlineProps) {
  const [expanded, setExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const currencies = useMemo(
    () => Object.values(currencyRegistryService.groupedCurrencies),
    [],
  )

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return currencies
    const query = searchQuery.toLowerCase().trim()
    return currencies.filter(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.code?.toLowerCase().includes(query) ||
        c.country?.toLowerCase().includes(query),
    )
  }, [currencies, searchQuery])

  const handleToggle = () => {
    if (!editable) return
    LayoutAnimation.configureNext(LAYOUT_ANIM)
    setSearchQuery("")
    setExpanded((v) => !v)
  }

  const handleSelect = (code: string) => {
    onCurrencySelected(code)
    LayoutAnimation.configureNext(LAYOUT_ANIM)
    setSearchQuery("")
    setExpanded(false)
  }

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={styles.triggerRow}
        onPress={handleToggle}
        disabled={!editable}
      >
        <View style={styles.triggerLeft}>
          <IconSymbol name="currency-usd" size={24} />
          <Text variant="default" style={styles.triggerLabel}>
            Currency
          </Text>
        </View>
        <View style={styles.triggerRight}>
          <Text variant="default" style={styles.triggerValue}>
            {selectedCurrencyCode}
          </Text>
          {editable && (
            <IconSymbol
              name={expanded ? "chevron-up" : "chevron-right"}
              size={20}
              style={styles.chevronIcon}
            />
          )}
        </View>
      </Pressable>

      {editable && expanded && (
        <View style={styles.panel}>
          <View style={styles.searchContainer}>
            <SearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery("")}
              placeholder="Search... (country, currency, code)"
            />
          </View>
          <View style={styles.listWrapper}>
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="always"
              nestedScrollEnabled
            >
              {filteredCurrencies.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text variant="muted">No currencies found</Text>
                </View>
              ) : (
                filteredCurrencies.map((currency) => (
                  <CurrencyItem
                    key={currency.code}
                    currency={currency}
                    selected={selectedCurrencyCode === currency.code}
                    onPress={handleSelect}
                  />
                ))
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  )
}

function CurrencyItem({
  currency,
  selected,
  onPress,
}: {
  currency: Currency
  selected: boolean
  onPress: (code: string) => void
}) {
  return (
    <Pressable
      style={({ pressed }: { pressed: boolean }) => [
        styles.item,
        pressed && styles.itemPressed,
        selected && styles.itemSelected,
      ]}
      onPress={() => onPress(currency.code)}
    >
      <View style={styles.itemLeft}>
        <Text variant="large" style={styles.currencyName}>
          {currency.name}
        </Text>
        <Text variant="muted" style={styles.countryName}>
          {currency.country || (currency.isCrypto ? "Cryptocurrency" : "")}
        </Text>
      </View>
      <View style={styles.itemRight}>
        <Text variant="large" style={styles.currencyCode}>
          {currency.code}
        </Text>
        {selected && (
          <IconSymbol name="check" size={20} style={styles.itemCheck} />
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    width: "100%",
  },
  triggerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  triggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  triggerLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  triggerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  triggerValue: {
    fontSize: 16,
    color: theme.colors.onSecondary,
    opacity: 0.7,
  },
  chevronIcon: {
    color: theme.colors.onSecondary,
    opacity: 0.4,
  },
  panel: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: 0,
    gap: 12,
  },
  searchContainer: {
    marginBottom: 4,
  },
  listWrapper: {
    height: LIST_MAX_HEIGHT,
    borderRadius: theme.colors.radius ?? 12,
    overflow: "hidden",
    backgroundColor: `${theme.colors.onSurface}08`,
  },
  list: {},
  listContent: {
    paddingBottom: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  itemPressed: {
    opacity: 0.7,
    backgroundColor: `${theme.colors.onSurface}10`,
  },
  itemSelected: {
    backgroundColor: `${theme.colors.primary}12`,
  },
  itemLeft: {
    flex: 1,
    gap: 2,
  },
  currencyName: {
    fontWeight: "500",
    fontSize: 18,
  },
  countryName: {
    fontSize: 14,
    opacity: 0.7,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currencyCode: {
    fontWeight: "500",
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  itemCheck: {
    color: theme.colors.primary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
}))
