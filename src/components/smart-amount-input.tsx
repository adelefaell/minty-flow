/**
 * Smart Amount Input — Input-first amount entry with inline math.
 * - Toolbar closed: reports onChange as user types (like a normal input).
 * - Toolbar open: reports only on OK/Done (explicit calculation mode).
 * - Safe expression parser; division-by-zero and invalid expression handling.
 */

import { useCallback, useMemo, useRef, useState } from "react"
import { Keyboard, TextInput } from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { StyleSheet } from "react-native-unistyles"

import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { currencyRegistryService } from "~/services"
import { type TransactionType, TransactionTypeEnum } from "~/types/transactions"
import { CALCULATOR_CONFIG, formatDisplayValue } from "~/utils/number-format"
import {
  type ParseResult,
  parseMathExpression,
  sanitizeAmountInput,
} from "~/utils/parse-math-expression"

export interface SmartAmountInputProps {
  /** Current amount (positive number; sign is applied by parent for display) */
  value: number
  /** Called when user commits (OK or =). Pass the final number. */
  onChange: (value: number) => void
  /** Currency code for symbol and formatting */
  currencyCode?: string
  /** Error message to show below input (e.g. form validation) */
  error?: string
  /** Label above input (e.g. "AMOUNT") */
  label?: string
  /** Placeholder when empty */
  placeholder?: string
  /** Transaction type (affects currency color) */
  type?: TransactionType
  /** Decimal places for preview and display (default from CALCULATOR_CONFIG) */
  decimalPlaces?: number
}

const hasMathOperation = (text: string) => /[+\-*/]/.test(text)

const MATH_OPERATORS = ["+", "-", "*", "/"] as const

function isOperator(char: string): char is (typeof MATH_OPERATORS)[number] {
  return MATH_OPERATORS.includes(char as (typeof MATH_OPERATORS)[number])
}

export function SmartAmountInput({
  value,
  onChange,
  currencyCode,
  error,
  label = "AMOUNT",
  placeholder = "0",
  type,
  decimalPlaces = CALCULATOR_CONFIG.MAX_DECIMALS,
}: SmartAmountInputProps) {
  // const { theme } = useUnistyles()
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [showMathToolbar, setShowMathToolbar] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const currencySymbol = currencyCode
    ? currencyRegistryService.getCurrencySymbol(currencyCode)
    : "$"

  // Derived display value: editing buffer or controlled value from parent
  const displayValue = isEditing
    ? inputValue
    : value === 0
      ? ""
      : value.toString()

  // Derived preview — computed during render
  const previewResult = useMemo<ParseResult | null>(() => {
    if (!hasMathOperation(displayValue)) return null
    return parseMathExpression(displayValue)
  }, [displayValue])

  const isInMathOperation = hasMathOperation(displayValue)
  const previewValue =
    previewResult && "value" in previewResult ? previewResult.value : null
  const previewError =
    previewResult && "error" in previewResult ? previewResult.error : null

  const handleFocus = useCallback(() => {
    if (!isEditing) {
      setIsEditing(true)
      setInputValue(value === 0 ? "" : value.toString())
    }
  }, [isEditing, value])

  const handleTextChange = useCallback(
    (text: string) => {
      const sanitized = sanitizeAmountInput(text)
      if (sanitized.length <= CALCULATOR_CONFIG.MAX_DIGITS) {
        setIsEditing(true)
        setInputValue(sanitized)
        if (!showMathToolbar) {
          const numericValue = parseFloat(sanitized) || 0
          onChange(numericValue)
        }
      }
    },
    [showMathToolbar, onChange],
  )

  const handleOperatorPress = useCallback(
    (op: string) => {
      setIsEditing(true)
      setInputValue((prev) => {
        const cur = isEditing ? prev : value === 0 ? "" : value.toString()
        if (cur.length === 0) return op === "-" ? "-" : ""
        const last = cur.slice(-1)
        if (isOperator(last)) return cur.slice(0, -1) + op
        return cur + op
      })
    },
    [isEditing, value],
  )

  const handleSubmit = useCallback(() => {
    if (previewError) return
    const finalValue =
      previewValue !== null ? previewValue : parseFloat(displayValue) || 0
    onChange(finalValue)
    setIsEditing(false)
    setInputValue(finalValue === 0 ? "" : finalValue.toString())
    Keyboard.dismiss()
  }, [displayValue, previewValue, previewError, onChange])

  const handleBackspace = useCallback(() => {
    setIsEditing(true)
    setInputValue((prev) => {
      const cur = isEditing ? prev : value === 0 ? "" : value.toString()
      const newValue = cur.slice(0, -1)
      if (!showMathToolbar) {
        onChange(parseFloat(newValue) || 0)
      }
      return newValue
    })
  }, [isEditing, value, showMathToolbar, onChange])

  const handleClear = useCallback(() => {
    setIsEditing(true)
    setInputValue("")
    if (!showMathToolbar) {
      onChange(0)
    }
  }, [showMathToolbar, onChange])

  // Auto-apply valid calculation when keyboard dismissed (toolbar closed)
  const handleBlur = useCallback(() => {
    if (
      !showMathToolbar &&
      previewValue !== null &&
      !previewError &&
      isEditing
    ) {
      onChange(previewValue)
      setIsEditing(false)
      setInputValue("")
    }
  }, [showMathToolbar, previewValue, previewError, isEditing, onChange])

  // Apply calculation when user taps the preview chip (toolbar closed)
  const handlePreviewPress = useCallback(() => {
    if (previewValue !== null && !previewError) {
      onChange(previewValue)
      setIsEditing(false)
      setInputValue("")
      Keyboard.dismiss()
    }
  }, [previewValue, previewError, onChange])

  const displayPreview =
    previewValue !== null
      ? formatDisplayValue(previewValue.toFixed(decimalPlaces), {
          currency: currencyCode,
          hideSign: true,
        })
      : null

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          style={styles.calcIconBtn}
          onPress={() => setShowMathToolbar((v) => !v)}
          accessibilityLabel={
            showMathToolbar ? "Hide math actions" : "Show math actions"
          }
          accessibilityHint="Toggles inline math toolbar"
        >
          <IconSymbol name="calculator" size={24} />
        </Pressable>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.currencyWrap}>
          <Text style={styles.currencySymbol(type)} numberOfLines={1}>
            {currencySymbol}
          </Text>
        </View>
        <TextInput
          ref={inputRef}
          style={styles.mainInput}
          value={displayValue}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={styles.semiColor.color}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          textAlignVertical="center"
          accessibilityLabel="Amount input"
          accessibilityHint="Enter amount or a math expression (e.g. 100/4)"
          accessibilityValue={{ text: displayValue || placeholder }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={CALCULATOR_CONFIG.MAX_DIGITS}
        />
      </View>

      {showMathToolbar ? (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={styles.mathToolbar}
        >
          <View style={styles.mathToolbarRow}>
            {["+", "-", "*", "/"].map((op) => (
              <Pressable
                key={op}
                style={styles.mathBtn}
                onPress={() => handleOperatorPress(op)}
                accessibilityLabel={`Insert ${op === "*" ? "times" : op}`}
              >
                <Text style={styles.mathBtnText}>{op === "*" ? "×" : op}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.mathToolbarRow}>
            <Pressable
              style={styles.mathBtn}
              onPress={handleBackspace}
              accessibilityLabel="Backspace"
            >
              <IconSymbol
                name="backspace"
                size={24}
                color={styles.onSurface.color}
              />
            </Pressable>
            <Pressable
              style={styles.mathBtn}
              onPress={handleClear}
              accessibilityLabel="Clear"
            >
              <Text style={styles.mathBtnText}>C</Text>
            </Pressable>
            <Pressable
              style={[styles.mathBtn, styles.okBtn]}
              onPress={handleSubmit}
              accessibilityLabel={
                isInMathOperation ? "Apply result" : "Confirm amount"
              }
              accessibilityState={{ disabled: !!previewError }}
            >
              {isInMathOperation ? (
                <IconSymbol
                  name="equal"
                  size={24}
                  color={styles.onPrimary.color}
                />
              ) : (
                <Text style={styles.okBtnText}>OK</Text>
              )}
            </Pressable>
          </View>
        </Animated.View>
      ) : null}

      {displayPreview && !showMathToolbar ? (
        <Pressable
          style={styles.previewContainer}
          onPress={handlePreviewPress}
          accessibilityLabel="Apply calculation result"
          accessibilityHint="Tap to use this result"
        >
          <IconSymbol name="equal" size={18} style={styles.previewIconLeft} />
          <Text style={styles.previewLabel}>Result: </Text>
          <Text style={styles.previewValue}>{displayPreview}</Text>
          <IconSymbol
            name="chevron-right"
            size={16}
            color={styles.semiColor.color}
            style={styles.previewIconRight}
          />
        </Pressable>
      ) : displayPreview ? (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Result: </Text>
          <Text style={styles.previewValue}>{displayPreview}</Text>
        </View>
      ) : null}

      {previewError ? (
        <View style={[styles.previewContainer, styles.previewErrorContainer]}>
          <Text style={styles.previewError}>{previewError}</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create((t) => ({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: t.colors.surface,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    color: t.colors.customColors.semi,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 70,
    marginBottom: 10,
  },
  currencyWrap: {
    // minWidth: 64,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  currencySymbol: (type?: TransactionType) => ({
    fontSize: 30,
    lineHeight: 44,
    color:
      type === TransactionTypeEnum.EXPENSE
        ? t.colors.customColors.expense
        : type === TransactionTypeEnum.INCOME
          ? t.colors.customColors.income
          : t.colors.onSurface,
    fontWeight: "500",
  }),
  mainInput: {
    flex: 1,
    fontSize: 30,
    color: t.colors.onSurface,
    fontWeight: "bold",
    height: "100%",
    padding: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  calcIconBtn: {
    padding: 8,
    backgroundColor: `${t.colors.customColors.semi}20`,
    borderRadius: 8,
  },
  mathToolbar: {
    marginBottom: 20,
    gap: 10,
  },
  mathToolbarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mathBtn: {
    backgroundColor: `${t.colors.customColors.semi}25`,
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  mathBtnText: {
    color: t.colors.onSurface,
    fontSize: 22,
    fontWeight: "600",
  },
  okBtn: {
    backgroundColor: t.colors.primary,
    width: 80,
  },
  okBtnText: {
    color: t.colors.onPrimary,
    fontWeight: "bold",
    fontSize: 16,
  },
  previewContainer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${t.colors.customColors.semi}18`,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  previewErrorContainer: {
    backgroundColor: `${t.colors.error}20`,
  },
  previewIconLeft: {
    marginRight: 6,
  },
  previewIconRight: {
    marginLeft: 4,
  },
  previewLabel: {
    color: t.colors.customColors.semi,
    fontSize: 14,
  },
  previewValue: {
    color: t.colors.onSurface,
    fontSize: 16,
    fontWeight: "bold",
  },
  previewError: {
    color: t.colors.error,
    fontSize: 14,
    fontWeight: "500",
  },
  fieldError: {
    color: t.colors.error,
    fontSize: 12,
    marginTop: 6,
  },
  semiColor: {
    color: t.colors.customColors.semi,
  },
  onSurface: {
    color: t.colors.onSurface,
  },
  onPrimary: {
    color: t.colors.onPrimary,
  },
}))
