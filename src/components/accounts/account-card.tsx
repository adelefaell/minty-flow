import { useRouter } from "expo-router"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { IconSymbol } from "~/components/ui/icon-symbol"
import type { Account } from "~/types/accounts"

import { DynamicIcon } from "../dynamic-icon"
import { Money } from "../ui/money"
import { Pressable } from "../ui/pressable"
import { Text } from "../ui/text"
import { View } from "../ui/view"

interface AccountCardProps {
  account: Account
  isReorderMode: boolean
}

export const AccountCard = ({ account, isReorderMode }: AccountCardProps) => {
  const router = useRouter()

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

  const isArchived = account.isArchived
  return (
    <Pressable
      style={[styles.card, isArchived && styles.archivedCard]}
      onPress={handleViewAccount}
    >
      <View variant="muted" style={styles.cardHeader}>
        <DynamicIcon
          icon={account.icon}
          size={48}
          variant="raw"
          colorScheme={account.colorScheme}
        />
        <View variant="muted" style={styles.accountInfo}>
          <View variant="muted" style={styles.accountNameRow}>
            <Text variant="h3" style={styles.accountName}>
              {account.name}
            </Text>
            {isArchived && (
              <IconSymbol
                name="archive"
                size={16}
                color={theme.colors.customColors.semi}
              />
            )}
          </View>
          <Text variant="small" style={styles.accountType}>
            {account.type}{" "}
            {account.isPrimary && (
              <>
                • <IconSymbol name="star" size={14} />
              </>
            )}
          </Text>
        </View>

        <Money
          value={account.balance}
          variant="h2"
          style={styles.balance}
          currency={account.currencyCode}
        />
      </View>

      {!isArchived && (
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

              <Money
                value={0}
                variant="default"
                style={[styles.summaryAmount, styles.incomeAmount]}
                currency={account.currencyCode}
              />
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

              <Money
                value={0}
                variant="default"
                style={[styles.summaryAmount, styles.expenseAmount]}
                currency={account.currencyCode}
              />
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

              <Money
                value={0}
                variant="default"
                style={styles.summaryAmount}
                currency={account.currencyCode}
              />
            </View>
          </View>
        </View>
      )}
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
  archivedCard: {
    borderStyle: "dashed",
    borderColor: theme.colors.customColors.semi,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  accountInfo: {
    flex: 1,
    gap: 2,
  },
  accountNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
