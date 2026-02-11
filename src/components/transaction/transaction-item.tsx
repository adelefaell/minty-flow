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
import { useTimeUtils } from "~/hooks/use-time-utils"

import { DynamicIcon } from "../dynamic-icon"

/**
 * The only caveat (edge case)
 * If TRASH_ACTION_WIDTH ever becomes dynamic:
 * const TRASH_ACTION_WIDTH = Dimensions.get("window").width * 0.3
 */
const TRASH_ACTION_WIDTH = 100

interface TransactionItemProps {
  transactionWithRelations: TransactionWithRelations
  onPress?: () => void
  onDelete?: () => void
  /** Called before this row opens; use to close the previously open row (single-open coordination). */
  onWillOpen?: (methods: SwipeableMethods) => void
}

function RightAction({
  progress,
  onTrashPress,
}: {
  progress: SharedValue<number>
  translation: SharedValue<number>
  onTrashPress: () => void
}) {
  // Animate the icon scale and opacity only (no container translate — keeps icon visible and tappable)
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
        accessibilityLabel="Move to trash"
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
  onWillOpen,
}: TransactionItemProps) => {
  const swipeableRef = useRef<SwipeableMethods | null>(null)
  const { formatReadableTime } = useTimeUtils()
  const { theme } = useUnistyles()
  const { transaction, account, category } = transactionWithRelations
  const icon = category?.icon
  const colorScheme = category?.colorScheme ?? account.colorScheme

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
    />
  )

  const content = (
    <Pressable style={styles.container} onPress={onPress}>
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
          <Text style={styles.subtitle} numberOfLines={1}>
            {account.name} {category?.name ? `• ${category.name} ` : null}
            {`• ${formatReadableTime(transaction.transactionDate)}`}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Money
          value={transaction.amount}
          currency={account.currencyCode}
          tone={transaction.type}
          native
        />
        {transaction.isPending && (
          <Text style={styles.pendingBadge}>Pending</Text>
        )}
      </View>
    </Pressable>
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
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.surface, // Slides over the red background
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
  subtitle: {
    color: theme.colors.onSecondary,
    fontSize: 12,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  pendingBadge: {
    color: theme.colors.customColors.warning,
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
  },
}))
