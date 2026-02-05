import { format } from "date-fns"
import { useRouter } from "expo-router"
import { useMemo } from "react"
import { Platform, SectionList } from "react-native"
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { DynamicIcon } from "~/components/dynamic-icon"
import { SummarySection } from "~/components/summary-card"
import { TransactionItem } from "~/components/transaction-item"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { useMoneyFormattingStore } from "~/stores/money-formatting.store"
import { useProfileStore } from "~/stores/profile.store"
import type { Transaction } from "~/types/transactions"
import { formatDisplayValue } from "~/utils/number-format"

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList)

// Mock Data for UI verification
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "income",
    transactionDate: new Date(),
    isDeleted: false,
    amount: 1000.0,
    currency: "EUR",
    isPending: false,
    accountId: "1",
    categoryId: "1",
    title: "Project Alpha Payment",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    type: "income",
    transactionDate: new Date(),
    isDeleted: false,
    amount: 1500.0,
    currency: "USD",
    isPending: false,
    accountId: "1",
    categoryId: "1",
    title: "Project Beta Payment",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    type: "expense",
    transactionDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
    isDeleted: false,
    amount: -45.5,
    currency: "EUR",
    isPending: false,
    accountId: "1",
    categoryId: "2",
    title: "Grocery Shopping",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    type: "expense",
    transactionDate: new Date(Date.now() - 86400000 * 2),
    isDeleted: false,
    amount: -80.0,
    currency: "USD",
    isPending: false,
    accountId: "2",
    categoryId: "3",
    title: "Starbucks Coffee",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    type: "transfer",
    transactionDate: new Date(Date.now() - 86400000 * 2),
    isDeleted: false,
    amount: 100.0,
    currency: "USD",
    isPending: false,
    accountId: "2",
    categoryId: null,
    title: "Savings Transfer",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    type: "expense",
    transactionDate: new Date(Date.now() - 86400000 * 3),
    isDeleted: false,
    amount: -120.0,
    currency: "USD",
    isPending: false,
    accountId: "2",
    categoryId: "4",
    title: "Amazon Order",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function HomeScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()
  const profileName = useProfileStore((s) => s.name)
  const image = useProfileStore((s) => s.imageUri)
  const { privacyMode: privacyModeEnabled, togglePrivacyMode: togglePrivacy } =
    useMoneyFormattingStore()

  const sections = useMemo(() => {
    const grouped: Record<
      string,
      {
        title: string
        data: Transaction[]
        totals: Record<string, number>
      }
    > = {}

    MOCK_TRANSACTIONS.forEach((t) => {
      const dateKey = format(t.transactionDate, "yyyy-MM-dd")
      let headerTitle = "Today"
      const today = format(new Date(), "yyyy-MM-dd")
      if (dateKey !== today) {
        headerTitle = format(t.transactionDate, "EEEE, MMM d")
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          title: headerTitle,
          data: [],
          totals: {},
        }
      }
      grouped[dateKey].data.push(t)
      const currentTotal = grouped[dateKey].totals[t.currency] || 0
      grouped[dateKey].totals[t.currency] = currentTotal + t.amount
    })

    return Object.values(grouped).sort((a, b) => {
      return (
        b.data[0].transactionDate.getTime() -
        a.data[0].transactionDate.getTime()
      )
    })
  }, [])

  const renderHeader = () => (
    <Animated.View entering={FadeIn.delay(50)} style={styles.summaryContainer}>
      <SummarySection transactions={MOCK_TRANSACTIONS} />
    </Animated.View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
        <Pressable
          onPress={() => router.push("/settings/edit-profile")}
          style={styles.greetingRow}
        >
          {image ? (
            <DynamicIcon icon={image} variant="raw" size={48} />
          ) : (
            <IconSymbol name="account" size={24} />
          )}
          <Text variant="large" style={styles.greetingText}>
            Hi, {profileName}!
          </Text>
        </Pressable>

        <Button variant="ghost" onPress={togglePrivacy}>
          <IconSymbol
            name={privacyModeEnabled ? "eye-off" : "eye"}
            size={24}
            color={
              privacyModeEnabled ? theme.colors.customColors.semi : undefined
            }
          />
        </Button>
      </Animated.View>

      {/* Action Row - Refined with theme radius */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.actionRow}>
        <Pressable style={styles.pillButton}>
          <IconSymbol name="filter-variant" size={20} />
          <Text variant="default" style={{ marginLeft: 4 }}>
            0
          </Text>
        </Pressable>
        <Pressable style={[styles.pillButton, styles.searchButton]}>
          <IconSymbol name="magnify" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.searchText}>Search</Text>
        </Pressable>
        <Pressable style={styles.pillButton}>
          <IconSymbol name="calendar" size={20} style={{ marginRight: 8 }} />
          <Text variant="default">This month</Text>
        </Pressable>
      </Animated.View>

      {/* Transactions List with Staggered Entrance */}
      <AnimatedSectionList
        sections={sections}
        ListHeaderComponent={renderHeader}
        keyExtractor={(item) => (item as Transaction).id}
        renderItem={({ item, index }) => (
          <TransactionItem transaction={item as Transaction} index={index} />
        )}
        renderSectionHeader={({ section }) => {
          const s = section as unknown as {
            title: string
            totals: Record<string, number>
          }
          return (
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text variant="h4" style={styles.sectionTitle}>
                  {s.title}
                </Text>
                <View style={styles.sectionDivider} />
              </View>
              <View style={styles.totalsContainer}>
                {Object.entries(s.totals).map(([curr, total], idx) => (
                  <Text key={curr} variant="small" style={styles.sectionTotal}>
                    {idx > 0 && "| "}
                    {formatDisplayValue(total, {
                      currency: curr,
                      showSign: true,
                    })}
                  </Text>
                ))}
              </View>
            </View>
          )
        }}
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
    backgroundColor: theme.colors.surface,
  },
  header: {
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 20 : 20, // Reverted to simpler padding
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: theme.colors.radius,
    padding: 10,
  },
  greetingText: {
    fontWeight: "bold",
  },
  actionRow: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  pillButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.colors.radius,
    borderWidth: 1,
    borderColor: theme.colors.customColors.semi,
  },
  searchButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  searchText: {
    color: theme.colors.onSecondary,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  listContent: {
    paddingBottom: 120,
  },
  sectionHeader: {
    marginTop: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.secondary,
    opacity: 0.5,
  },
  totalsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  sectionTotal: {
    fontWeight: "700",
    color: theme.colors.onSecondary,
    opacity: 0.8,
  },
}))
