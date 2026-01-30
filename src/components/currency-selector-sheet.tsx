import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { memo, useCallback, useMemo, useState } from "react"
import { Pressable, View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import {
  BottomSheetModalComponent,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { SearchInput } from "~/components/search-input"
import { Text } from "~/components/ui/text"
import { currencyRegistryService } from "~/services/currency-registry"
import type { Currency } from "~/types/currency"

interface CurrencySelectorSheetProps {
  id: string
  onCurrencySelected?: (currencyCode: string) => void
  initialCurrency?: string
}

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
        <SearchInput
          value={searchQuery}
          onChangeText={onSearchChange}
          onClear={onClear}
          placeholder="Search... (country, currency, code)"
        />
      </View>
    )
  },
)

const CurrencyItem = memo(
  ({
    currency,
    onPress,
  }: {
    currency: Currency
    onPress: (code: string) => void
  }) => {
    const handlePress = useCallback(() => {
      onPress(currency.code)
    }, [currency.code, onPress])

    return (
      <Pressable
        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        onPress={handlePress}
      >
        <View style={styles.itemLeft}>
          <Text variant="large" style={styles.currencyName}>
            {currency.name}
          </Text>
          <Text variant="muted" style={styles.countryName}>
            {currency.country || (currency.isCrypto ? "Cryptocurrency" : "")}
          </Text>
        </View>
        <Text variant="large" style={styles.currencyCode}>
          {currency.code}
        </Text>
      </Pressable>
    )
  },
)

// Extract keyExtractor outside component
const keyExtractor = (item: Currency) => item.code

// Extract empty component
const EmptyComponent = memo(() => (
  <View style={styles.emptyState}>
    <Text variant="muted">No currencies found</Text>
  </View>
))

export const CurrencySelectorSheet = ({
  id,
  onCurrencySelected,
}: CurrencySelectorSheetProps) => {
  const sheet = useBottomSheet(id)
  const [searchQuery, setSearchQuery] = useState("")

  const currencies = useMemo(() => {
    return Object.values(currencyRegistryService.groupedCurrencies)
  }, [])

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return currencies

    const query = searchQuery.toLowerCase().trim()
    return currencies.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query) ||
        c.country.toLowerCase().includes(query),
    )
  }, [currencies, searchQuery])

  const handleSelect = useCallback(
    (code: string) => {
      onCurrencySelected?.(code)
      sheet.dismiss()
      setTimeout(() => setSearchQuery(""), 300)
    },
    [onCurrencySelected, sheet],
  )

  const renderItem = useCallback(
    ({ item }: { item: Currency }) => (
      <CurrencyItem currency={item} onPress={handleSelect} />
    ),
    [handleSelect],
  )

  const handleClear = useCallback(() => setSearchQuery(""), [])

  const getItemLayout = (
    _data: Currency[] | null | undefined,
    index: number,
  ) => ({
    length: 68,
    offset: 68 * index,
    index,
  })

  return (
    <BottomSheetModalComponent
      id={id}
      snapPoints={["70%", "95%"]}
      backdropOpacity={0.5}
      backdropPressBehavior="close"
      keyboardBehavior="extend"
      keyboardBlurBehavior="none"
      enablePanDownToClose={true}
      skipBottomSheetView={true}
      enableDynamicSizing={false}
    >
      <View style={styles.header}>
        <Text variant="h4" style={styles.title}>
          Select a currency
        </Text>
      </View>
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={handleClear}
      />
      <BottomSheetFlatList
        data={filteredCurrencies}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="always"
        ListEmptyComponent={EmptyComponent}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={15}
        windowSize={10}
        getItemLayout={getItemLayout}
      />
    </BottomSheetModalComponent>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: "700",
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 40,
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
  currencyCode: {
    fontWeight: "500",
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
}))
