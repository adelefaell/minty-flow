import { withObservables } from "@nozbe/watermelondb/react"
import { startWith } from "@nozbe/watermelondb/utils/rx"
import { useRouter } from "expo-router"
import { useCallback, useMemo, useRef, useState } from "react"
import { FlatList } from "react-native"
import type { SwipeableMethods } from "react-native-gesture-handler/lib/typescript/components/ReanimatedSwipeable"
import { StyleSheet } from "react-native-unistyles"

import { ConfirmModal } from "~/components/confirm-modal"
import { TransactionItem } from "~/components/transaction/transaction-item"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import {
  destroyTransactionModel,
  observeTransactionModelsFull,
  type TransactionWithRelations,
} from "~/database/services/transaction-service"
import { Toast } from "~/utils/toast"

function PendingTransactionsScreen({
  transactionsFull = [],
}: {
  transactionsFull: TransactionWithRelations[]
}) {
  const router = useRouter()
  const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false)
  const [toRemoveItem, setToRemoveItem] =
    useState<TransactionWithRelations | null>(null)
  const openSwipeableRef = useRef<SwipeableMethods | null>(null)

  const sorted = useMemo(
    () =>
      [...transactionsFull].sort(
        (a, b) =>
          b.transaction.updatedAt.getTime() - a.transaction.updatedAt.getTime(),
      ),
    [transactionsFull],
  )

  const handlePress = useCallback(
    (item: TransactionWithRelations) => () => {
      router.push(`/transaction/${item.transaction.id}`)
    },
    [router],
  )

  const handledeleteConfirmed = useCallback(() => {
    if (!toRemoveItem) return
    destroyTransactionModel(toRemoveItem.transaction)
      .then(() => {
        Toast.success({
          title: "Deleted",
          description: "Transaction removed.",
        })
      })
      .catch(() => {
        Toast.error({
          title: "Error",
          description: "Failed to remove transaction.",
        })
      })
  }, [toRemoveItem])

  const handleDestroy = useCallback(
    (item: TransactionWithRelations) => () => {
      setToRemoveItem(item)
      setConfirmModalVisible(true)
    },
    [],
  )

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        sorted.length === 0 && styles.contentEmpty,
      ]}
      ListHeaderComponent={
        <>
          <Text variant="h2" style={styles.title}>
            Pending Transactions
          </Text>
          <Text variant="p" style={styles.description}>
            View and manage your pending transactions. Review scheduled payments
            and transactions that are waiting to be processed.
          </Text>

          {/* Delete Modal */}
          <ConfirmModal
            visible={confirmModalVisible}
            onRequestClose={() => setConfirmModalVisible(false)}
            onConfirm={handledeleteConfirmed}
            title="Delete transaction"
            description="Are you sure you want to move this transaction to the trash bin?"
            confirmLabel="Delete"
            cancelLabel="Cancel"
            variant="destructive"
            icon="trash-can"
          />
        </>
      }
      ListEmptyComponent={
        <View style={styles.placeholder}>
          <Text variant="small" style={styles.placeholderText}>
            No pending transactions
          </Text>
        </View>
      }
      data={sorted}
      keyExtractor={(item) => item.transaction.id}
      renderItem={({ item }) => (
        <TransactionItem
          transactionWithRelations={item}
          onPress={handlePress(item)}
          onDelete={handleDestroy(item)}
          onWillOpen={(methods) => {
            openSwipeableRef.current?.close()
            openSwipeableRef.current = methods
          }}
          rightActionAccessibilityLabel="Delete permanently"
        />
      )}
    />
  )
}

const EnhancedPendingTransactionsScreen = withObservables([], () => ({
  transactionsFull: observeTransactionModelsFull({
    isPending: true,
  }).pipe(startWith([] as TransactionWithRelations[])),
}))(PendingTransactionsScreen)

export default function TrashScreen() {
  return <EnhancedPendingTransactionsScreen />
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  contentEmpty: {
    flexGrow: 1,
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
