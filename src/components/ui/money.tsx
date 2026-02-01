import { type FC, useMemo } from "react"
import type { StyleProp, TextStyle } from "react-native"

// import { StyleSheet } from "react-native-unistyles"

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
  // tone?: "auto" | "income" | "expense" | "neutral"
  style?: StyleProp<TextStyle>
  addParentheses?: boolean
  disablePrivacyMode?: boolean
  variant?: TextVariant
}

/**
 * React Native Money component
 */
export const Money: FC<MoneyProps> = ({
  value,
  currency,
  locale,
  compact = false,
  hideSign = false,
  showSign = false,
  hideSymbol = false,
  // tone = "auto",
  style,
  addParentheses = false,
  disablePrivacyMode = false,
  variant = "p",
}) => {
  const stringValue = typeof value === "number" ? value.toString() : value

  // const num = Number.parseFloat(stringValue || "0")
  const privacyMode = useMoneyFormattingStore((s) => s.privacyMode)
  const currencyLook = useMoneyFormattingStore((s) => s.currencyLook)

  // Format the Money
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
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    } catch {
      return formatDisplayValue(stringValue || "0", {
        locale,
        compact,
        hideSign,
        showSign,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
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

  const privacyMasked = useMemo(() => {
    return formatted.replace(/\d/g, "⁕")
  }, [formatted])

  // const resolvedTone =
  //   tone === "auto"
  //     ? num < 0
  //       ? "expense"
  //       : num > 0
  //         ? "income"
  //         : "neutral"
  //     : tone

  // const textColorStyle: TextStyle =
  //   resolvedTone === "income"
  //     ? { color: styles.income.color } // green
  //     : resolvedTone === "expense"
  //       ? { color: styles.expense.color } // red
  //       : { color: styles.default.color } // default

  return (
    <Text variant={variant} style={style}>
      {disablePrivacyMode ? formatted : privacyMode ? privacyMasked : formatted}
    </Text>
  )
}

// const styles = StyleSheet.create((theme) => ({
//   default: {
//     color: theme.colors.onSurface,
//   },
//   income: {
//     color: theme.colors.customColors.income,
//   },
//   expense: {
//     color: theme.colors.customColors.expense,
//   },
// }))
