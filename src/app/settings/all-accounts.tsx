import { withObservables } from "@nozbe/watermelondb/react"
import { useRouter } from "expo-router"
import { ScrollView } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { AccountCard } from "~/components/accounts/account-card"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { observeAccounts } from "~/database/services/account-service"
import type { Account } from "~/types/accounts"
import { NewEnum } from "~/types/new"

interface AllAccountsScreenInnerProps {
  accounts: Account[]
}

const AllAccountsScreenInner = ({ accounts }: AllAccountsScreenInnerProps) => {
  const router = useRouter()
  const { theme } = useUnistyles()

  const handleAddAccount = () => {
    router.push({
      pathname: "/accounts/[accountId]/modify",
      params: { accountId: NewEnum.NEW },
    })
  }

  const sortedAccounts = [...accounts].sort((a, b) => {
    if (a.isArchived === b.isArchived) return 0
    return a.isArchived ? 1 : -1
  })

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.newAccountButton} onPress={handleAddAccount}>
          <IconSymbol name="plus" size={32} color={theme.colors.onSecondary} />
          <Text variant="default" style={styles.newAccountText}>
            Add new account
          </Text>
        </Pressable>

        {sortedAccounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            isReorderMode={false}
          />
        ))}
      </ScrollView>
    </View>
  )
}

const AllAccountsScreen = withObservables([], () => ({
  // observeAccounts(true) fetches ALL accounts, including archived ones
  accounts: observeAccounts(true),
}))

export default AllAccountsScreen(AllAccountsScreenInner)

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 16,
  },
  newAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 24,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    marginBottom: 8,
  },
  newAccountText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSecondary,
  },
}))
