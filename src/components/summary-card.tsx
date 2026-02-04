import { StyleSheet } from "react-native-unistyles"

import { IconSymbol, type IconSymbolName } from "~/components/ui/icon-symbol"
import { Money } from "~/components/ui/money"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

interface SummaryCardProps {
  type: "income" | "expense"
  amount: number
  currency: string
  label: string
}

export const SummaryCard = ({
  type,
  amount,
  currency,
  label,
}: SummaryCardProps) => {
  const isIncome = type === "income"
  const icon: IconSymbolName = isIncome ? "arrow-down" : "arrow-up" // Based on image: Income has arrow down (in), Expense arrow up (out) - Wait, usually income is up? Image shows Income arrow DOWN (green), Expense arrow UP (red). Following image.
  const colorStyle = isIncome ? styles.income : styles.expense

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text variant="small" style={styles.label}>
          {label}
        </Text>
        <IconSymbol
          name={icon}
          size={16}
          color={isIncome ? "#4CAF50" : "#F44336"} // Hardcoding colors for now to match image vibe, should use theme
        />
      </View>
      <Money
        value={amount}
        currency={currency}
        style={[styles.amount, colorStyle]}
        variant="h3"
      />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface, // Or a slightly different card bg
    borderRadius: 16, // Rounded corners as per image
    padding: 16,
    // Add shadow or border if needed, image looks like dark mode cards
    borderWidth: 1,
    borderColor: theme.colors.customColors.semi,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  label: {
    color: theme.colors.onSecondary,
    fontWeight: "500",
  },
  amount: {
    fontWeight: "bold",
  },
  income: {
    color: theme.colors.customColors.income, // Ensure strict theme config or usage
  },
  expense: {
    color: theme.colors.customColors.expense,
  },
}))
