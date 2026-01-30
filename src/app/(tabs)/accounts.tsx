import { withObservables } from "@nozbe/watermelondb/react"
import { useRouter } from "expo-router"
import { useState } from "react"
import { StyleSheet } from "react-native-unistyles"

import { AccountCard } from "~/components/accounts/account-card"
import { ReorderableListV2 } from "~/components/reorderable-list-v2"
import { SearchInput } from "~/components/search-input"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type AccountModel from "~/database/models/Account"
import {
  observeAccounts,
  updateAccountsOrder,
} from "~/database/services/account-service"
import { NewEnum } from "~/types/new"
import { logger } from "~/utils/logger"

interface AccountsScreenInnerProps {
  accountModels: AccountModel[]
}

const AccountsScreenInner = ({ accountModels }: AccountsScreenInnerProps) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const [isReorderMode, setIsReorderMode] = useState(false)
  const [reorderedAccounts, setReorderedAccounts] = useState<AccountModel[]>([])

  // Group balances by currency
  const balancesByCurrency = accountModels.reduce(
    (acc, account) => {
      const existing = acc.find(
        (item) => item.currency === account.currencyCode,
      )
      if (existing) {
        existing.balance += account.balance
      } else {
        acc.push({
          currency: account.currencyCode,
          balance: account.balance,
        })
      }
      return acc
    },
    [] as { currency: string; balance: number }[],
  )

  const clearSearch = () => {
    setSearchQuery("")
  }

  const handleToggleReorder = () => {
    setIsReorderMode(!isReorderMode)
    if (!isReorderMode) {
      // Entering reorder mode - initialize with current accounts
      setReorderedAccounts(accountModels)
    }
  }

  const handleSaveReorder = async () => {
    try {
      await updateAccountsOrder(reorderedAccounts)
      setIsReorderMode(false)
      setReorderedAccounts([])
    } catch (error) {
      logger.error("Failed to save account order:", { error })
    }
  }

  const handleCancelReorder = () => {
    setIsReorderMode(false)
    setReorderedAccounts([])
  }

  const handleReorder = (newData: AccountModel[]) => {
    // Update local state with the new order
    setReorderedAccounts(newData)
  }

  const handleAddAccount = () => {
    router.push({
      pathname: "/accounts/[account-modify-id]",
      params: {
        "account-modify-id": NewEnum.NEW,
      },
    })
  }

  // Filter accounts based on search query
  const filteredAccounts = accountModels.filter((account) => {
    if (searchQuery.trim().length === 0) return true
    return account.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  })

  // Use reordered accounts if in reorder mode, otherwise use original
  const displayAccounts = isReorderMode ? reorderedAccounts : filteredAccounts

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text variant="h4">Accounts</Text>

        <View style={styles.actionButtons}>
          {isReorderMode ? (
            <>
              <Button variant="ghost" size="icon" onPress={handleCancelReorder}>
                <IconSymbol name="close" size={24} />
              </Button>
              <Button variant="ghost" size="icon" onPress={handleSaveReorder}>
                <IconSymbol name="check" size={24} />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onPress={() =>
                  router.push({
                    pathname: "/accounts/archived-accounts",
                  })
                }
              >
                <IconSymbol name="archive" size={24} />
              </Button>
              <Button variant="ghost" size="icon" onPress={handleToggleReorder}>
                <IconSymbol name="swap-vertical" size={24} />
              </Button>
            </>
          )}
        </View>
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
            {filteredAccounts.length}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      {!isReorderMode && (
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search accounts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={clearSearch}
          />
        </View>
      )}

      {filteredAccounts.length === 0 && searchQuery.trim().length > 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <IconSymbol name="magnify" size={40} />
          <Text variant="h4" style={{ marginTop: 16 }}>
            No results for "{searchQuery}"
          </Text>
        </View>
      ) : (
        <ReorderableListV2
          data={displayAccounts}
          onReorder={handleReorder}
          showButtons={isReorderMode}
          renderItem={({ item }) => (
            <AccountCard account={item} isReorderMode={isReorderMode} />
          )}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            !isReorderMode ? (
              <Pressable
                style={styles.newAccountButton}
                onPress={handleAddAccount}
              >
                <IconSymbol name="plus" size={24} />
                <Text variant="default" style={styles.newAccountText}>
                  New Account
                </Text>
              </Pressable>
            ) : null
          }
        />
      )}
    </View>
  )
}

// HOC to observe accounts from WatermelonDB
const enhance = withObservables([], () => {
  return {
    accountModels: observeAccounts(false),
  }
})

const AccountsScreen = enhance(AccountsScreenInner)

export default AccountsScreen

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
    gap: 15,
  },
  footerContainer: {
    marginTop: 10,
    paddingBottom: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 40,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  header: {
    marginTop: 20,
  },
  balanceContainer: {
    gap: 5,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "600",
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
    fontWeight: "600",
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
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  newAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
  },
  newAccountText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  searchContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
}))
