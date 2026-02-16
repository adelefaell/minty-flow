import { useMemo } from "react"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { Money } from "~/components/money"
import { IconSymbol, type IconSymbolName } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { TransactionWithRelations } from "~/database/services/transaction-service"
import type { TransactionType } from "~/types/transactions"
import { TransactionTypeEnum } from "~/types/transactions"

interface SummarySectionProps {
  transactionsWithRelations: TransactionWithRelations[]
}

/**
 * SummarySection component provides a unified view for transaction totals.
 * Currency is derived from each transaction's account; type explains meaning.
 */
export const SummarySection = ({
  transactionsWithRelations,
}: SummarySectionProps) => {
  const incomeRows = useMemo(
    () =>
      transactionsWithRelations.filter(
        (row) => row.transaction.type === TransactionTypeEnum.INCOME,
      ),
    [transactionsWithRelations],
  )
  const expenseRows = useMemo(
    () =>
      transactionsWithRelations.filter(
        (row) => row.transaction.type === TransactionTypeEnum.EXPENSE,
      ),
    [transactionsWithRelations],
  )

  return (
    <View style={styles.sectionContainer}>
      <Card
        type={TransactionTypeEnum.INCOME}
        label="Income"
        rows={incomeRows}
      />
      <Card
        type={TransactionTypeEnum.EXPENSE}
        label="Expense"
        rows={expenseRows}
      />
    </View>
  )
}

interface CardProps {
  type: TransactionType
  rows: TransactionWithRelations[]
  label: string
}

const Card = ({ type, rows, label }: CardProps) => {
  const { theme } = useUnistyles()
  const isIncome = type === TransactionTypeEnum.INCOME
  const icon: IconSymbolName = isIncome
    ? "arrow-bottom-left"
    : "arrow-top-right"
  const colorStyle = isIncome ? styles.incomeText : styles.expenseText

  // Sum by currency (from account)
  const currencyTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    rows.forEach((row) => {
      const currency = row.account.currencyCode
      totals[currency] = (totals[currency] || 0) + (row.transaction.amount || 0)
    })
    return Object.entries(totals).sort(([a], [b]) => a.localeCompare(b))
  }, [rows])

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              isIncome ? styles.incomeBg : styles.expenseBg,
            ]}
          >
            <IconSymbol
              name={icon}
              size={12}
              color={
                isIncome
                  ? theme.colors.customColors.income
                  : theme.colors.customColors.expense
              }
            />
          </View>
          <Text variant="small" style={styles.label}>
            {label.toUpperCase()}
          </Text>
        </View>

        <View style={styles.totalsList}>
          {currencyTotals.length > 0 ? (
            currencyTotals.map(([currency, amount]) => (
              <View key={currency} style={styles.currencyRow}>
                <Text variant="small" style={styles.currencyCode}>
                  {currency}
                </Text>
                <Money
                  value={amount}
                  currency={currency}
                  style={colorStyle}
                  variant="small"
                  tone={type}
                />
              </View>
            ))
          ) : (
            <View style={styles.currencyRow}>
              <Text variant="small" style={styles.currencyCode}>
                -
              </Text>
              <Money value={0} style={colorStyle} variant="small" />
            </View>
          )}
        </View>

        {/* Subtle indicator line at bottom */}
        <View
          style={[
            styles.indicator,
            isIncome ? styles.incomeIndicator : styles.expenseIndicator,
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  sectionContainer: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: theme.colors.radius,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.customColors.semi,
    backgroundColor: theme.colors.surface,
    // minHeight: 110,
  },
  cardContent: {
    gap: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconContainer: {
    width: 20,
    height: 20,
    borderRadius: (theme.colors.radius && theme.colors.radius / 2) || 6,
    alignItems: "center",
    justifyContent: "center",
  },
  incomeBg: {
    backgroundColor: `${theme.colors.customColors.income}25`,
  },
  expenseBg: {
    backgroundColor: `${theme.colors.customColors.expense}25`,
  },
  label: {
    color: theme.colors.onSecondary,
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  totalsList: {
    gap: 4,
  },
  currencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currencyCode: {
    color: theme.colors.onSecondary,
    fontWeight: "600",
    fontSize: 12,
    opacity: 0.6,
  },
  incomeText: {
    color: theme.colors.customColors.income,
  },
  expenseText: {
    color: theme.colors.customColors.expense,
  },
  indicator: {
    height: 2,
    width: "20%",
    borderRadius: 1,
    marginTop: 4,
  },
  incomeIndicator: {
    backgroundColor: theme.colors.customColors.income,
    // opacity: 0.4,
  },
  expenseIndicator: {
    backgroundColor: theme.colors.customColors.expense,
    // opacity: 0.4,
  },
}))
