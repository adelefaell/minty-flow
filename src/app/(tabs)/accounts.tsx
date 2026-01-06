import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { AccountCard } from "~/components/account-card"
import { Button } from "~/components/ui/button"
import type { IconSymbolName } from "~/components/ui/icon-symbol"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

interface Account {
  id: string
  name: string
  type: string
  icon: IconSymbolName
  iconColor: string
  balance: number
  currency: string
  currencySymbol: string
  monthlyIn: number
  monthlyOut: number
  monthlyNet: number
}

const STATIC_ACCOUNTS: Account[] = [
  {
    id: "1",
    name: "Test",
    type: "INVESTMENT",
    icon: "wallet.bifold.fill",
    iconColor: "#FF9500", // Orange
    balance: 400.0,
    currency: "USD",
    currencySymbol: "$",
    monthlyIn: 0.0,
    monthlyOut: 0.0,
    monthlyNet: 0.0,
  },
  {
    id: "2",
    name: "Another Test",
    type: "CHECKING",
    icon: "creditcard.fill",
    iconColor: "#5E5CE6", // Purple
    balance: 120.0,
    currency: "EUR",
    currencySymbol: "€",
    monthlyIn: 0.0,
    monthlyOut: 0.0,
    monthlyNet: 0.0,
  },
  {
    id: "3",
    name: "Wallet",
    type: "CHECKING",
    icon: "wallet",
    iconColor: "#FF2D55", // Pink
    balance: 100000.0,
    currency: "LBP",
    currencySymbol: "LE",
    monthlyIn: 0.0,
    monthlyOut: 0.0,
    monthlyNet: 0.0,
  },
]

export default function AccountsScreen() {
  // Group balances by currency
  const balancesByCurrency = STATIC_ACCOUNTS.reduce(
    (acc, account) => {
      const existing = acc.find((item) => item.currency === account.currency)
      if (existing) {
        existing.balance += account.balance
      } else {
        acc.push({
          currency: account.currency,
          currencySymbol: account.currencySymbol,
          balance: account.balance,
        })
      }
      return acc
    },
    [] as { currency: string; currencySymbol: string; balance: number }[],
  )

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text variant="h4">Accounts</Text>

        <Button variant="ghost" size="icon">
          <IconSymbol name="reorder.horizontal" size={24} />
        </Button>
      </View>

      <View style={styles.header}>
        <Text variant="small" style={styles.sectionLabel}>
          TOTAL BALANCE
        </Text>
        <View style={styles.balanceContainer}>
          {balancesByCurrency.map((item) => (
            <View key={item.currency} style={styles.balanceRow}>
              <Text variant="default" style={styles.currencyLabel}>
                {item.currency}
              </Text>
              <Text variant="h3" style={styles.balanceAmount}>
                {item.currencySymbol}
                {item.balance.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.accountsCountContainer}>
          <Text variant="small" style={styles.sectionLabel}>
            ACCOUNTS
          </Text>
          <Text variant="small" style={styles.accountsCount}>
            {STATIC_ACCOUNTS.length}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {STATIC_ACCOUNTS.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}

        <Pressable style={styles.newAccountButton}>
          <IconSymbol name="plus" size={24} />
          <Text variant="default" style={styles.newAccountText}>
            New Account
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 5,
    paddingBottom: 100,
    gap: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 40,
  },
  header: {
    marginTop: 20,
  },
  balanceContainer: {
    gap: 5,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: theme.colors.customColors.semi,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currencyLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  accountsCountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBlock: 10,
  },
  accountsCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  newAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
  },
  newAccountText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
}))
