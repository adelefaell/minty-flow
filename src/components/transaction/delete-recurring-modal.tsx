/**
 * DeleteRecurringModal
 *
 * Shows 3 options when deleting a transaction that belongs to a recurring rule:
 *   1. This transaction   — soft-delete only this instance
 *   2. All transactions   — soft-delete rule + all instances
 *   3. This and future    — soft-delete rule + instances from this date onward
 */

import { useCallback, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  StyleSheet as UnistylesSheet,
  useUnistyles,
} from "react-native-unistyles"

import { IconSymbol } from "~/components/ui/icon-symbol"
import type RecurringTransactionModel from "~/database/models/recurring-transaction"
import type TransactionModel from "~/database/models/transaction"
import { disableRecurringRule } from "~/database/services/recurring-transaction-service"
import {
  deleteAllRecurringInstances,
  deleteFutureRecurringInstances,
  deleteTransactionModel,
} from "~/database/services/transaction-service"
import { autoConfirmationService } from "~/services/auto-confirmation-service"
import { logger } from "~/utils/logger"
import { Toast } from "~/utils/toast"

type DeleteScope = "this" | "all" | "this_and_future"

interface DeleteRecurringModalProps {
  visible: boolean
  transaction: TransactionModel
  recurringRule: RecurringTransactionModel
  onRequestClose: () => void
  onDeleted: () => void
}

interface OptionRowProps {
  label: string
  sublabel: string
  onPress: () => void
  loading: boolean
  isLast?: boolean
  isDestructive?: boolean
}

function OptionRow({
  label,
  sublabel,
  onPress,
  loading,
  isLast,
  isDestructive,
}: OptionRowProps) {
  const { theme } = useUnistyles()
  const chevronColor = isDestructive
    ? theme.colors.error
    : theme.colors.onSecondary
  return (
    <Pressable
      style={({ pressed }) => [
        styles.optionRow,
        !isLast && styles.optionRowBorder,
        pressed && styles.optionRowPressed,
      ]}
      onPress={onPress}
      disabled={loading}
      android_ripple={{ color: theme.colors.rippleColor }}
    >
      <View style={styles.optionRowContent}>
        <Text
          style={[
            styles.optionLabel,
            isDestructive && styles.optionLabelDestructive,
          ]}
        >
          {label}
        </Text>
        <Text style={styles.optionSublabel}>{sublabel}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.error} />
      ) : (
        <IconSymbol
          name="chevron-right"
          size={20}
          color={chevronColor}
          style={styles.optionChevron}
        />
      )}
    </Pressable>
  )
}

export function DeleteRecurringModal({
  visible,
  transaction,
  recurringRule,
  onRequestClose,
  onDeleted,
}: DeleteRecurringModalProps) {
  const [loadingScope, setLoadingScope] = useState<DeleteScope | null>(null)
  const { width } = useWindowDimensions()
  const maxCardWidth = Math.min(width - 48, 400)
  const { theme } = useUnistyles()

  const CONFIRM_MESSAGE =
    "This action will delete all related transactions, and stop new transactions from being created. Recovering the transactions from trash bin wouldn't cause it to create new transactions."

  const performDelete = useCallback(
    async (scope: DeleteScope) => {
      if (loadingScope) return
      setLoadingScope(scope)
      autoConfirmationService.cancelSchedule(transaction.id)

      try {
        switch (scope) {
          case "this": {
            await deleteTransactionModel(transaction)
            Toast.success({ title: "Transaction deleted" })
            break
          }

          case "all": {
            await deleteAllRecurringInstances(recurringRule.id)
            await disableRecurringRule(recurringRule.id)
            Toast.success({ title: "All recurring transactions deleted" })
            break
          }

          case "this_and_future": {
            await deleteFutureRecurringInstances(
              recurringRule.id,
              transaction.transactionDate,
            )
            await disableRecurringRule(recurringRule.id)
            Toast.success({ title: "This and future transactions deleted" })
            break
          }
        }

        onRequestClose()
        onDeleted()
      } catch (error) {
        logger.error("DeleteRecurringModal: failed to delete", {
          scope,
          error: error instanceof Error ? error.message : String(error),
        })
        Toast.error({ title: "Failed to delete transaction" })
      }
      setLoadingScope(null)
    },
    [loadingScope, transaction, recurringRule, onRequestClose, onDeleted],
  )

  const handleDelete = useCallback(
    (scope: DeleteScope) => {
      if (scope === "all" || scope === "this_and_future") {
        Alert.alert("Are you sure?", CONFIRM_MESSAGE, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => performDelete(scope),
          },
        ])
      } else {
        void performDelete(scope)
      }
    },
    [performDelete],
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onRequestClose}
      accessibilityViewIsModal
    >
      <Pressable
        style={[styles.backdrop, { width }]}
        onPress={onRequestClose}
        accessibilityLabel="Close"
        accessibilityRole="button"
      >
        <TouchableWithoutFeedback onPress={() => {}}>
          <SafeAreaView
            style={[
              styles.card,
              {
                maxWidth: maxCardWidth,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.colors.radius ?? 16,
              },
            ]}
            pointerEvents="box-none"
          >
            <View style={styles.header}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: `${theme.colors.error}20` },
                ]}
              >
                <IconSymbol
                  name="trash-can"
                  size={24}
                  color={theme.colors.error}
                />
              </View>
              <Text style={styles.title}>Delete recurring transaction</Text>
              <Text style={styles.subtitle}>
                Choose which transactions to remove
              </Text>
            </View>

            <View style={styles.optionsCard}>
              <OptionRow
                label="This transaction"
                sublabel="Only remove this occurrence"
                onPress={() => handleDelete("this")}
                loading={loadingScope === "this"}
                isDestructive
              />
              <OptionRow
                label="All transactions"
                sublabel="Remove every occurrence, past and future"
                onPress={() => handleDelete("all")}
                loading={loadingScope === "all"}
                isDestructive
              />
              <OptionRow
                label="This and future transactions"
                sublabel="Keep the past, remove from here onward"
                onPress={() => handleDelete("this_and_future")}
                loading={loadingScope === "this_and_future"}
                isLast
                isDestructive
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.cancelButtonPressed,
              ]}
              onPress={onRequestClose}
              disabled={!!loadingScope}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </Pressable>
    </Modal>
  )
}

const styles = UnistylesSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
    color: theme.colors.onSurface,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: theme.colors.onSecondary,
  },
  optionsCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    backgroundColor: `${theme.colors.onSurface}08`,
    borderColor: `${theme.colors.onSurface}12`,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  optionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.onSurface}12`,
  },
  optionRowPressed: { opacity: 0.7 },
  optionRowContent: { flex: 1, gap: 2 },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
    color: theme.colors.onSurface,
  },
  optionLabelDestructive: { color: theme.colors.error },
  optionSublabel: {
    fontSize: 13,
    fontWeight: "400",
    color: theme.colors.onSecondary,
  },
  optionChevron: { marginLeft: 8 },
  cancelButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: `${theme.colors.onSurface}08`,
    borderColor: `${theme.colors.onSurface}12`,
  },
  cancelButtonPressed: { opacity: 0.7 },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
}))
