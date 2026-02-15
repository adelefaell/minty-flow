import { useRef } from "react"
import Swipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable"
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { Money } from "~/components/money"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { TransactionWithRelations } from "~/database/services/transaction-service"
import { useIsConfirmable } from "~/hooks/use-time-reactivity"
import { useTimeUtils } from "~/hooks/use-time-utils"
import { usePendingTransactionsStore } from "~/stores/pending-transactions.store"

import { DynamicIcon } from "../dynamic-icon"

const TRASH_ACTION_WIDTH = 100

export type TransactionItemVariant = "default" | "upcoming"

interface TransactionItemProps {
  transactionWithRelations: TransactionWithRelations
  onPress?: () => void
  onDelete?: () => void
  onConfirm?: () => void
  onWillOpen?: (methods: SwipeableMethods) => void
  rightActionAccessibilityLabel?: string
  variant?: TransactionItemVariant
}

function RightAction({
  progress,
  onTrashPress,
  accessibilityLabel = "Move to trash",
}: {
  progress: SharedValue<number>
  translation: SharedValue<number> // required by Swipeable renderRightActions signature
  onTrashPress: () => void
  accessibilityLabel?: string
}) {
  const iconStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0.5, 1], "clamp")
    const opacity = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0, 0.5, 1],
      "clamp",
    )
    return {
      transform: [{ scale }],
      opacity,
    }
  })

  return (
    <View style={rightActionStyles.container}>
      <Pressable
        style={rightActionStyles.pressable}
        onPress={onTrashPress}
        accessibilityLabel={accessibilityLabel}
      >
        <Animated.View style={iconStyle}>
          <IconSymbol
            name="trash-can"
            size={24}
            color={rightActionStyles.trashIcon.color}
          />
        </Animated.View>
      </Pressable>
    </View>
  )
}

const rightActionStyles = StyleSheet.create((theme) => ({
  container: {
    width: TRASH_ACTION_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.error,
  },
  pressable: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  trashIcon: {
    color: theme.colors.onError,
  },
}))

export const TransactionItem = ({
  transactionWithRelations,
  onPress,
  onDelete,
  onConfirm,
  onWillOpen,
  rightActionAccessibilityLabel,
  variant = "default",
}: TransactionItemProps) => {
  const swipeableRef = useRef<SwipeableMethods | null>(null)
  const { formatReadableTime, formatFriendlyDate } = useTimeUtils()
  const { theme } = useUnistyles()
  const { transaction, account, category } = transactionWithRelations
  const icon = category?.icon
  const colorScheme = category?.colorScheme ?? account.colorScheme

  const globalRequireConfirmation = usePendingTransactionsStore(
    (s) => s.requireConfirmation,
  )
  const requireConfirmation =
    transaction.requiresManualConfirmation ?? globalRequireConfirmation

  const isUpcoming = variant === "upcoming"
  const isConfirmable = useIsConfirmable(transaction)
  const isAutoRecurring = Boolean(transaction.extra?.recurringId)

  // Only two badges: Recurring and Pending
  const showRecurringBadge = isUpcoming && isAutoRecurring
  const showPendingBadge = isUpcoming && !isAutoRecurring

  const renderRightActions = (
    progress: SharedValue<number>,
    translation: SharedValue<number>,
    swipeableMethods: { close: () => void },
  ) => (
    <RightAction
      progress={progress}
      translation={translation}
      onTrashPress={() => {
        onDelete?.()
        swipeableMethods.close()
      }}
      accessibilityLabel={rightActionAccessibilityLabel}
    />
  )

  const content = (
    <View style={styles.container}>
      <Pressable style={styles.mainTouchable} onPress={onPress}>
        <View style={styles.leftSection}>
          <DynamicIcon
            icon={icon}
            size={20}
            colorScheme={colorScheme}
            variant="badge"
          />

          <View style={styles.details}>
            <Text variant="small" style={styles.title} numberOfLines={1}>
              {transaction.title}
            </Text>
            <View style={styles.subtitleRow}>
              <Text style={styles.subtitle} numberOfLines={1}>
                {account.name}
                {isUpcoming
                  ? ` · ${formatFriendlyDate(transaction.transactionDate)}, ${formatReadableTime(transaction.transactionDate)}`
                  : ` · ${formatReadableTime(transaction.transactionDate)}`}
              </Text>

              {/* Recurring badge */}
              {/* {showRecurringBadge && (
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: `${theme.colors.customColors.info}18`,
                    },
                  ]}
                >
                  <IconSymbol
                    name="calendar-sync"
                    size={12}
                    color={theme.colors.customColors.info}
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: theme.colors.customColors.info },
                    ]}
                  >
                    Recurring
                  </Text>
                </View>
              )} */}

              {/* Pending badge */}
              {/* {showPendingBadge && (
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: `${theme.colors.customColors.warning}18`,
                    },
                  ]}
                >
                  <IconSymbol
                    name="progress-clock"
                    size={12}
                    color={theme.colors.customColors.warning}
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: theme.colors.customColors.warning },
                    ]}
                  >
                    Pending
                  </Text>
                </View>
              )} */}
            </View>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Money
            value={transaction.amount}
            currency={account.currencyCode}
            tone={transaction.type}
            native
          />

          {/* Recurring badge */}
          {showRecurringBadge && (
            <View
              style={[
                styles.statusBadge,
                // {
                //   backgroundColor: `${theme.colors.customColors.info}18`,
                // },
              ]}
            >
              <IconSymbol
                name="calendar-sync"
                size={12}
                color={theme.colors.customColors.info}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: theme.colors.customColors.info },
                ]}
              >
                Recurring
              </Text>
            </View>
          )}

          {/* Pending badge */}
          {showPendingBadge && (
            <View
              style={[
                styles.statusBadge,
                // {
                //   backgroundColor: `${theme.colors.customColors.warning}18`,
                // },
              ]}
            >
              <IconSymbol
                name="progress-clock"
                size={12}
                color={theme.colors.customColors.warning}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: theme.colors.customColors.warning },
                ]}
              >
                Pending
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Manual confirm button - only show if manual confirmation required */}
      {isUpcoming && isConfirmable && requireConfirmation && onConfirm && (
        <Pressable
          style={[
            styles.confirmButton,
            {
              backgroundColor: theme.colors.customColors.success,
            },
          ]}
          onPress={onConfirm}
          accessibilityLabel="Confirm transaction"
          accessibilityRole="button"
        >
          <IconSymbol name="check" size={18} color={theme.colors.onError} />
        </Pressable>
      )}
    </View>
  )

  if (onDelete == null) {
    return content
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={1}
      rightThreshold={TRASH_ACTION_WIDTH / 2}
      overshootRight={false}
      containerStyle={[
        styles.swipeableContainer,
        { backgroundColor: theme.colors.error },
      ]}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={() => {
        const methods = swipeableRef.current
        if (methods) onWillOpen?.(methods)
      }}
    >
      {content}
    </Swipeable>
  )
}

const styles = StyleSheet.create((theme) => ({
  swipeableContainer: {
    overflow: "hidden",
  },
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: theme.colors.surface,
  },
  mainTouchable: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  subtitle: {
    color: theme.colors.onSecondary,
    fontSize: 12,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    // paddingHorizontal: 6,
    // paddingVertical: 2,
    // borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  confirmButton: {
    // minWidth: 44,
    paddingHorizontal: 14,
    // marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
}))
