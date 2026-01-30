import { useRouter } from "expo-router"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { IconSymbol } from "~/components/ui/icon-symbol"
import { useMoneyFormattingStore } from "~/stores/money-formatting.store"
import type { Account } from "~/types/accounts"

import { DynamicIcon } from "../dynamic-icon"
import { Pressable } from "../ui/pressable"
import { Text } from "../ui/text"
import { View } from "../ui/view"

interface AccountCardProps {
  account: Account
  isReorderMode: boolean
}

export const AccountCard = ({ account, isReorderMode }: AccountCardProps) => {
  const router = useRouter()

  const formatDisplay = useMoneyFormattingStore((s) => s.formatDisplay)
  const { theme } = useUnistyles()

  const handleViewAccount = () => {
    if (!isReorderMode) {
      router.push({
        pathname: "/accounts/[accountId]",
        params: {
          accountId: account.id,
        },
      })
    }
  }
  return (
    <Pressable style={styles.card} onPress={handleViewAccount}>
      <View variant="muted" style={styles.cardHeader}>
        <DynamicIcon
          icon={account.icon}
          size={28}
          colorScheme={account.colorScheme}
        />
        <View variant="muted" style={styles.accountInfo}>
          <Text variant="h3" style={styles.accountName}>
            {account.name}
          </Text>
          <Text variant="small" style={styles.accountType}>
            {account.type}
          </Text>
        </View>
        <Text variant="h2" style={styles.balance}>
          {formatDisplay(account.balance.toString(), account.currencyCode)}
        </Text>
      </View>

      <View variant="muted" style={styles.monthlySummary}>
        <Text variant="small" style={styles.summaryLabel}>
          THIS MONTH
        </Text>
        <View variant="muted" style={styles.summaryRow}>
          <View variant="muted" style={styles.summaryItem}>
            <View variant="muted" style={styles.summaryItemHeader}>
              <IconSymbol
                name="arrow-down"
                size={12}
                color={theme.colors.customColors.income}
              />
              <Text style={styles.summaryItemLabel}>IN</Text>
            </View>
            <Text
              variant="default"
              style={[styles.summaryAmount, styles.incomeAmount]}
            >
              {formatDisplay("0", account.currencyCode)}
            </Text>
          </View>
          <View variant="muted" style={styles.summaryItem}>
            <View variant="muted" style={styles.summaryItemHeader}>
              <IconSymbol
                name="arrow-up"
                size={12}
                color={theme.colors.customColors.expense}
              />
              <Text style={styles.summaryItemLabel}>OUT</Text>
            </View>
            <Text
              variant="default"
              style={[styles.summaryAmount, styles.expenseAmount]}
            >
              {formatDisplay("0", account.currencyCode)}
            </Text>
          </View>
          <View variant="muted" style={styles.summaryItem}>
            <View variant="muted" style={styles.summaryItemHeader}>
              <IconSymbol
                name="chart-timeline-variant"
                size={12}
                color={theme.colors.customColors.semi}
              />
              <Text style={styles.summaryItemLabel}>NET</Text>
            </View>
            <Text variant="default" style={styles.summaryAmount}>
              {formatDisplay("0", account.currencyCode)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  accountInfo: {
    flex: 1,
    gap: 2,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSecondary,
  },
  accountType: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.customColors.semi,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  balance: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.onSecondary,
  },
  monthlySummary: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.customColors.semi}30`,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.customColors.semi,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    gap: 4,
  },
  summaryItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  summaryItemLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.customColors.semi,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSecondary,
  },
  incomeAmount: {
    color: theme.colors.customColors.income,
  },
  expenseAmount: {
    color: theme.colors.customColors.expense,
  },
}))
