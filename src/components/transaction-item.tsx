import { format } from "date-fns"
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
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
  index?: number // For staggered animations
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const TransactionItem = ({
  transaction,
  onPress,
  index = 0,
}: TransactionItemProps) => {
  // Shared value for press animation
  const scale = useSharedValue(1)

  // Animated style for press feedback
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      damping: 15,
      stiffness: 400,
    })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    })
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 20)
        .springify()
        .damping(18)
        .stiffness(120)}
    >
      <AnimatedPressable
        style={[styles.container, animatedContainerStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.leftSection}>
          {/* TODO: Use proper color from the account or the category relation */}
          <DynamicIcon icon={"shopping"} size={20} />

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
          {transaction.isPending && (
            <Text style={styles.pendingBadge}>Pending</Text>
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 20,
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
