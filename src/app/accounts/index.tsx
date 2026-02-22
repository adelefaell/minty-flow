import { withObservables } from "@nozbe/watermelondb/react"
import { useRouter } from "expo-router"
import { useState } from "react"
import { StyleSheet } from "react-native-unistyles"

import {
  AccountCard,
  type AccountCardProps,
} from "~/components/accounts/account-card"
import { Money } from "~/components/money"
import { ReorderableListV2 } from "~/components/reorderable-list-v2"
import { SearchInput } from "~/components/search-input"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type AccountModel from "~/database/models/Account"
import type { AccountWithMonthTotals } from "~/database/services/account-service"
import {
  observeAccountModels,
  observeAccountsWithMonthTotals,
  updateAccountsOrder,
} from "~/database/services/account-service"
import { modelToAccount } from "~/database/utils/model-to-account"
import { useTransfersPreferencesStore } from "~/stores/transfers-preferences.store"
import { NewEnum } from "~/types/new"
import { logger } from "~/utils/logger"

interface AccountsScreenInnerProps {
  accountModels: AccountModel[]
  accountsWithMonthTotals: AccountWithMonthTotals[]
}

const AccountsScreenInner = ({
  accountModels,
  accountsWithMonthTotals,
}: AccountsScreenInnerProps) => {
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [reorderedModels, setReorderedModels] = useState<AccountModel[]>([])

  // Filter on models (source of truth for order/search)
  const filteredModels = accountModels.filter((model) => {
    if (!searchQuery.trim()) return true
    return model.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const displayModels = isReorderMode ? reorderedModels : filteredModels

  // Accounts with month totals for display (match by id to preserve order)
  const displayAccounts = displayModels.map((model) => {
    const withTotals = accountsWithMonthTotals.find((a) => a.id === model.id)
    return (
      withTotals ?? {
        ...modelToAccount(model),
        monthIn: 0,
        monthOut: 0,
        monthNet: 0,
      }
    )
  })

  // Balance calculation (domain only)
  const balancesByCurrency = displayAccounts.reduce(
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

  const handleToggleReorder = () => {
    // Clear search first
    setSearchQuery("")

    if (!isReorderMode) {
      setReorderedModels(accountModels) // use the full list here
    }

    setIsReorderMode((prev) => !prev)
  }

  const handleSaveReorder = async () => {
    try {
      await updateAccountsOrder(reorderedModels)
      setIsReorderMode(false)
      setReorderedModels([])
    } catch (error) {
      logger.error("Failed to save account order", { error })
    }
  }

  const handleCancelReorder = () => {
    setIsReorderMode(false)
    setReorderedModels([])
  }

  const handleReorder = (newModels: AccountModel[]) => {
    setReorderedModels(newModels)
  }

  const handleAddAccount = () => {
    router.push({
      pathname: "/accounts/[accountId]/modify",
      params: { accountId: NewEnum.NEW },
    })
  }

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
            <Button variant="ghost" size="icon" onPress={handleToggleReorder}>
              <IconSymbol name="swap-vertical" size={24} />
            </Button>
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
              <Money
                value={item.balance}
                variant="h3"
                currency={item.currency}
                style={styles.balanceAmount}
              />
            </View>
          ))}
        </View>

        <View style={styles.accountsCountContainer}>
          <Text variant="small" style={styles.sectionLabel}>
            ACCOUNTS
          </Text>
          <Text variant="small" style={styles.accountsCount}>
            {filteredModels.length}
          </Text>
        </View>
      </View>

      {!isReorderMode && (
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search accounts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery("")}
          />
        </View>
      )}

      <ReorderableListV2
        data={displayModels}
        onReorder={handleReorder}
        showButtons={isReorderMode}
        renderItem={({ item }) => {
          const accountWithTotals = displayAccounts.find(
            (a) => a.id === item.id,
          )
          const cardProps: AccountCardProps = {
            account: accountWithTotals ?? modelToAccount(item),
            monthIn: accountWithTotals?.monthIn ?? 0,
            monthOut: accountWithTotals?.monthOut ?? 0,
            monthNet: accountWithTotals?.monthNet ?? 0,
            isReorderMode,
          }
          return <AccountCard {...cardProps} />
        }}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          !isReorderMode ? (
            <View style={styles.footer}>
              <Button onPress={handleAddAccount} variant="secondary">
                <IconSymbol name="plus" size={24} />
                <Text variant="default">New Account</Text>
              </Button>
            </View>
          ) : null
        }
      />
    </View>
  )
}

// Watermelon binding: models for order/search, with month totals for cards
const enhance = withObservables(
  ["excludeFromTotals"],
  ({ excludeFromTotals = true }: { excludeFromTotals?: boolean }) => ({
    accountModels: observeAccountModels(false),
    accountsWithMonthTotals: observeAccountsWithMonthTotals(
      false,
      excludeFromTotals,
    ),
  }),
)

const EnhancedAccountsScreen = enhance(AccountsScreenInner)

function AccountsScreen() {
  const excludeFromTotals = useTransfersPreferencesStore(
    (s) => s.excludeFromTotals,
  )
  return <EnhancedAccountsScreen excludeFromTotals={excludeFromTotals} />
}

export default AccountsScreen

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingBottom: 100,
    gap: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  header: {
    marginVertical: 20,
  },
  balanceContainer: { gap: 5 },
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
  },
  currencyLabel: {
    fontSize: 14,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "600",
  },
  accountsCountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBlock: 10,
  },
  accountsCount: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.customColors.semi,
  },
  searchContainer: {
    marginBottom: 10,
  },
  footer: {
    marginBottom: 40,
  },
}))
