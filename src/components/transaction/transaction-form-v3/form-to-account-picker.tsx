/**
 * To-account picker block for the transaction form (transfers): trigger + inline list with search.
 * Optional scroll-into-view when scroll refs are passed.
 */

import { useRouter } from "expo-router"
import { useMemo, useState } from "react"
import { ScrollView } from "react-native"
import { useUnistyles } from "react-native-unistyles"

import { DynamicIcon } from "~/components/dynamic-icon"
import { Money } from "~/components/money"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Input } from "~/components/ui/input"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { useScrollIntoView } from "~/hooks/use-scroll-into-view"
import { getThemeStrict } from "~/styles/theme/registry"
import type { Account } from "~/types/accounts"
import { NewEnum } from "~/types/new"

import { styles } from "./form.styles"

export interface FormToAccountPickerProps {
  accounts: Account[]
  toAccountId: string | undefined
  accountId: string
  setValue: (
    name: "toAccountId" | "accountId",
    value: string,
    opts: { shouldDirty: boolean },
  ) => void
  selectedToAccount: Account | null | undefined
  transactionType: string
}

export function FormToAccountPicker({
  accounts,
  toAccountId,
  accountId,
  setValue,
  selectedToAccount,
  transactionType,
}: FormToAccountPickerProps) {
  const router = useRouter()
  const { theme } = useUnistyles()
  const { wrapperRef, scrollIntoView } = useScrollIntoView()
  const [toAccountPickerOpen, setToAccountPickerOpen] = useState(false)
  const [toAccountSearchQuery, setToAccountSearchQuery] = useState("")

  const filteredToAccountsForPicker = useMemo(() => {
    let list = accounts
    if (toAccountSearchQuery.trim()) {
      const lower = toAccountSearchQuery.toLowerCase()
      list = list.filter((a) => a.name.toLowerCase().includes(lower))
    }
    return list
  }, [accounts, toAccountSearchQuery])

  const handleToggle = () => {
    setToAccountPickerOpen((o) => {
      const next = !o
      if (next) {
        scrollIntoView()
        setToAccountSearchQuery("")
      }
      return next
    })
  }

  if (transactionType !== "transfer") return null

  return (
    <View native ref={wrapperRef} style={styles.fieldBlock}>
      <View style={styles.sectionLabelRow}>
        <Text variant="small" style={styles.sectionLabelInRow}>
          To account
        </Text>
        <Pressable
          onPress={() =>
            toAccountId && setValue("toAccountId", "", { shouldDirty: true })
          }
          style={[
            styles.clearButton,
            !toAccountId && styles.clearButtonDisabled,
          ]}
          pointerEvents={toAccountId ? "auto" : "none"}
          accessibilityLabel="Clear to account"
          accessibilityState={{ disabled: !toAccountId }}
        >
          <Text variant="small" style={styles.clearButtonText}>
            Clear
          </Text>
        </Pressable>
      </View>
      <Pressable
        style={[
          styles.accountTrigger,
          selectedToAccount && styles.accountTriggerSelected,
        ]}
        onPress={handleToggle}
        accessibilityLabel={
          toAccountPickerOpen ? "Cancel" : "Select to account"
        }
      >
        {selectedToAccount ? (
          <>
            <DynamicIcon
              icon={selectedToAccount.icon || "wallet-bifold"}
              size={24}
              colorScheme={getThemeStrict(selectedToAccount.colorSchemeName)}
              variant="badge"
            />
            <View style={styles.accountTriggerContent}>
              <Text
                variant="default"
                style={styles.accountTriggerName}
                numberOfLines={1}
              >
                {selectedToAccount.name}
              </Text>
              <Money
                value={selectedToAccount.balance}
                currency={selectedToAccount.currencyCode}
                style={styles.accountTriggerBalance}
              />
            </View>
            <IconSymbol
              name={toAccountPickerOpen ? "chevron-up" : "chevron-right"}
              size={20}
              style={styles.chevronIcon}
            />
          </>
        ) : (
          <>
            <DynamicIcon
              icon="wallet-bifold"
              size={24}
              color={theme.colors.primary}
              variant="badge"
            />
            <Text
              variant="default"
              style={styles.accountTriggerPlaceholder}
              numberOfLines={1}
            >
              Select to account
            </Text>
            <IconSymbol
              name={toAccountPickerOpen ? "close" : "chevron-down"}
              size={20}
              style={styles.chevronIcon}
            />
          </>
        )}
      </Pressable>
      {toAccountPickerOpen && (
        <View native style={styles.inlineAccountPicker}>
          <Input
            placeholder="Search accounts..."
            value={toAccountSearchQuery}
            onChangeText={setToAccountSearchQuery}
            placeholderTextColor={theme.colors.customColors.semi}
            style={styles.pickerSearchInput}
          />
          <ScrollView
            style={styles.pickerList}
            contentContainerStyle={styles.pickerListContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            {filteredToAccountsForPicker.map((account) => (
              <Pressable
                key={account.id}
                style={[
                  styles.accountPickerRow,
                  account.id === toAccountId && styles.inlinePickerRowSelected,
                ]}
                onPress={() => {
                  setValue("toAccountId", account.id, { shouldDirty: true })
                  if (accountId === account.id) {
                    setValue("accountId", "", { shouldDirty: true })
                  }
                  setToAccountPickerOpen(false)
                }}
              >
                <DynamicIcon
                  icon={account.icon || "wallet-bifold"}
                  size={24}
                  colorScheme={getThemeStrict(account.colorSchemeName)}
                  variant="badge"
                />
                <View style={styles.accountPickerRowContent} native>
                  <Text
                    variant="default"
                    style={styles.accountPickerRowName}
                    numberOfLines={1}
                  >
                    {account.name}
                  </Text>
                  <Money
                    value={account.balance}
                    currency={account.currencyCode}
                    style={styles.accountPickerRowBalance}
                  />
                </View>
              </Pressable>
            ))}
            {filteredToAccountsForPicker.length === 0 && (
              <Pressable
                style={styles.accountPickerRowAdd}
                onPress={() => {
                  router.push({
                    pathname: "/accounts/[accountId]/modify",
                    params: { accountId: NewEnum.NEW },
                  })
                  setToAccountPickerOpen(false)
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Add account"
              >
                <DynamicIcon
                  icon="plus"
                  size={24}
                  colorScheme={
                    theme?.colors as import("~/styles/theme/types").MintyColorScheme
                  }
                  variant="badge"
                />
                <Text
                  variant="default"
                  style={styles.accountPickerRowAddLabel}
                  numberOfLines={1}
                >
                  Add account
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  )
}
