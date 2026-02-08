import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { useCallback, useMemo, useState } from "react"
import { Keyboard } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import {
  BottomSheetModalComponent,
  type BottomSheetModalProps,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { DynamicIcon } from "~/components/dynamic-icon"
import { SearchInput } from "~/components/search-input"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { Account } from "~/types/accounts"
import { formatDisplayValue } from "~/utils/number-format"

interface AccountSheetProps extends Omit<BottomSheetModalProps, "children"> {
  accounts: Account[]
  selectedAccountId: string | null
  onSelect: (accountId: string) => void
}

export function AccountSheet({
  id,
  accounts,
  selectedAccountId,
  onSelect,
  onChange,
  onDismiss,
  ...bottomSheetProps
}: AccountSheetProps) {
  const sheet = useBottomSheet(id)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredAccounts = useMemo(() => {
    if (!searchQuery) return accounts
    const lower = searchQuery.toLowerCase()
    return accounts.filter((a) => a.name.toLowerCase().includes(lower))
  }, [accounts, searchQuery])

  const handleSelect = useCallback(
    (account: Account) => {
      onSelect(account.id)
      sheet.dismiss()
      Keyboard.dismiss()
    },
    [onSelect, sheet],
  )

  const renderItem = useCallback(
    ({ item }: { item: Account }) => {
      const isSelected = item.id === selectedAccountId
      return (
        <Pressable
          style={[styles.item, isSelected && styles.selectedItem]}
          onPress={() => handleSelect(item)}
        >
          <View style={styles.itemContent}>
            <DynamicIcon
              icon={item.icon}
              size={20}
              colorScheme={item.colorScheme}
            />
            <View style={styles.textContainer}>
              <View style={styles.itemTitleSubtile}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSubtitle}>{item.type}</Text>
              </View>
              <Text variant="p">
                {formatDisplayValue(item.balance, {
                  currency: item.currencyCode,
                })}
              </Text>
            </View>
          </View>
        </Pressable>
      )
    },
    [selectedAccountId, handleSelect],
  )

  return (
    <BottomSheetModalComponent
      id={id}
      snapPoints={["50%", "90%"]}
      skipBottomSheetView={true}
      enableDynamicSizing={false}
      onChange={onChange}
      onDismiss={onDismiss}
      {...bottomSheetProps}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Select Account</Text>
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search accounts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery("")}
          />
        </View>
      </View>
      <BottomSheetFlatList
        data={filteredAccounts}
        renderItem={renderItem}
        keyExtractor={(item: Account) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No accounts found</Text>
          </View>
        }
      />
    </BottomSheetModalComponent>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    marginBottom: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.customColors.semi}20`,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.onSurface,
    textAlign: "center",
    marginBottom: 4,
  },
  searchContainer: {
    marginBottom: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedItem: {
    borderColor: theme.colors.primary,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  itemTitleSubtile: {
    gap: 0,
  },
  itemSubtitle: {
    fontSize: 12,
    color: theme.colors.customColors.semi,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: theme.colors.customColors.semi,
  },
}))
