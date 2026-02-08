import { withObservables } from "@nozbe/watermelondb/react"
import { endOfMonth, startOfMonth } from "date-fns"
import { useRouter } from "expo-router"
import { Fragment, useCallback, useMemo, useRef } from "react"
import { Platform, SectionList } from "react-native"
import type { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable"
import { StyleSheet, useUnistyles } from "react-native-unistyles"
import { startWith } from "rxjs"

import { DynamicIcon } from "~/components/dynamic-icon"
import { SummarySection } from "~/components/summary-card"
import { TransactionItem } from "~/components/transaction-item"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Money } from "~/components/ui/money"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { observeAccountModels } from "~/database/services/account-service"
import { observeCategoriesByType } from "~/database/services/category-service"
import type { TransactionWithRelations } from "~/database/services/transaction-service"
import {
  deleteTransactionModel,
  observeTransactionModelsFull,
} from "~/database/services/transaction-service"
import { useTimeUtils } from "~/hooks/use-time-utils"
import { useMoneyFormattingStore } from "~/stores/money-formatting.store"
import { useProfileStore } from "~/stores/profile.store"
import type { TransactionType } from "~/types/transactions"
import { TransactionTypeEnum } from "~/types/transactions"
import { Toast } from "~/utils/toast"

/** Signed contribution for aggregation: income adds, expense subtracts, transfer is neutral. */
function transactionContribution(
  type: TransactionType,
  amount: number,
): number {
  if (type === TransactionTypeEnum.INCOME) return amount
  if (type === TransactionTypeEnum.EXPENSE) return -amount
  return 0
}

/** Current month filter: start and end of this month as timestamps. */
function getCurrentMonthFilter() {
  const now = new Date()
  return {
    fromDate: startOfMonth(now).getTime(),
    toDate: endOfMonth(now).getTime(),
  }
}

interface HomeScreenProps {
  transactionsFull?: TransactionWithRelations[] | null
}

function HomeScreenInner({ transactionsFull = [] }: HomeScreenProps) {
  const list = transactionsFull ?? []
  const router = useRouter()
  const { theme } = useUnistyles()
  const { formatDateKey, formatSectionDateTitle } = useTimeUtils()
  const profileName = useProfileStore((s) => s.name)
  const image = useProfileStore((s) => s.imageUri)
  const { privacyMode: privacyModeEnabled, togglePrivacyMode: togglePrivacy } =
    useMoneyFormattingStore()

  const openSwipeableRef = useRef<SwipeableMethods | null>(null)

  const sections = useMemo(() => {
    if (list.length === 0) {
      return [
        {
          title: "",
          data: [] as TransactionWithRelations[],
          totals: {} as Record<string, number>,
        },
      ]
    }

    // Newest first: sort by transaction date desc, then by createdAt for same day
    const sortedList = [...list].sort((a, b) => {
      const tA = a.transaction.transactionDate
      const tB = b.transaction.transactionDate
      const timeA = tA instanceof Date ? tA.getTime() : tA
      const timeB = tB instanceof Date ? tB.getTime() : tB
      if (timeB !== timeA) return timeB - timeA
      const createdA =
        a.transaction.createdAt instanceof Date
          ? a.transaction.createdAt.getTime()
          : a.transaction.createdAt
      const createdB =
        b.transaction.createdAt instanceof Date
          ? b.transaction.createdAt.getTime()
          : b.transaction.createdAt
      return (createdB ?? 0) - (createdA ?? 0)
    })

    const grouped: Record<
      string,
      {
        title: string
        data: TransactionWithRelations[]
        totals: Record<string, number>
      }
    > = {}

    sortedList.forEach((row) => {
      const t = row.transaction
      const dateKey = formatDateKey(t.transactionDate)
      const headerTitle = formatSectionDateTitle(t.transactionDate)

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          title: headerTitle,
          data: [],
          totals: {},
        }
      }

      grouped[dateKey].data.push(row)
      const currency = row.account.currencyCode
      const contribution = transactionContribution(t.type, t.amount)
      grouped[dateKey].totals[currency] =
        (grouped[dateKey].totals[currency] || 0) + contribution
    })

    return Object.values(grouped).sort(
      (a, b) =>
        b.data[0].transaction.transactionDate.getTime() -
        a.data[0].transaction.transactionDate.getTime(),
    )
  }, [list, formatDateKey, formatSectionDateTitle])

  const handleOnTransactionPress = useCallback(
    (transactionId: string) => {
      router.push({
        pathname: "/transaction/[id]",
        params: { id: transactionId },
      })
    },
    [router],
  )

  const handleDeleteTransaction = useCallback(
    async (transactionWithRelations: TransactionWithRelations) => {
      try {
        await deleteTransactionModel(transactionWithRelations.transaction)
        Toast.success({ title: "Moved to trash" })
      } catch {
        Toast.error({ title: "Failed to move to trash" })
      }
    },
    [],
  )

  const renderHeader = () => (
    <View style={styles.summaryContainer}>
      <SummarySection transactionsWithRelations={list} />
    </View>
  )

  const renderEmptyList = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="wallet" size={48} style={styles.emptyIcon} />
      <Text variant="default" style={styles.emptyTitle}>
        No transactions yet
      </Text>
      <Text variant="small" style={styles.emptySubtitle}>
        Transactions for this month will appear here
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
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
      </View>

      {/* Action Row - Refined with theme radius */}
      <View style={styles.actionRow}>
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
      </View>

      {/* Transactions List */}
      <SectionList
        sections={sections}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
        keyExtractor={(item) =>
          (item as TransactionWithRelations).transaction.id
        }
        renderItem={({ item }) => (
          <TransactionItem
            transactionWithRelations={item as TransactionWithRelations}
            onPress={() => handleOnTransactionPress(item.transaction.id)}
            onDelete={() =>
              handleDeleteTransaction(item as TransactionWithRelations)
            }
            onWillOpen={(methods) => {
              openSwipeableRef.current?.close()
              openSwipeableRef.current = methods
            }}
          />
        )}
        renderSectionHeader={({ section }) => {
          const s = section as unknown as {
            title: string
            data: TransactionWithRelations[]
            totals: Record<string, number>
          }
          if (!s.title && s.data.length === 0) return null
          return (
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text variant="h4" style={styles.sectionTitle}>
                  {s.title}
                </Text>
                <View style={styles.sectionDivider} />
              </View>
              <View style={styles.sectionTotalsContainer}>
                <View style={styles.totalsContainer}>
                  {Object.entries(s.totals).map(([curr, total], idx) => (
                    <Fragment key={curr + idx.toString()}>
                      <Text variant="small" style={styles.sectionTotal}>
                        {idx > 0 && "|"}
                      </Text>
                      <Money
                        variant="small"
                        style={styles.sectionTotal}
                        value={total}
                        currency={curr}
                        tone="auto"
                        visualTone="transfer"
                        showSign
                      />
                    </Fragment>
                  ))}
                </View>

                <Text variant="small" style={styles.sectionTotal}>
                  • {s.data.length} transactions
                </Text>
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

const EnhancedHomeScreen = withObservables([], () => ({
  transactionsFull: observeTransactionModelsFull(getCurrentMonthFilter(), [
    observeAccountModels(false),
    observeCategoriesByType(TransactionTypeEnum.EXPENSE),
    observeCategoriesByType(TransactionTypeEnum.INCOME),
    observeCategoriesByType(TransactionTypeEnum.TRANSFER),
  ]).pipe(startWith([] as TransactionWithRelations[])),
}))(HomeScreenInner)

export default EnhancedHomeScreen

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
  listContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  emptyState: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: theme.colors.onSecondary,
    textAlign: "center",
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
  sectionTotalsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
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
    fontSize: 12,
  },
}))
