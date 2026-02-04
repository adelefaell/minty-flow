import { format } from "date-fns"
import { useRouter } from "expo-router"
import { useMemo } from "react"
import { SectionList } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { DynamicIcon } from "~/components/dynamic-icon"
import { SummaryCard } from "~/components/summary-card"
import { TransactionItem } from "~/components/transaction-item"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { useMoneyFormattingStore } from "~/stores/money-formatting.store"
import { useProfileStore } from "~/stores/profile.store"
import type { Transaction } from "~/types/transactions"

// Mock Data for UI verification
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "income",
    transactionDate: new Date(),
    isDeleted: false,
    amount: 600.0,
    currency: "USD",
    isPending: false,
    accountId: "1",
    categoryId: "1",
    title: "Paycheck",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    type: "expense",
    transactionDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
    isDeleted: false,
    amount: -10.0,
    currency: "USD",
    isPending: false,
    accountId: "1",
    categoryId: "2",
    title: "Change dollars",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    type: "expense",
    transactionDate: new Date(Date.now() - 86400000 * 2),
    isDeleted: false,
    amount: -1.0,
    currency: "USD",
    isPending: false,
    accountId: "2", // Cash
    categoryId: "3", // Snacks
    title: "2 energy drinks xxl",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    type: "transfer",
    transactionDate: new Date(Date.now() - 86400000 * 2),
    isDeleted: false,
    amount: 100.0,
    currency: "USD",
    isPending: false,
    accountId: "2",
    categoryId: null,
    title: "From Savings to Cash",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    type: "expense",
    transactionDate: new Date(Date.now() - 86400000 * 2),
    isDeleted: false,
    amount: -19.0,
    currency: "USD",
    isPending: false,
    accountId: "2",
    categoryId: "4",
    title: "hoz",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    type: "expense",
    transactionDate: new Date(Date.now() - 86400000 * 2),
    isDeleted: false,
    amount: -19.0,
    currency: "USD",
    isPending: false,
    accountId: "2",
    categoryId: "4",
    title: "hoz",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    type: "expense",
    transactionDate: new Date(Date.now() - 86400000 * 4),
    isDeleted: false,
    amount: -19.0,
    currency: "USD",
    isPending: false,
    accountId: "2",
    categoryId: "4",
    title: "hoz",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "8",
    type: "expense",
    transactionDate: new Date(Date.now() - 86400000 * 2),
    isDeleted: false,
    amount: -19.0,
    currency: "USD",
    isPending: false,
    accountId: "2",
    categoryId: "4",
    title: "hoz",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "8",
    type: "expense",
    transactionDate: new Date(Date.now() - 86400000 * 5),
    isDeleted: false,
    amount: -19.0,
    currency: "USD",
    isPending: false,
    accountId: "2",
    categoryId: "4",
    title: "hoz",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "9",
    type: "expense",
    transactionDate: new Date(Date.now() - 86400000 * 2),
    isDeleted: false,
    amount: -19.0,
    currency: "USD",
    isPending: false,
    accountId: "2",
    categoryId: "4",
    title: "hoz",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "10",
    type: "expense",
    transactionDate: new Date(Date.now() - 86400000 * 2),
    isDeleted: false,
    amount: -19.0,
    currency: "USD",
    isPending: false,
    accountId: "2",
    categoryId: "4",
    title: "hoz",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "11",
    type: "expense",
    transactionDate: new Date(Date.now() - 86400000 * 2),
    isDeleted: false,
    amount: -19.0,
    currency: "USD",
    isPending: false,
    accountId: "2",
    categoryId: "4",
    title: "hoz",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function HomeScreen() {
  const router = useRouter()
  const profileName = useProfileStore((s) => s.name)
  const image = useProfileStore((s) => s.imageUri)
  const togglePrivacy = useMoneyFormattingStore((s) => s.togglePrivacyMode)

  const privacyModeEnabled = useMoneyFormattingStore((s) => s.privacyMode)

  // Group transactions by date
  // TODO: Use a proper SectionList data processing utility in specific service/hook
  const sections = useMemo(() => {
    const grouped: Record<
      string,
      { title: string; data: Transaction[]; total: number }
    > = {}

    MOCK_TRANSACTIONS.forEach((t) => {
      // Simple day grouping
      const dateKey = format(t.transactionDate, "yyyy-MM-dd")

      let headerTitle = "Today"
      const today = format(new Date(), "yyyy-MM-dd")
      if (dateKey !== today) {
        headerTitle = format(t.transactionDate, "EEEE") // e.g. "Monday"
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          title: headerTitle,
          data: [],
          total: 0,
        }
      }
      grouped[dateKey].data.push(t)
      grouped[dateKey].total += t.amount
    })

    return Object.values(grouped).sort((a, b) => {
      // Sort by date descending (mock logic assumption)
      return (
        b.data[0].transactionDate.getTime() -
        a.data[0].transactionDate.getTime()
      )
    })
  }, [])

  const renderHeader = () => (
    <View style={styles.summaryRow}>
      <SummaryCard type="income" label="Income" amount={600.0} currency="USD" />
      <SummaryCard
        type="expense"
        label="Expense"
        amount={-88.08}
        currency="USD"
      />
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <Pressable
            onPress={() => router.push("/settings/edit-profile")}
            style={styles.avatarPlaceholder}
          >
            {image ? (
              <DynamicIcon icon={image} variant="raw" size={48} />
            ) : (
              <IconSymbol name="account" size={24} />
            )}
          </Pressable>
          <Text variant="h3" style={styles.greetingText}>
            Hi, {profileName}!
          </Text>
        </View>
        <Button variant="ghost" onPress={togglePrivacy}>
          <IconSymbol name={privacyModeEnabled ? "eye-off" : "eye"} size={24} />
        </Button>
      </View>

      {/* Filter / Search Row */}
      <View style={styles.actionRow}>
        <View style={styles.filterButton}>
          <IconSymbol name="filter-variant" size={20} />
          <Text variant="default" style={{ marginLeft: 4 }}>
            0
          </Text>
        </View>
        <View style={styles.searchButton}>
          <IconSymbol name="magnify" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.searchText}>Search</Text>
        </View>
        <View style={styles.timeFilterButton}>
          <IconSymbol name="clock" size={20} style={{ marginRight: 8 }} />
          <Text variant="default">This month</Text>
        </View>
      </View>

      {/* Summary Cards */}
      {/* <View style={styles.summaryRow}>
        <SummaryCard
          type="income"
          label="Income"
          amount={600.0}
          currency="USD"
        />
        <SummaryCard
          type="expense"
          label="Expense"
          amount={-88.08}
          currency="USD"
        />
      </View> */}

      {/* Transactions List */}
      <SectionList
        sections={sections}
        ListHeaderComponent={renderHeader}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        renderSectionHeader={({ section: { title, total, data } }) => (
          <View style={styles.sectionHeader}>
            <View>
              <Text variant="h4" style={styles.sectionTitle}>
                {title}
              </Text>
              <Text variant="small" style={styles.sectionSubtitle}>
                {total.toFixed(2)} • {data.length} transactions
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingTop: 16, // Adjust based on SafeArea if needed, but simple View for now
    backgroundColor: theme.colors.surface,
    marginTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 4,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarPlaceholder: {
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  greetingText: {
    fontWeight: "bold",
  },
  actionRow: {
    paddingHorizontal: 20,

    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.customColors.semi,
    //   backgroundColor: theme.colors.surface,
  },
  searchButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.customColors.semi,
    //   backgroundColor: theme.colors.surface,
  },
  searchText: {
    color: theme.colors.onSecondary,
  },
  timeFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.customColors.semi,
    //   backgroundColor: theme.colors.surface,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 100, // Space for Bottom Tab
  },
  sectionHeader: {
    marginTop: 16,
    paddingHorizontal: 20,

    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 2,
  },
  sectionSubtitle: {
    color: theme.colors.onSecondary,
  },
}))
