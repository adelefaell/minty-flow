import { useCallback } from "react"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { IconSymbol } from "~/components/ui/icon-symbol"
import { currencyRegistryService } from "~/services"
import { useCalculatorStore } from "~/stores/calculator.store"
import { useMoneyFormattingStore } from "~/stores/money-formatting.store"
import { Operation } from "~/types/calculator"
import { formatDisplayValue } from "~/utils/number-format"

import {
  BottomSheetModalComponent,
  type BottomSheetModalProps,
} from "./bottom-sheet"
import { Pressable } from "./ui/pressable"
import { Text } from "./ui/text"
import { View } from "./ui/view"

interface CalculatorSheetProps
  extends Omit<BottomSheetModalProps, "children" | "id"> {
  /** Unique identifier for this calculator sheet */
  id: string
  /** Callback when the submit button is pressed */
  onSubmit?: (value: number) => void
  /** Initial value for the calculator */
  initialValue?: number
  /** Title to display at the top (default: "Expense") */
  title?: string
  /** Currency code to use for formatting (if not provided, uses store default) */
  currencyCode?: string
}

/**
 * Calculator Bottom Sheet Component
 *
 * A full-featured calculator presented as a bottom sheet with numeric keypad,
 * backspace, calculator operations, and submit functionality.
 */
export const CalculatorSheet = ({
  id,
  onSubmit,
  initialValue,
  title = "Expense",
  currencyCode,
  onDismiss,
  ...bottomSheetProps
}: CalculatorSheetProps) => {
  const {
    display,
    inputNumber,
    inputDecimal,
    backspace,
    toggleSign,
    clear,
    calculateResult,
    performOperation,
    reset,
    operation,
    previousValue,
    waitingForOperand,
    hasActiveOperation,
  } = useCalculatorStore()

  const preferredCurrency = useMoneyFormattingStore((s) => s.preferredCurrency)
  const currencyLook = useMoneyFormattingStore((s) => s.currencyLook)

  const { theme } = useUnistyles()

  // Helper to check if an operation is currently active
  const isOperationActive = useCallback(
    (op: Operation) => operation === op,
    [operation],
  )

  // Format the display value with currency
  // Ensure we always have a valid display value
  const displayValue = display || "0"

  // One-liner: The store handles privacy, currency look, and locale.
  const formattedDisplay = formatDisplayValue(displayValue, {
    currency: currencyCode, // If undefined, the store uses preferredCurrency automatically
  })

  // Handle number input
  const handleNumberPress = useCallback(
    (num: string) => {
      inputNumber(num)
    },
    [inputNumber],
  )

  // Handle decimal input
  const handleDecimalPress = useCallback(() => {
    inputDecimal()
  }, [inputDecimal])

  // Handle backspace
  const handleBackspace = useCallback(() => {
    backspace()
  }, [backspace])

  // Handle toggle sign
  const handleToggleSign = useCallback(() => {
    toggleSign()
  }, [toggleSign])

  // Handle equals (calculate and submit)
  const handleEquals = useCallback(() => {
    // Calculate result if there's an active operation
    if (hasActiveOperation()) {
      calculateResult()
      // After calculation, don't submit yet - wait for check icon press
      return
    }
    // If no active operation, submit the current value
    const value = useCalculatorStore.getState().getCurrentValue()
    onSubmit?.(value)
  }, [onSubmit, calculateResult, hasActiveOperation])

  // Handle dismiss - reset calculator
  const handleDismiss = useCallback(() => {
    if (initialValue !== undefined) {
      reset(initialValue)
    } else {
      reset(0)
    }
    onDismiss?.()
  }, [onDismiss, initialValue, reset])

  // Initialize calculator when sheet opens
  const handleSheetChange = useCallback(
    (index: number) => {
      if (index >= 0 && initialValue !== undefined) {
        // Sheet is opening, reset with initial value
        reset(initialValue)
      }
      bottomSheetProps.onChange?.(index)
    },
    [initialValue, reset, bottomSheetProps.onChange],
  )

  const code = "USD"

  const usdCurrency = currencyRegistryService.getCurrencyByCode(code)

  return (
    <BottomSheetModalComponent
      id={id}
      onDismiss={handleDismiss}
      onChange={handleSheetChange}
      {...bottomSheetProps}
    >
      <View style={calculatorStyles.container}>
        {/* Header */}
        <View style={calculatorStyles.header}>
          <Text style={calculatorStyles.title}>{title}</Text>
        </View>

        {/* Display */}
        <View style={calculatorStyles.displayContainer}>
          <Text style={calculatorStyles.displayValue}>
            {operation && previousValue !== null ? (
              <>
                {formatDisplayValue(previousValue, {
                  currency:
                    currencyCode || preferredCurrency || usdCurrency?.code,
                  currencyDisplay: currencyLook,
                })}{" "}
                {operation}{" "}
                {waitingForOperand
                  ? "?"
                  : formatDisplayValue(displayValue, {
                      currency:
                        currencyCode || preferredCurrency || usdCurrency?.code,
                      currencyDisplay: currencyLook,
                    })}
              </>
            ) : (
              formattedDisplay
            )}
          </Text>
        </View>

        {/* Keypad - 4 columns, 5 rows */}
        <View style={calculatorStyles.keypadContainer}>
          {/* Row 1 - C, +/-, %, ÷ */}
          <View style={calculatorStyles.keypadRow}>
            <Pressable style={calculatorStyles.keypadButton} onPress={clear}>
              <IconSymbol name="eraser" size={24} />
            </Pressable>
            <Pressable
              style={calculatorStyles.keypadButton}
              onPress={handleToggleSign}
            >
              <IconSymbol name="plus-minus-variant" size={24} />
            </Pressable>
            <Pressable
              style={[
                calculatorStyles.keypadButton,
                isOperationActive(Operation.PERCENT) &&
                  calculatorStyles.hasActiveOperation,
              ]}
              onPress={() => performOperation(Operation.PERCENT)}
            >
              <IconSymbol
                name="percent"
                size={24}
                color={
                  isOperationActive(Operation.PERCENT)
                    ? theme.colors.onPrimary
                    : undefined
                }
              />
            </Pressable>
            <Pressable
              style={[
                calculatorStyles.keypadButton,
                isOperationActive(Operation.DIVIDE) &&
                  calculatorStyles.hasActiveOperation,
              ]}
              onPress={() => performOperation(Operation.DIVIDE)}
            >
              <IconSymbol
                name="division"
                size={24}
                color={
                  isOperationActive(Operation.DIVIDE)
                    ? theme.colors.onPrimary
                    : undefined
                }
              />
            </Pressable>
          </View>

          {/* Row 2 - 7, 8, 9, × */}
          <View style={calculatorStyles.keypadRow}>
            <Pressable
              style={calculatorStyles.keypadButton}
              onPress={() => handleNumberPress("7")}
            >
              <Text style={calculatorStyles.keypadButtonText}>7</Text>
            </Pressable>
            <Pressable
              style={calculatorStyles.keypadButton}
              onPress={() => handleNumberPress("8")}
            >
              <Text style={calculatorStyles.keypadButtonText}>8</Text>
            </Pressable>
            <Pressable
              style={calculatorStyles.keypadButton}
              onPress={() => handleNumberPress("9")}
            >
              <Text style={calculatorStyles.keypadButtonText}>9</Text>
            </Pressable>
            <Pressable
              style={[
                calculatorStyles.keypadButton,
                isOperationActive(Operation.MULTIPLY) &&
                  calculatorStyles.hasActiveOperation,
              ]}
              onPress={() => performOperation(Operation.MULTIPLY)}
            >
              <IconSymbol
                name="close"
                size={24}
                color={
                  isOperationActive(Operation.MULTIPLY)
                    ? theme.colors.onPrimary
                    : undefined
                }
              />
            </Pressable>
          </View>

          {/* Row 3 - 4, 5, 6, - */}
          <View style={calculatorStyles.keypadRow}>
            <Pressable
              style={calculatorStyles.keypadButton}
              onPress={() => handleNumberPress("4")}
            >
              <Text style={calculatorStyles.keypadButtonText}>4</Text>
            </Pressable>
            <Pressable
              style={calculatorStyles.keypadButton}
              onPress={() => handleNumberPress("5")}
            >
              <Text style={calculatorStyles.keypadButtonText}>5</Text>
            </Pressable>
            <Pressable
              style={calculatorStyles.keypadButton}
              onPress={() => handleNumberPress("6")}
            >
              <Text style={calculatorStyles.keypadButtonText}>6</Text>
            </Pressable>
            <Pressable
              style={[
                calculatorStyles.keypadButton,
                isOperationActive(Operation.MINUS) &&
                  calculatorStyles.hasActiveOperation,
              ]}
              onPress={() => performOperation(Operation.MINUS)}
            >
              <IconSymbol
                name="minus"
                size={24}
                color={
                  isOperationActive(Operation.MINUS)
                    ? theme.colors.onPrimary
                    : undefined
                }
              />
            </Pressable>
          </View>

          {/* Row 4 - 1, 2, 3, + */}
          <View style={calculatorStyles.keypadRow}>
            <Pressable
              style={calculatorStyles.keypadButton}
              onPress={() => handleNumberPress("1")}
            >
              <Text style={calculatorStyles.keypadButtonText}>1</Text>
            </Pressable>
            <Pressable
              style={calculatorStyles.keypadButton}
              onPress={() => handleNumberPress("2")}
            >
              <Text style={calculatorStyles.keypadButtonText}>2</Text>
            </Pressable>
            <Pressable
              style={calculatorStyles.keypadButton}
              onPress={() => handleNumberPress("3")}
            >
              <Text style={calculatorStyles.keypadButtonText}>3</Text>
            </Pressable>
            <Pressable
              style={[
                calculatorStyles.keypadButton,
                isOperationActive(Operation.PLUS) &&
                  calculatorStyles.hasActiveOperation,
              ]}
              onPress={() => performOperation(Operation.PLUS)}
            >
              <IconSymbol
                name="plus"
                size={24}
                color={
                  isOperationActive(Operation.PLUS)
                    ? theme.colors.onPrimary
                    : undefined
                }
              />
            </Pressable>
          </View>

          {/* Row 5 - , (decimal), 0, ⌫ (backspace), = (equals) */}
          <View style={calculatorStyles.keypadRow}>
            <Pressable
              style={calculatorStyles.keypadButton}
              onPress={handleDecimalPress}
            >
              <Text style={calculatorStyles.keypadButtonText}>.</Text>
            </Pressable>
            <Pressable
              style={calculatorStyles.keypadButton}
              onPress={() => handleNumberPress("0")}
            >
              <Text style={calculatorStyles.keypadButtonText}>0</Text>
            </Pressable>
            <Pressable
              style={calculatorStyles.keypadButton}
              onPress={handleBackspace}
              onLongPress={clear}
            >
              <IconSymbol name="backspace" size={24} />
            </Pressable>
            <Pressable
              style={[
                calculatorStyles.keypadButton,
                !hasActiveOperation() && calculatorStyles.hasActiveOperation,
              ]}
              onPress={handleEquals}
            >
              {hasActiveOperation() ? (
                <IconSymbol name="equal" size={24} />
              ) : (
                <IconSymbol
                  name="check"
                  size={24}
                  color={theme.colors.onPrimary}
                />
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </BottomSheetModalComponent>
  )
}

// Styles for the calculator
const calculatorStyles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  displayContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 24,
    paddingBottom: 24,
  },
  displayValue: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  keypadContainer: {
    gap: 6,
  },
  keypadRow: {
    flexDirection: "row",
    gap: 6,
  },
  keypadButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  keypadButtonText: {
    color: theme.colors.onSecondary,
    fontSize: 24,
    fontWeight: "600",
  },
  hasActiveOperation: {
    backgroundColor: theme.colors.primary,
  },
  actionsContainer: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
}))
