/**
 * Reusable transaction SectionList with filtering, grouping, section headers,
 * swipe-to-delete, and optional upcoming transactions section.
 *
 * Used by both the home screen and the account detail screen.
 */

import { useRouter } from "expo-router"
import { Fragment, useCallback, useMemo, useRef } from "react"
import { SectionList } from "react-native"
import type { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable"
import { StyleSheet } from "react-native-unistyles"

import { Money } from "~/components/money"
import { TransactionItem } from "~/components/transaction/transaction-item"
import { UpcomingTransactionsSection } from "~/components/transaction/upcoming-transactions-section"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { TransactionWithRelations } from "~/database/services/transaction-service"
import { useMinuteTick } from "~/hooks/use-time-reactivity"
import { useTransfersPreferencesStore } from "~/stores/transfers-preferences.store"
import type { TransactionListFilterState } from "~/types/transaction-filters"
import { effectiveIsPending } from "~/utils/pending-transactions"
import {
  applyTransferLayout,
  buildTransactionSections,
} from "~/utils/transaction-list-utils"

export interface TransactionSectionListProps {
  /** All transactions including pending/upcoming. Used for filtering + upcoming section. */
  transactionsFull: TransactionWithRelations[]
  /** Current filter state. */
  filterState: TransactionListFilterState
  /** Whether to show the upcoming transactions section above the list. */
  showUpcoming?: boolean
  /** Additional content rendered at the top of the list (before upcoming). */
  ListHeaderComponent?: React.ComponentType<unknown> | React.ReactElement | null
}

export function TransactionSectionList({
  transactionsFull,
  filterState,
  showUpcoming = true,
  ListHeaderComponent,
}: TransactionSectionListProps) {
  const router = useRouter()
  const openSwipeableRef = useRef<SwipeableMethods | null>(null)

  const list = useMemo(() => transactionsFull ?? [], [transactionsFull])
  const tick = useMinuteTick()
  const transferLayout = useTransfersPreferencesStore((s) => s.layout)

  // Today/history sections show only CONFIRMED and not future-dated.
  // Use effective pending (date > now || isPending) so future txs never appear here.
  // Use tick (minute boundary) to derive "now" without calling Date.now() during render (React purity).
  const nowMs = tick * 60_000
  const confirmedOnly = useMemo(
    () => list.filter((r) => !effectiveIsPending(r.transaction, nowMs)),
    [list, nowMs],
  )

  const listForSections = useMemo(
    () => applyTransferLayout(confirmedOnly, transferLayout),
    [confirmedOnly, transferLayout],
  )

  const sections = useMemo(
    () => buildTransactionSections(listForSections, filterState.groupBy),
    [listForSections, filterState.groupBy],
  )

  const handleOnTransactionPress = useCallback(
    (transactionId: string) => {
      router.push({
        pathname: "/transaction/[id]",
        params: { id: transactionId },
      })
    },
    [router],
  )

  // TransactionItem handles transfer vs non-transfer delete (modal + deleteTransfer or deleteTransactionModel); we only close the swipeable.
  const handleDeleteDone = useCallback(() => {
    openSwipeableRef.current?.close()
  }, [])

  const renderHeader = useCallback(
    () => (
      <>
        {ListHeaderComponent != null &&
          (typeof ListHeaderComponent === "function" ? (
            <ListHeaderComponent />
          ) : (
            ListHeaderComponent
          ))}
        {showUpcoming && (
          <UpcomingTransactionsSection
            transactions={transactionsFull ?? []}
            onTransactionPress={handleOnTransactionPress}
          />
        )}
      </>
    ),
    [
      ListHeaderComponent,
      showUpcoming,
      transactionsFull,
      handleOnTransactionPress,
    ],
  )

  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyState}>
        <IconSymbol name="wallet" size={48} style={styles.emptyIcon} />
        <Text variant="default" style={styles.emptyTitle}>
          No transactions yet
        </Text>
        <Text variant="small" style={styles.emptySubtitle}>
          Transactions for this period will appear here
        </Text>
      </View>
    ),
    [],
  )

  return (
    <SectionList
      sections={sections}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyList}
      keyExtractor={(item) => (item as TransactionWithRelations).transaction.id}
      renderItem={({ item }) => (
        <TransactionItem
          transactionWithRelations={item as TransactionWithRelations}
          onPress={() => handleOnTransactionPress(item.transaction.id)}
          onDelete={handleDeleteDone}
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
  )
}

const styles = StyleSheet.create((theme) => ({
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
    paddingHorizontal: 20,
    marginVertical: 10,
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
    marginTop: 5,
  },
  totalsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
  },
  sectionTotal: {
    fontWeight: "700",
    color: theme.colors.onSecondary,
    fontSize: 12,
  },
}))
