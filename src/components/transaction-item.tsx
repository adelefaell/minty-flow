import { format } from "date-fns"
import { StyleSheet } from "react-native-unistyles"

import { Money } from "~/components/ui/money"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { Transaction } from "~/types/transactions"

import { DynamicIcon } from "./dynamic-icon"

interface TransactionItemProps {
  transaction: Transaction
  onPress?: () => void
}

export const TransactionItem = ({
  transaction,
  onPress,
}: TransactionItemProps) => {
  // TODO: Get category icon and color properly.

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          {/* TODO: Use proper color from the account or the category relation */}
          <DynamicIcon icon={"shopping"} />
        </View>
        <View style={styles.details}>
          <Text variant="default" style={styles.title} numberOfLines={1}>
            {transaction.title || "Untitled Transaction"}
          </Text>
          <Text variant="small" style={styles.subtitle} numberOfLines={1}>
            {/* Creating a subtitle string: Account check • Time */}
            {transaction.accountId ? "Wallet" : "Cash"} •{" "}
            {format(new Date(transaction.transactionDate), "h:mm a")}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Money
          value={transaction.amount}
          currency={transaction.currency}
          tone="auto"
        />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary, // Or a lighter shade of the icon color
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  subtitle: {
    color: theme.colors.onSecondary,
  },
  rightSection: {
    alignItems: "flex-end",
  },
}))
