import { withObservables } from "@nozbe/watermelondb/react"
import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { AccountCard } from "~/components/accounts/account-card"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type AccountModel from "~/database/models/Account"
import { observeArchivedAccounts } from "~/database/services/account-service"
import { modelToAccount } from "~/database/utils/model-to-account"

interface ArchivedAccountsScreenInnerProps {
  archivedAccountsModels: AccountModel[]
}

const ArchivedAccountsScreenInner = ({
  archivedAccountsModels,
}: ArchivedAccountsScreenInnerProps) => {
  const archivedAccounts = archivedAccountsModels.map(modelToAccount)

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text variant="h4">Archived Accounts</Text>
      </View>

      <View style={styles.header}>
        <Text variant="small" style={styles.sectionLabel}>
          TOTAL ARCHIVED
        </Text>
        <Text variant="h3" style={styles.accountsCount}>
          {archivedAccounts.length}{" "}
          {archivedAccounts.length === 1 ? "Account" : "Accounts"}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {archivedAccounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            isReorderMode={false}
          />
        ))}

        {archivedAccounts.length === 0 && (
          <View style={styles.emptyState}>
            <Text variant="default" style={styles.emptyText}>
              No archived accounts found.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const ArchivedAccountsScreen = withObservables([], () => ({
  archivedAccountsModels: observeArchivedAccounts(),
}))

export default ArchivedAccountsScreen(ArchivedAccountsScreenInner)

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
  },
  titleContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.customColors.semi,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  accountsCount: {
    color: theme.colors.onSurface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 5,
    paddingBottom: 40,
    gap: 15,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    color: theme.colors.customColors.semi,
    fontStyle: "italic",
  },
}))
