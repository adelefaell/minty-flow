import { useMemo } from "react"
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { IconSymbol, type IconSymbolName } from "~/components/ui/icon-symbol"
import { Money } from "~/components/ui/money"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { Transaction } from "~/types/transactions"

interface SummarySectionProps {
  transactions: Transaction[]
}

/**
 * SummarySection component provides a unified view for transaction totals.
 * It filters transactions internally for both Income and Expense types and
 * displays them side-by-side in summary cards.
 */
export const SummarySection = ({ transactions }: SummarySectionProps) => {
  const incomeTransactions = useMemo(
    () => transactions.filter((t) => t.type === "income"),
    [transactions],
  )
  const expenseTransactions = useMemo(
    () => transactions.filter((t) => t.type === "expense"),
    [transactions],
  )

  return (
    <View style={styles.sectionContainer}>
      <Card type="income" label="Income" transactions={incomeTransactions} />
      <Card type="expense" label="Expense" transactions={expenseTransactions} />
    </View>
  )
}

interface CardProps {
  type: "income" | "expense"
  transactions: Transaction[]
  label: string
}

const Card = ({ type, transactions, label }: CardProps) => {
  const { theme } = useUnistyles()
  const isIncome = type === "income"
  const icon: IconSymbolName = isIncome ? "arrow-down" : "arrow-up"
  const colorStyle = isIncome ? styles.incomeText : styles.expenseText
  const EnteringAnimation = isIncome ? FadeInLeft : FadeInRight

  // Sum transactions by currency
  const currencyTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    transactions.forEach((t) => {
      totals[t.currency] = (totals[t.currency] || 0) + (t.amount || 0)
    })
    return Object.entries(totals).sort(([a], [b]) => a.localeCompare(b))
  }, [transactions])

  return (
    <Animated.View
      entering={EnteringAnimation.delay(50).springify().damping(15)}
      style={styles.card}
    >
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
    </Animated.View>
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
