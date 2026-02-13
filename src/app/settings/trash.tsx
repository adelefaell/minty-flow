import { withObservables } from "@nozbe/watermelondb/react"
import { useRouter } from "expo-router"
import { useCallback, useMemo, useRef } from "react"
import { SectionList } from "react-native"
import type { SwipeableMethods } from "react-native-gesture-handler/lib/typescript/components/ReanimatedSwipeable"
import { StyleSheet } from "react-native-unistyles"

import { TransactionItem } from "~/components/transaction/transaction-item"
import {
  destroyTransactionModel,
  observeTransactionModelsFull,
  type TransactionWithRelations,
} from "~/database/services"
import { useTimeUtils } from "~/hooks/use-time-utils"
import { type TransactionType, TransactionTypeEnum } from "~/types/transactions"
import { Toast } from "~/utils/toast"

function transactionContribution(
  type: TransactionType,
  amount: number,
): number {
  if (type === TransactionTypeEnum.INCOME) return amount
  if (type === TransactionTypeEnum.EXPENSE) return -amount
  return 0
}

interface TrashBinScreenProps {
  transactionsFull?: TransactionWithRelations[] | null
}

function TrashScreen({ transactionsFull = [] }: TrashBinScreenProps) {
  const list = transactionsFull ?? []
  const router = useRouter()
  const { formatDateKey, formatSectionDateTitle } = useTimeUtils()
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

  // TODO: header for the trash list (as from the flow app)
  const renderHeader = () => null

  // TODO: content when the there is no deleted transaction
  const renderEmptyList = () => null

  // TODO: handle on click on trash list logic
  const handleOnTransactionPress = useCallback(
    (transactionId: string) => {
      router.push({
        pathname: "/transaction/[id]",
        params: { id: transactionId },
      })
    },
    [router],
  )

  // TODO: handle on delete on trash list logic
  const handleDeleteTransaction = useCallback(
    async (transactionWithRelations: TransactionWithRelations) => {
      try {
        await destroyTransactionModel(transactionWithRelations.transaction)
        Toast.success({ title: "Removed" })
      } catch {
        Toast.error({ title: "Failed to move to trash" })
      }
    },
    [],
  )

  // TODO: handle on revert transaction

  return (
    <SectionList
      style={styles.container}
      sections={sections}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyList}
      keyExtractor={(item) => (item as TransactionWithRelations).transaction.id}
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
      // renderSectionHeader={({ section }) => {
      //   const s = section as unknown as {
      //     title: string
      //     data: TransactionWithRelations[]
      //     totals: Record<string, number>
      //   }
      //   if (!s.title && s.data.length === 0) return null
      //   return (
      //     <View style={styles.sectionHeader}>
      //       <View style={styles.sectionTitleRow}>
      //         <Text variant="h4" style={styles.sectionTitle}>
      //           {s.title}
      //         </Text>
      //         <View style={styles.sectionDivider} />
      //       </View>
      //       <View style={styles.sectionTotalsContainer}>
      //         <View style={styles.totalsContainer}>
      //           {Object.entries(s.totals).map(([curr, total], idx) => (
      //             <Fragment key={curr + idx.toString()}>
      //               <Text variant="small" style={styles.sectionTotal}>
      //                 {idx > 0 && "|"}
      //               </Text>
      //               <Money
      //                 variant="small"
      //                 style={styles.sectionTotal}
      //                 value={total}
      //                 currency={curr}
      //                 tone="auto"
      //                 visualTone="transfer"
      //                 showSign
      //               />
      //             </Fragment>
      //           ))}
      //         </View>

      //         <Text variant="small" style={styles.sectionTotal}>
      //           • {s.data.length} transactions
      //         </Text>
      //       </View>
      //     </View>
      //   )
      // }}
      contentContainerStyle={styles.listContent}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  )
}

export default withObservables([], () => ({
  transactionsFull: observeTransactionModelsFull({ onlyDeleted: true }),
}))(TrashScreen)

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: theme.colors.onSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  placeholder: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
  },
  placeholderText: {
    fontSize: 14,
    color: theme.colors.onSecondary,
  },
  listContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
}))
