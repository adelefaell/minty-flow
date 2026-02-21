import { useNavigation } from "expo-router"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react"
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { ExternalLink } from "~/components/external-link"
import { InfoModal } from "~/components/info-modal"
import { SearchInput } from "~/components/search-input"
import { SmartAmountInput } from "~/components/smart-amount-input"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { exchangeRatesService } from "~/services"
import type { ExchangeRates } from "~/services/exchange-rates"
import { useExchangeRatesPreferencesStore } from "~/stores/exchange-rates-preferences.store"

const EXCHANGE_API_URL = "https://github.com/fawazahmed0/exchange-api"

function getEffectiveRate(
  code: string,
  apiRates: Record<string, number> | null,
  customRates: Record<string, number>,
): number | null {
  const upper = code.toUpperCase()
  if (customRates[upper] !== undefined) {
    return customRates[upper]
  }
  const lower = code.toLowerCase()
  if (apiRates && typeof apiRates[lower] === "number") {
    return apiRates[lower]
  }
  return null
}

interface RateEntry {
  code: string
  displayCode: string
  rate: number
  isCustom: boolean
}

export default function ExchangeRatesScreen() {
  const navigation = useNavigation()
  const customRates = useExchangeRatesPreferencesStore((s) => s.customRates)
  const setCustomRate = useExchangeRatesPreferencesStore((s) => s.setCustomRate)
  const removeCustomRate = useExchangeRatesPreferencesStore(
    (s) => s.removeCustomRate,
  )

  const [searchQuery, setSearchQuery] = useState("")
  const [rates, setRates] = useState<ExchangeRates | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingCurrencyCode, setEditingCurrencyCode] = useState<string | null>(
    null,
  )
  const [draftRates, setDraftRates] = useState<Record<string, number>>({})
  const [infoModalVisible, setInfoModalVisible] = useState(false)

  const fetchRates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await exchangeRatesService.tryFetchRates("usd")
      setRates(result ?? null)
      if (!result) setError("Could not load rates. Check your connection.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load rates")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRates()
  }, [fetchRates])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          variant="ghost"
          onPress={() => setInfoModalVisible(true)}
          accessibilityLabel="Information about exchange rates"
        >
          <IconSymbol name="information" size={24} />
        </Button>
      ),
    })
  }, [navigation])

  const entries = useMemo((): RateEntry[] => {
    if (!rates?.rates) return []
    const upperCustom = Object.keys(customRates).reduce<Record<string, number>>(
      (acc, k) => {
        acc[k.toUpperCase()] = customRates[k]
        return acc
      },
      {},
    )
    const list: RateEntry[] = []
    const seen = new Set<string>()
    for (const [key, value] of Object.entries(rates.rates)) {
      const displayCode = key.toUpperCase()
      if (seen.has(displayCode)) continue
      seen.add(displayCode)
      const custom = upperCustom[displayCode]
      const rate = custom !== undefined ? custom : value
      list.push({
        code: key,
        displayCode,
        rate,
        isCustom: custom !== undefined,
      })
    }
    list.sort((a, b) => a.displayCode.localeCompare(b.displayCode))
    return list
  }, [rates, customRates])

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries
    const q = searchQuery.trim().toUpperCase()
    return entries.filter((e) => e.displayCode.includes(q))
  }, [entries, searchQuery])

  const handleSelectEntry = useCallback((code: string, currentRate: number) => {
    setEditingCurrencyCode((prev) => (prev === code ? null : code))
    setDraftRates((d) => ({ ...d, [code]: currentRate }))
  }, [])

  const handleDraftChange = useCallback((code: string, value: number) => {
    setDraftRates((prev) => ({ ...prev, [code]: value }))
  }, [])

  const handleSaveRate = useCallback(
    (code: string, value: number) => {
      if (value <= 0) return
      setCustomRate(code, value)
      setEditingCurrencyCode(null)
      setDraftRates((prev) => {
        const next = { ...prev }
        delete next[code]
        return next
      })
    },
    [setCustomRate],
  )

  const handleResetToApiRate = useCallback(
    (code: string) => {
      removeCustomRate(code)
      setEditingCurrencyCode(null)
      setDraftRates((prev) => {
        const next = { ...prev }
        delete next[code]
        return next
      })
    },
    [removeCustomRate],
  )

  const renderItem = useCallback(
    ({ item }: { item: RateEntry }) => {
      const isEditing = editingCurrencyCode === item.displayCode
      const rate = getEffectiveRate(
        item.code,
        rates?.rates ?? null,
        customRates,
      )
      const displayRate = rate ?? 0
      const draftValue = draftRates[item.displayCode] ?? displayRate
      const isInvalidRate = draftValue <= 0

      return (
        <View style={styles.entryWrapper}>
          <Pressable
            style={[
              styles.entryRow,
              (isEditing || item.isCustom) && styles.entryRowSelected,
            ]}
            onPress={() => handleSelectEntry(item.displayCode, displayRate)}
          >
            <Text style={styles.entryEquals}>=</Text>
            <Text style={styles.entryAmount} numberOfLines={1}>
              {displayRate.toFixed(14)}
            </Text>
            <Text style={styles.entryCode}>{item.displayCode}</Text>
          </Pressable>
          {isEditing && (
            <View style={styles.inlineInput}>
              <SmartAmountInput
                value={draftValue}
                onChange={(value) => handleDraftChange(item.displayCode, value)}
                currencyCode={item.displayCode}
                label={`1 USD = ${draftValue.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${item.displayCode}`}
                placeholder="0"
                error={
                  isInvalidRate ? "Rate must be greater than 0" : undefined
                }
              />
              <View style={styles.saveButtonRow}>
                <Button
                  variant="outline"
                  onPress={() => handleResetToApiRate(item.displayCode)}
                  style={styles.resetButton}
                >
                  <Text>Reset</Text>
                </Button>
                <Button
                  variant="default"
                  onPress={() => handleSaveRate(item.displayCode, draftValue)}
                  style={styles.saveButton}
                  disabled={isInvalidRate}
                >
                  <Text>Save</Text>
                </Button>
              </View>
            </View>
          )}
        </View>
      )
    },
    [
      editingCurrencyCode,
      draftRates,
      rates?.rates,
      customRates,
      handleSelectEntry,
      handleDraftChange,
      handleSaveRate,
      handleResetToApiRate,
    ],
  )

  const fixedHeader = (
    <View style={styles.fixedHeader}>
      <ExternalLink href={EXCHANGE_API_URL} style={styles.apiCard}>
        <View style={styles.apiCardContent}>
          <Text style={styles.apiTitle}>Exchange Rates API</Text>
          <Text style={styles.apiUrl}>{EXCHANGE_API_URL}</Text>
        </View>
      </ExternalLink>
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery("")}
        placeholder="Search currencies..."
        containerStyle={styles.searchRow}
      />
      <Text style={styles.instruction}>
        Select an entry to set a custom exchange rate. Note: All exchange rate
        calculations use USD as a reference.
      </Text>
      <Text style={styles.baseHeading}>1 USD</Text>
    </View>
  )

  if (loading && !rates) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading exchange rates…</Text>
      </View>
    )
  }

  if (error && !rates) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchRates}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        {fixedHeader}
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.displayCode}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          style={styles.list}
        />
      </KeyboardAvoidingView>
      <InfoModal
        visible={infoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
        title="Exchange Rates"
        description="Rates are shown as amount per 1 USD. Select an entry to set a custom rate. All calculations use USD as reference."
        okLabel="OK"
        icon="information"
      />
    </>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
    paddingTop: 4,
  },
  fixedHeader: {
    paddingBottom: 12,
  },
  apiCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  apiCardContent: {
    flexDirection: "column",
    backgroundColor: theme.colors.secondary,
  },
  apiTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  apiUrl: {
    fontSize: 13,
    color: theme.colors.customColors.semi,
  },
  searchRow: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  instruction: {
    fontSize: 13,
    color: theme.colors.customColors.semi,
    marginHorizontal: 20,
    marginBottom: 16,
    lineHeight: 18,
  },
  baseHeading: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.onSurface,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  entryWrapper: {
    marginBottom: 4,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  entryRowSelected: {
    backgroundColor: theme.colors.secondary,
  },
  entryEquals: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginRight: 8,
  },
  entryAmount: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  entryCode: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.onSurface,
  },
  inlineInput: {
    paddingHorizontal: 0,
    paddingBottom: 8,
  },
  saveButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginVertical: 12,
  },
  resetButton: {},
  saveButton: {},
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: theme.colors.customColors.semi,
  },
  errorText: {
    fontSize: 15,
    color: theme.colors.error,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onPrimary,
  },
}))
