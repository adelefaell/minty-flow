/**
 * Account (from) picker block for the transaction form: trigger + inline list with search.
 * Optional scroll-into-view when scroll refs are passed.
 */

import { useRouter } from "expo-router"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { View as RNView, ScrollView } from "react-native"
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

export interface FormAccountPickerProps {
  accounts: Account[]
  accountId: string
  toAccountId: string | undefined
  setValue: (
    name: "accountId" | "toAccountId",
    value: string,
    opts: { shouldDirty: boolean },
  ) => void
  selectedAccount: Account | null | undefined
  balanceAtTransaction: number | null
  transaction: { id: string } | null
  accountError: string | undefined
  /** Used for styling only; can be omitted. */
  transactionType?: string
}

export function FormAccountPicker({
  accounts,
  accountId,
  toAccountId,
  setValue,
  selectedAccount,
  balanceAtTransaction,
  transaction,
  accountError,
  transactionType: _transactionType,
}: FormAccountPickerProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const { theme } = useUnistyles()
  const { wrapperRef, scrollIntoView } = useScrollIntoView()
  const [accountPickerOpen, setAccountPickerOpen] = useState(false)
  const [accountSearchQuery, setAccountSearchQuery] = useState("")

  const filteredAccountsForPicker = useMemo(() => {
    if (!accountSearchQuery.trim()) return accounts
    const lower = accountSearchQuery.toLowerCase()
    return accounts.filter((a) => a.name.toLowerCase().includes(lower))
  }, [accounts, accountSearchQuery])

  const handleToggle = () => {
    setAccountPickerOpen((o) => {
      const next = !o
      if (next) {
        scrollIntoView()
        setAccountSearchQuery("")
      }
      return next
    })
  }

  return (
    <RNView ref={wrapperRef} style={styles.fieldBlock}>
      <View style={styles.sectionLabelRow}>
        <Text variant="small" style={styles.sectionLabelInRow}>
          Account
        </Text>
        <Pressable
          onPress={() =>
            accountId && setValue("accountId", "", { shouldDirty: true })
          }
          style={[styles.clearButton, !accountId && styles.clearButtonDisabled]}
          pointerEvents={accountId ? "auto" : "none"}
          accessibilityLabel={t("screens.accounts.a11y.clear")}
          accessibilityState={{ disabled: !accountId }}
        >
          <Text variant="small" style={styles.clearButtonText}>
            {t("common.actions.clear")}
          </Text>
        </Pressable>
      </View>
      <Pressable
        style={[
          styles.accountTrigger,
          selectedAccount && styles.accountTriggerSelected,
          accountError && selectedAccount && styles.accountTriggerError,
        ]}
        onPress={handleToggle}
        accessibilityLabel={
          accountPickerOpen
            ? t("common.actions.cancel")
            : t("screens.accounts.a11y.select")
        }
      >
        {selectedAccount ? (
          <>
            <DynamicIcon
              icon={selectedAccount.icon || "wallet-bifold"}
              size={24}
              colorScheme={getThemeStrict(selectedAccount.colorSchemeName)}
              variant="badge"
            />
            <View style={styles.accountTriggerContent}>
              <Text
                variant="default"
                style={styles.accountTriggerName}
                numberOfLines={1}
              >
                {selectedAccount.name}
              </Text>
              <Money
                value={
                  transaction && balanceAtTransaction !== null
                    ? balanceAtTransaction
                    : selectedAccount.balance
                }
                currency={selectedAccount.currencyCode}
                style={styles.accountTriggerBalance}
              />
            </View>
            <IconSymbol
              name={accountPickerOpen ? "chevron-up" : "chevron-right"}
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
              {t("screens.accounts.a11y.select")}
            </Text>
            <IconSymbol
              name={accountPickerOpen ? "close" : "chevron-down"}
              size={20}
              style={styles.chevronIcon}
            />
          </>
        )}
      </Pressable>
      {accountPickerOpen && (
        <View native style={styles.inlineAccountPicker}>
          <Input
            placeholder={t("screens.accounts.a11y.searchPlaceholder")}
            value={accountSearchQuery}
            onChangeText={setAccountSearchQuery}
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
            {filteredAccountsForPicker.map((account) => (
              <Pressable
                key={account.id}
                style={[
                  styles.accountPickerRow,
                  account.id === accountId && styles.inlinePickerRowSelected,
                ]}
                onPress={() => {
                  setValue("accountId", account.id, { shouldDirty: true })
                  if (toAccountId === account.id) {
                    setValue("toAccountId", "", { shouldDirty: true })
                  }
                  setAccountPickerOpen(false)
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
            {filteredAccountsForPicker.length === 0 && (
              <Pressable
                style={styles.accountPickerRowAdd}
                onPress={() => {
                  router.push({
                    pathname: "/accounts/[accountId]/modify",
                    params: { accountId: NewEnum.NEW },
                  })
                  setAccountPickerOpen(false)
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel={t("screens.accounts.a11y.add")}
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
                  {t("screens.accounts.a11y.add")}
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      )}
      {accountError ? (
        <Text style={styles.fieldError}>{accountError}</Text>
      ) : null}
    </RNView>
  )
}
