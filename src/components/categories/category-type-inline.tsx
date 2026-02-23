/**
 * Inline category/transaction type selector: trigger row + expandable panel.
 * Reusable; trigger and panel styles live here (same pattern as ColorVariantInline).
 */

import { useState } from "react"
import { View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { useScrollIntoView } from "~/hooks/use-scroll-into-view"
import type { TransactionType } from "~/types/transactions"
import { TransactionTypeEnum } from "~/types/transactions"

const TYPE_OPTIONS: { type: TransactionType; label: string }[] = [
  { type: TransactionTypeEnum.EXPENSE, label: "Expense" },
  { type: TransactionTypeEnum.INCOME, label: "Income" },
  { type: TransactionTypeEnum.TRANSFER, label: "Transfer" },
]

export interface CategoryTypeInlineProps {
  /** Currently selected type. */
  selectedType: TransactionType
  /** Called when user selects a type (select and close). */
  onTypeSelected: (type: TransactionType) => void
  /** When false, the row is not tappable and no chevron is shown (e.g. edit mode). */
  editable?: boolean
}

export function CategoryTypeInline({
  selectedType,
  onTypeSelected,
  editable = true,
}: CategoryTypeInlineProps) {
  const { wrapperRef, scrollIntoView } = useScrollIntoView()
  const [expanded, setExpanded] = useState(false)

  const handleToggle = () => {
    if (!editable) return

    setExpanded((v) => {
      const next = !v
      if (next) scrollIntoView()
      return next
    })
  }

  const handleSelect = (type: TransactionType) => {
    onTypeSelected(type)

    setExpanded(false)
  }

  const displayLabel =
    selectedType.charAt(0).toUpperCase() + selectedType.slice(1)

  return (
    <View ref={wrapperRef} style={styles.wrapper}>
      <Pressable
        style={styles.triggerRow}
        onPress={handleToggle}
        disabled={!editable}
      >
        <View style={styles.triggerLeft}>
          <IconSymbol name="shape" size={24} />
          <Text variant="default" style={styles.triggerLabel}>
            Type
          </Text>
        </View>
        <View style={styles.triggerRight}>
          <Text variant="default" style={styles.triggerValue}>
            {displayLabel}
          </Text>
          {editable && (
            <IconSymbol
              name={expanded ? "chevron-up" : "chevron-right"}
              size={20}
              style={styles.chevronIcon}
            />
          )}
        </View>
      </Pressable>

      {editable && expanded && (
        <View style={styles.panel}>
          {TYPE_OPTIONS.map((t) => (
            <Pressable
              key={t.type}
              style={[
                styles.option,
                selectedType === t.type && styles.optionActive,
              ]}
              onPress={() => handleSelect(t.type)}
            >
              <Text
                variant="default"
                style={[
                  styles.optionText,
                  selectedType === t.type && styles.optionTextActive,
                ]}
              >
                {t.label}
              </Text>
              {selectedType === t.type && (
                <IconSymbol name="check" size={20} style={styles.optionCheck} />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    width: "100%",
  },
  triggerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  triggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  triggerLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  triggerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  triggerValue: {
    fontSize: 16,
    color: theme.colors.onSecondary,
    opacity: 0.7,
  },
  chevronIcon: {
    color: theme.colors.onSecondary,
    opacity: 0.4,
  },
  panel: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: 10,
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: theme.colors.radius,
    backgroundColor: `${theme.colors.onSurface}10`,
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionActive: {
    backgroundColor: `${theme.colors.primary}20`,
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  optionTextActive: {
    fontWeight: "600",
    color: theme.colors.primary,
  },
  optionCheck: {
    color: theme.colors.primary,
  },
}))
