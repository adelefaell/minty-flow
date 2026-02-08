import { StyleSheet } from "react-native-unistyles"

import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { TransactionType } from "~/types/transactions"

interface TransactionTypeSelectorProps {
  value: TransactionType
  onChange: (type: TransactionType) => void
}

const TYPE_CONFIG: Record<TransactionType, { label: string }> = {
  expense: { label: "Expense" },
  income: { label: "Income" },
  transfer: { label: "Transfer" },
}

const TYPES: TransactionType[] = ["expense", "income", "transfer"]

export const TransactionTypeSelector = ({
  value,
  onChange,
}: TransactionTypeSelectorProps) => {
  return (
    <View style={styles.segmented}>
      {TYPES.map((type) => {
        const config = TYPE_CONFIG[type]
        const isSelected = value === type
        return (
          <Pressable
            key={type}
            onPress={() => onChange(type)}
            style={[styles.segment, isSelected && styles.active]}
          >
            <Text
              style={[styles.segmentLabel, isSelected && styles.activeText]}
            >
              {config.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  segmented: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
    padding: 4,
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.secondary,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.colors.radius,
  },

  segmentLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.onSecondary,
  },

  active: {
    backgroundColor: theme.colors.primary,
  },
  activeText: {
    color: theme.colors.onPrimary,
  },
}))
