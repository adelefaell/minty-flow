import { type FC, useMemo } from "react"
import type { StyleProp, TextStyle } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Text, type TextVariant } from "~/components/ui/text"
import { useMoneyFormattingStore } from "~/stores/money-formatting.store"
import { formatDisplayValue } from "~/utils/number-format"

export interface MoneyProps {
  value: string | number
  currency?: string
  locale?: string
  compact?: boolean
  hideSign?: boolean
  showSign?: boolean
  hideSymbol?: boolean
  tone?: "auto" | "income" | "expense" | "neutral"
  style?: StyleProp<TextStyle>
  addParentheses?: boolean
  disablePrivacyMode?: boolean
  variant?: TextVariant
}

export const Money: FC<MoneyProps> = ({
  value,
  currency,
  locale,
  compact = false,
  hideSign = false,
  showSign = false,
  hideSymbol = false,
  tone = "neutral",
  style,
  addParentheses = false,
  disablePrivacyMode = false,
  variant = "p",
}) => {
  const stringValue = typeof value === "number" ? value.toString() : value

  // 1. Get unified privacy state and look preference
  const privacyModeActive = useMoneyFormattingStore((s) => s.privacyMode)
  const currencyLook = useMoneyFormattingStore((s) => s.currencyLook)

  // 2. Format the Money
  const formatted = useMemo(() => {
    try {
      return formatDisplayValue(stringValue || "0", {
        currency,
        currencyDisplay: currencyLook,
        locale,
        compact,
        hideSign,
        showSign,
        hideSymbol,
        addParentheses,
      })
    } catch {
      return formatDisplayValue(stringValue || "0", {
        locale,
        compact,
        hideSign,
        showSign,
      })
    }
  }, [
    stringValue,
    currency,
    compact,
    hideSign,
    showSign,
    hideSymbol,
    currencyLook,
    locale,
    addParentheses,
  ])

  // 3. Create the mask
  const privacyMasked = useMemo(() => {
    // Replaces only digits with ⁕, keeping symbols like $, €, or commas intact
    return formatted.replace(/\d/g, "⁕")
  }, [formatted])

  // 4. Final Logic: Use the unified boolean from our store
  const shouldHide = !disablePrivacyMode && privacyModeActive

  const signedAmount =
    typeof stringValue === "string" ? Number.parseFloat(stringValue || "0") : 0

  // Handle tone coloring
  const resolvedTone =
    tone === "auto"
      ? signedAmount < 0
        ? "expense"
        : signedAmount > 0
          ? "income"
          : "neutral"
      : tone

  const toneStyles =
    resolvedTone === "income"
      ? styles.income
      : resolvedTone === "expense"
        ? styles.expense
        : styles.neutral

  return (
    <Text variant={variant} style={[style, toneStyles, { fontWeight: "600" }]}>
      {shouldHide ? privacyMasked : formatted}
    </Text>
  )
}

const styles = StyleSheet.create((theme) => ({
  neutral: {
    color: theme.colors.onSurface,
  },
  income: {
    color: theme.colors.customColors.income,
  },
  expense: {
    color: theme.colors.customColors.expense,
  },
}))
