import { withObservables } from "@nozbe/watermelondb/react"
import { useRouter } from "expo-router"
import { useCallback, useMemo, useRef, useState } from "react"
import { Alert, FlatList } from "react-native"
import type { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable"
import { StyleSheet } from "react-native-unistyles"
import { startWith } from "rxjs"

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

function TrashScreenInner({
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
          description: "Transaction permanently removed.",
        })
      })
      .catch(() => {
        Toast.error({
          title: "Error",
          description: "Failed to delete transaction.",
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
            Trash
          </Text>
          <Text variant="p" style={styles.description}>
            Tap to open. Swipe left to delete permanently.
          </Text>

          {/* Delete Modal */}
          <ConfirmModal
            visible={confirmModalVisible}
            onRequestClose={() => setConfirmModalVisible(false)}
            onConfirm={handledeleteConfirmed}
            title="Delete transaction"
            description="Are you sure you want to delete this transaction permanently?"
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
            No deleted transactions
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

const EnhancedTrashScreen = withObservables([], () => ({
  transactionsFull: observeTransactionModelsFull({
    deletedOnly: true,
  }).pipe(startWith([] as TransactionWithRelations[])),
}))(TrashScreenInner)

export default function TrashScreen() {
  return <EnhancedTrashScreen />
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
