import { withObservables } from "@nozbe/watermelondb/react"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { useLayoutEffect } from "react"
import { StyleSheet } from "react-native-unistyles"

import { DynamicIcon } from "~/components/dynamic-icon"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Money } from "~/components/ui/money"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { observeAccountDetailsById } from "~/database/services/account-service"
import { getThemeStrict } from "~/styles/theme/registry"
import type { Account } from "~/types/accounts"

interface AccountDetailsProps {
  account: Account
}

const AccountDetailsScreenInner = ({ account }: AccountDetailsProps) => {
  // Convert models to domain types

  const router = useRouter()
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          variant="ghost"
          size="icon"
          onPress={() =>
            router.push({
              pathname: "/accounts/[accountId]/modify",
              params: { accountId: account.id },
            })
          }
        >
          <IconSymbol name="pencil" size={20} />
        </Button>
      ),
    })
  }, [navigation, router, account.id])

  if (!account) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="default">Loading account...</Text>
        </View>
      </View>
    )
  }

  const colorScheme = getThemeStrict(account.colorSchemeName)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <DynamicIcon
          icon={account.icon || "wallet-bifold-outline"}
          size={40}
          colorScheme={colorScheme}
        />
        <Text variant="h3" style={styles.accountName}>
          {account.name}
        </Text>
        <Text variant="default" style={styles.accountType}>
          {account.type.toUpperCase()}
        </Text>
        <Money
          value={account.balance}
          variant="h1"
          style={styles.balance}
          currency={account.currencyCode}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.placeholderContainer}>
          <IconSymbol name="chart-box" size={48} color="gray" outline />
          <Text variant="default" style={styles.placeholderText}>
            Transactions coming soon
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.onSurface,
  },
  accountName: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  accountType: {
    fontSize: 12,
    color: theme.colors.customColors.semi,
    letterSpacing: 1,
  },
  balance: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.onSurface,
    marginTop: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
    gap: 10,
  },
  placeholderText: {
    color: theme.colors.onSurface,
  },
}))

const EnhancedAccountDetailsScreen = withObservables(
  ["accountId"],
  ({ accountId }) => ({
    account: observeAccountDetailsById(accountId),
  }),
)(AccountDetailsScreenInner)

export default function AccountDetailsScreen() {
  const { accountId } = useLocalSearchParams<{ accountId: string }>()

  if (!accountId) return null

  return <EnhancedAccountDetailsScreen accountId={accountId} />
}
