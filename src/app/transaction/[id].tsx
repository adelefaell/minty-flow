/**
 * Transaction editor — create or edit a transaction.
 * Uses the same pattern as accounts/[accountId]/modify and
 * settings/categories/[categoryId]/modify: withObservables for
 * reactive data, no useEffect for loading transaction or tag IDs.
 */

import { withObservables } from "@nozbe/watermelondb/react"
import { useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { TransactionFormV3 } from "~/components/transaction/transaction-form-v3"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type TransactionModel from "~/database/models/Transaction"
import { observeAccounts } from "~/database/services/account-service"
import { observeCategoriesByType } from "~/database/services/category-service"
import { observeTags } from "~/database/services/tag-service"
import {
  observeTransactionModelById,
  observeTransactionTagIds,
} from "~/database/services/transaction-service"
import { NewEnum } from "~/types/new"
import { type TransactionType, TransactionTypeEnum } from "~/types/transactions"

const VALID_TYPES: TransactionType[] = [
  TransactionTypeEnum.EXPENSE,
  TransactionTypeEnum.INCOME,
  TransactionTypeEnum.TRANSFER,
]

function parseTransactionType(type: string | undefined): TransactionType {
  if (type && VALID_TYPES.includes(type as TransactionType)) {
    return type as TransactionType
  }
  return TransactionTypeEnum.EXPENSE
}

const EnhancedTransactionForm = withObservables(
  ["transactionType"],
  ({ transactionType }: { transactionType: TransactionType }) => ({
    accounts: observeAccounts(),
    categories: observeCategoriesByType(transactionType),
    tags: observeTags(),
  }),
)(TransactionFormV3)

interface TransactionEditorProps {
  transaction: TransactionModel | null
  initialType?: TransactionType
  initialTagIds: string[]
}

function TransactionEditor({
  transaction,
  initialType,
  initialTagIds,
}: TransactionEditorProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>(
    transaction?.type ?? initialType ?? TransactionTypeEnum.EXPENSE,
  )

  return (
    <EnhancedTransactionForm
      transaction={transaction}
      transactionType={transactionType}
      onTransactionTypeChange={setTransactionType}
      initialTagIds={initialTagIds}
    />
  )
}

interface EditTransactionScreenProps {
  transactionId: string
  transaction?: TransactionModel
  initialTagIds?: string[]
}

const EnhancedEditTransactionScreen = withObservables(
  ["transactionId"],
  ({ transactionId }: { transactionId: string }) => ({
    transaction: observeTransactionModelById(transactionId),
    initialTagIds: observeTransactionTagIds(transactionId),
  }),
)(function EditTransactionScreenInner({
  transaction,
  initialTagIds = [],
}: EditTransactionScreenProps) {
  const { theme } = useUnistyles()

  if (!transaction) {
    return (
      <View
        style={[
          styles.container,
          { flex: 1, backgroundColor: theme.colors.surface },
        ]}
      >
        <View style={styles.loadingContainer}>
          <Text variant="default">Loading transaction...</Text>
        </View>
      </View>
    )
  }

  return (
    <TransactionEditor
      key={transaction.id}
      transaction={transaction}
      initialTagIds={initialTagIds}
    />
  )
})

export default function TransactionScreen() {
  const { id, type: typeParam } = useLocalSearchParams<{
    id: string
    type?: string
  }>()
  const isNew = id === NewEnum.NEW
  const initialType = parseTransactionType(typeParam)

  if (isNew) {
    return (
      <TransactionEditor
        transaction={null}
        initialType={initialType}
        initialTagIds={[]}
      />
    )
  }

  const transactionId = id ?? ""
  if (!transactionId) return null

  return <EnhancedEditTransactionScreen transactionId={transactionId} />
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
}))
