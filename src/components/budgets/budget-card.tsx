import { withObservables } from "@nozbe/watermelondb/react"
import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { View as RNView } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { DynamicIcon } from "~/components/dynamic-icon"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { observeBudgetSpent } from "~/database/services/budget-service"
import { observeCategoryNamesByIds } from "~/database/services/category-service"
import type { TranslationKey } from "~/i18n/config"
import type { Budget } from "~/types/budgets"
import { Toast } from "~/utils/toast"

interface BudgetCardInnerProps {
  budget: Budget
  onPress: () => void
  spentAmount: number
  categoryNames: string[]
}

/**
 * Displays a single budget with its progress bar, spent/remaining amounts,
 * period chip, and category label.
 */
function BudgetCardInner({
  budget,
  onPress,
  spentAmount,
  categoryNames,
}: BudgetCardInnerProps) {
  const { t } = useTranslation()
  const { theme } = useUnistyles()

  const spent = spentAmount
  const limit = budget.amount

  const hasAlertedRef = useRef(false)

  useEffect(() => {
    if (!budget.alertThreshold || hasAlertedRef.current || limit <= 0) return
    if (spent / limit >= budget.alertThreshold / 100) {
      hasAlertedRef.current = true
      Toast.show({
        type: "info",
        title: budget.name,
        description: t(
          "screens.settings.budgets.card.alertThresholdReached" as TranslationKey,
        ),
      })
    }
  }, [spent, limit, budget.alertThreshold, budget.name, t])
  const ratio = limit > 0 ? Math.min(spent / limit, 1) : 0
  const isOverBudget = spent > limit
  const remaining = limit - spent

  const progressColor = isOverBudget
    ? theme.colors.customColors.expense
    : theme.colors.primary

  const periodKey =
    `screens.settings.budgets.periods.${budget.period}` as TranslationKey

  const formatAmount = (amount: number) =>
    `${budget.currencyCode} ${Math.abs(amount).toFixed(2)}`

  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button">
      {/* Row 1: icon + name + category chip / period chip */}
      <View style={styles.row1}>
        <View style={styles.row1Left}>
          <DynamicIcon
            icon={budget.icon}
            colorScheme={budget.colorScheme}
            size={20}
          />
          <View style={styles.nameContainer}>
            <Text variant="default" style={styles.name} numberOfLines={1}>
              {budget.name}
            </Text>
            <Text
              variant="small"
              style={styles.categoryLabel}
              numberOfLines={1}
            >
              {categoryNames.length > 0
                ? categoryNames.join(", ")
                : t(
                    "screens.settings.budgets.card.noCategory" as TranslationKey,
                  )}
            </Text>
          </View>
        </View>
        <View style={styles.row1Right}>
          <View style={styles.periodBadge}>
            <Text variant="small" style={styles.periodText}>
              {t(periodKey)}
            </Text>
          </View>
        </View>
      </View>

      {/* Row 2: Progress bar */}
      <View style={styles.progressTrack}>
        <RNView
          style={[
            styles.progressFill,
            {
              width: `${(ratio * 100).toFixed(1)}%` as `${number}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>

      {/* Row 3: spent label and remaining label */}
      <View style={styles.row3}>
        <Text variant="small" style={styles.spentLabel}>
          {`${t("screens.settings.budgets.card.spent" as TranslationKey)}: ${formatAmount(spent)} ${t("screens.settings.budgets.card.of" as TranslationKey)} ${formatAmount(limit)}`}
        </Text>
        <Text
          variant="small"
          style={[
            styles.remainingLabel,
            isOverBudget && { color: theme.colors.customColors.expense },
          ]}
        >
          {isOverBudget
            ? `${t("screens.settings.budgets.card.overBudget" as TranslationKey)} ${formatAmount(Math.abs(remaining))}`
            : `${formatAmount(remaining)} ${t("screens.settings.budgets.card.remaining" as TranslationKey)}`}
        </Text>
      </View>
    </Pressable>
  )
}

export const BudgetCard = withObservables(
  ["budget"],
  ({ budget }: { budget: Budget }) => ({
    spentAmount: observeBudgetSpent(
      budget.accountIds,
      budget.categoryIds,
      budget.period,
      budget.startDate.getTime(),
      budget.endDate?.getTime() ?? null,
    ),
    categoryNames: observeCategoryNamesByIds(budget.categoryIds),
  }),
)(BudgetCardInner)

const styles = StyleSheet.create((t) => ({
  card: {
    backgroundColor: t.colors.secondary,
    borderRadius: t.radius,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  row1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  row1Left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  nameContainer: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontWeight: "600",
    color: t.colors.onSurface,
    fontSize: 15,
  },
  categoryLabel: {
    color: t.colors.onSecondary,
    fontSize: 12,
    opacity: 0.7,
  },
  row1Right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  periodBadge: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  periodText: {
    fontSize: 11,
    color: t.colors.onSecondary,
    fontWeight: "600",
  },
  progressTrack: {
    height: 6,
    backgroundColor: t.colors.surface,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  row3: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  spentLabel: {
    color: t.colors.onSecondary,
    fontSize: 12,
    flex: 1,
  },
  remainingLabel: {
    color: t.colors.primary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
  },
}))
