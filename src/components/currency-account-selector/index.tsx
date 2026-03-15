/**
 * CurrencyAccountSelector — fully inline component (no modals).
 * Renders directly in a form's ScrollView.
 *
 * Currency section: trigger row toggles an inline panel listing unique
 * currencies derived from the provided accounts prop.
 *
 * Accounts section: multi-select list filtered to accounts matching
 * the selected currency — appears immediately below once a currency is picked.
 */

import { memo, useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { ScrollView } from "react-native"
import { useUnistyles } from "react-native-unistyles"

import { DynamicIcon } from "~/components/dynamic-icon"
import { ChevronIcon } from "~/components/ui/chevron-icon"
import { IconSvg } from "~/components/ui/icon-svg"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { Account } from "~/types/accounts"
import { Toast } from "~/utils/toast"

import { triggerStyles } from "../selector-modals/styles"
import type { CurrencyAccountSelectorProps } from "./types"

// ---------------------------------------------------------------------------
// Sub-types
// ---------------------------------------------------------------------------

interface CurrencyItem {
  code: string
  accountCount: number
}

// ---------------------------------------------------------------------------
// Currency row inside the inline panel
// ---------------------------------------------------------------------------

interface CurrencyPanelRowProps {
  item: CurrencyItem
  isSelected: boolean
  onSelect: (code: string) => void
}

const CurrencyPanelRow = memo(function CurrencyPanelRow({
  item,
  isSelected,
  onSelect,
}: CurrencyPanelRowProps) {
  const { theme } = useUnistyles()
  return (
    <Pressable
      style={[styles.panelRow, isSelected && styles.panelRowSelected]}
      onPress={() => onSelect(item.code)}
    >
      <View style={styles.panelRowLeft}>
        <Text variant="large">{item.code}</Text>
        <Text variant="muted">
          {item.accountCount} account{item.accountCount !== 1 ? "s" : ""}
        </Text>
      </View>
      {isSelected && (
        <IconSvg name="check" size={20} color={theme.colors.primary} />
      )}
    </Pressable>
  )
})

// ---------------------------------------------------------------------------
// Account row
// ---------------------------------------------------------------------------

interface AccountRowProps {
  account: Account
  isSelected: boolean
  onToggle: (id: string) => void
}

const AccountRow = memo(function AccountRow({
  account,
  isSelected,
  onToggle,
}: AccountRowProps) {
  const { theme } = useUnistyles()

  return (
    <Pressable style={styles.accountRow} onPress={() => onToggle(account.id)}>
      <View style={styles.accountLeft}>
        <DynamicIcon
          icon={account.icon}
          size={20}
          colorScheme={account.colorScheme}
          variant="badge"
        />
        <View>
          <Text style={styles.accountName} numberOfLines={1}>
            {account.name}
          </Text>
          <Text style={styles.accountCurrency}>{account.currencyCode}</Text>
        </View>
      </View>
      <IconSvg
        name={isSelected ? "check" : "circle"}
        size={22}
        color={isSelected ? theme.colors.primary : theme.colors.onSecondary}
      />
    </Pressable>
  )
})

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CurrencyAccountSelector({
  accounts,
  selectedCurrency,
  selectedAccountIds,
  onCurrencyChange,
  onAccountIdsChange,
}: CurrencyAccountSelectorProps) {
  const { t } = useTranslation()
  const [currencyPanelOpen, setCurrencyPanelOpen] = useState(false)
  const [accountPanelOpen, setAccountPanelOpen] = useState(false)

  // Derive unique currencies from accounts, sorted alphabetically
  const currencyItems: CurrencyItem[] = useMemo(() => {
    const map = new Map<string, number>()
    for (const account of accounts) {
      map.set(account.currencyCode, (map.get(account.currencyCode) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([code, accountCount]) => ({ code, accountCount }))
      .sort((a, b) => a.code.localeCompare(b.code))
  }, [accounts])

  // Accounts matching the selected currency
  const matchingAccounts = useMemo(
    () =>
      selectedCurrency
        ? accounts.filter((a) => a.currencyCode === selectedCurrency)
        : [],
    [accounts, selectedCurrency],
  )

  // ---------------------------------------------------------------------------
  // Currency panel handlers
  // ---------------------------------------------------------------------------

  const handleToggleCurrencyPanel = useCallback(() => {
    setCurrencyPanelOpen((prev) => !prev)
  }, [])

  const handleCurrencySelect = useCallback(
    (code: string) => {
      setCurrencyPanelOpen(false)

      if (code === selectedCurrency) return

      // Clear account selections that belong to the old currency
      const hasStaleAccounts = selectedAccountIds.some((id) => {
        const account = accounts.find((a) => a.id === id)
        return account && account.currencyCode !== code
      })

      if (hasStaleAccounts) {
        onAccountIdsChange([])
        setAccountPanelOpen(false)
        Toast.info({
          title: t("components.currencyAccountSelector.accountsClearedTitle"),
          description: t(
            "components.currencyAccountSelector.accountsClearedDescription",
            { currency: code },
          ),
        })
      }

      onCurrencyChange(code)
    },
    [
      selectedCurrency,
      selectedAccountIds,
      accounts,
      onCurrencyChange,
      onAccountIdsChange,
      t,
    ],
  )

  // ---------------------------------------------------------------------------
  // Account list handlers
  // ---------------------------------------------------------------------------

  const handleAccountToggle = useCallback(
    (id: string) => {
      const next = selectedAccountIds.includes(id)
        ? selectedAccountIds.filter((existing) => existing !== id)
        : [...selectedAccountIds, id]
      onAccountIdsChange(next)
    },
    [selectedAccountIds, onAccountIdsChange],
  )

  const allSelected =
    matchingAccounts.length > 0 &&
    matchingAccounts.every((a) => selectedAccountIds.includes(a.id))

  // Comma-separated names for the accounts trigger label
  const selectedAccountNames = useMemo(() => {
    if (selectedAccountIds.length === 0) return null
    return matchingAccounts
      .filter((a) => selectedAccountIds.includes(a.id))
      .map((a) => a.name)
      .join(", ")
  }, [matchingAccounts, selectedAccountIds])

  const handleToggleAccountPanel = useCallback(() => {
    setAccountPanelOpen((prev) => !prev)
  }, [])

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      const matchingIds = new Set(matchingAccounts.map((a) => a.id))
      onAccountIdsChange(
        selectedAccountIds.filter((id) => !matchingIds.has(id)),
      )
    } else {
      const existing = new Set(selectedAccountIds)
      for (const a of matchingAccounts) {
        existing.add(a.id)
      }
      onAccountIdsChange(Array.from(existing))
    }
  }, [allSelected, matchingAccounts, selectedAccountIds, onAccountIdsChange])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      {/* ---- CURRENCY SECTION ---- */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {t("components.currencyAccountSelector.currencyLabel")}
        </Text>

        {/* Currency trigger row */}
        <Pressable
          style={triggerStyles.triggerRow}
          onPress={handleToggleCurrencyPanel}
          accessibilityRole="button"
          accessibilityState={{ expanded: currencyPanelOpen }}
        >
          <View style={triggerStyles.triggerLeft}>
            <IconSvg name="currency" size={24} />
            {selectedCurrency ? (
              <Text style={triggerStyles.triggerLabel}>{selectedCurrency}</Text>
            ) : (
              <Text style={triggerStyles.triggerValue}>
                {t("components.currencyAccountSelector.currencyLabel")}
              </Text>
            )}
          </View>
          <View style={triggerStyles.triggerRight}>
            <ChevronIcon
              direction={currencyPanelOpen ? "up" : "trailing"}
              size={18}
              style={triggerStyles.chevronIcon}
            />
          </View>
        </Pressable>

        {/* Inline currency panel */}
        {currencyPanelOpen && (
          <View style={styles.inlinePanel}>
            <ScrollView
              style={styles.inlinePanelList}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {currencyItems.length === 0 ? (
                <View style={styles.emptyPanel}>
                  <Text style={styles.emptyText}>
                    {t(
                      "components.currencyAccountSelector.noAccountsForCurrency",
                    )}
                  </Text>
                </View>
              ) : (
                currencyItems.map((item) => (
                  <CurrencyPanelRow
                    key={item.code}
                    item={item}
                    isSelected={item.code === selectedCurrency}
                    onSelect={handleCurrencySelect}
                  />
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* ---- ACCOUNTS SECTION (only when currency is selected) ---- */}
      {selectedCurrency !== null && (
        <>
          {/* <View style={styles.divider} /> */}

          <View style={styles.section}>
            {/* <Text style={styles.sectionLabel}>
              {t(
                "components.currencyAccountSelector.accountsLabel",
              )}
            </Text> */}

            {/* Accounts trigger row */}
            <Pressable
              style={triggerStyles.triggerRow}
              onPress={handleToggleAccountPanel}
              accessibilityRole="button"
              accessibilityState={{ expanded: accountPanelOpen }}
            >
              <View style={triggerStyles.triggerLeft}>
                <IconSvg name="wallet" size={24} />
                {selectedAccountNames ? (
                  <Text numberOfLines={1} style={styles.accountTriggerValue}>
                    {selectedAccountNames}
                  </Text>
                ) : (
                  <Text style={triggerStyles.triggerValue}>
                    {t("components.currencyAccountSelector.accountsLabel")}
                  </Text>
                )}
              </View>
              <View style={triggerStyles.triggerRight}>
                <ChevronIcon
                  direction={accountPanelOpen ? "up" : "trailing"}
                  size={18}
                  style={triggerStyles.chevronIcon}
                />
              </View>
            </Pressable>

            {/* Inline accounts panel */}
            {accountPanelOpen && (
              <View style={styles.inlinePanel}>
                {matchingAccounts.length === 0 ? (
                  <View style={styles.emptyPanel}>
                    <Text style={styles.emptyText}>
                      {t(
                        "components.currencyAccountSelector.noAccountsForCurrency",
                      )}
                    </Text>
                  </View>
                ) : (
                  <ScrollView
                    style={styles.inlinePanelList}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    {/* Select all toggle — only when 2+ accounts share the currency */}
                    {matchingAccounts.length >= 2 && (
                      <Pressable
                        style={[styles.panelRow, styles.selectAllRow]}
                        onPress={handleSelectAll}
                      >
                        <Text style={styles.selectAllText}>
                          {t("components.currencyAccountSelector.selectAll", {
                            currency: selectedCurrency,
                          })}
                        </Text>
                        <IconSvg
                          name={allSelected ? "checks" : "check"}
                          size={20}
                        />
                      </Pressable>
                    )}

                    {matchingAccounts.map((account) => (
                      <AccountRow
                        key={account.id}
                        account={account}
                        isSelected={selectedAccountIds.includes(account.id)}
                        onToggle={handleAccountToggle}
                      />
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>
        </>
      )}
    </View>
  )
}

import { StyleSheet } from "react-native-unistyles"

const styles = StyleSheet.create((t) => ({
  container: {
    width: "100%",
  },
  section: {
    width: "100%",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: t.colors.onSurface,
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    opacity: 0.6,
  },
  // Currency trigger row
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  currencyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  currencyRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "500",
    color: t.colors.onSurface,
  },
  currencyPlaceholder: {
    fontSize: 16,
    color: t.colors.onSecondary,
    opacity: 0.6,
  },
  chevron: {
    color: t.colors.onSecondary,
    opacity: 0.4,
  },
  // Account rows
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  accountIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  accountName: {
    fontSize: 16,
    fontWeight: "500",
    color: t.colors.onSurface,
    flex: 1,
  },
  accountCurrency: {
    fontSize: 13,
    color: t.colors.onSecondary,
    opacity: 0.7,
    marginTop: 2,
  },
  checkIcon: {
    color: t.colors.primary,
  },
  // Select all row (inside panel)
  selectAllRow: {
    borderBottomWidth: 1,
    borderBottomColor: `${t.colors.onSurface}10`,
  },
  selectAllText: {
    fontSize: 15,
    fontWeight: "500",
    color: t.colors.primary,
  },
  // Empty state
  emptyText: {
    fontSize: 14,
    color: t.colors.onSecondary,
    opacity: 0.6,
    textAlign: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  // Divider
  // divider: {
  //   height: 1,
  //   backgroundColor: t.colors.customColors.semi,
  //   marginHorizontal: 20,
  // },
  // Account trigger value — selected names, truncated
  accountTriggerValue: {
    fontSize: 15,
    fontWeight: "500",
    color: t.colors.onSurface,
  },
  // Inline currency panel (replaces modal)
  inlinePanel: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: t.colors.secondary,
    borderRadius: t.radius,
    overflow: "hidden",
    maxHeight: 260,
  },
  inlinePanelList: {
    flexGrow: 0,
  },
  emptyPanel: {
    paddingVertical: 24,
    alignItems: "center",
  },
  // Row inside the inline currency panel
  panelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: `${t.colors.onSurface}10`,
  },
  panelRowSelected: {
    backgroundColor: `${t.colors.primary}15`,
  },
  panelRowLeft: {
    flex: 1,
    gap: 2,
  },
}))
