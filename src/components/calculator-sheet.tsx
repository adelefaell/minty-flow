import { useCallback, useState } from "react"
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
    clear,
    calculateResult,
    performOperation,
    reset,
    operation,
    previousValue,
    waitingForOperand,
    hasActiveOperation,
  } = useCalculatorStore()

  const [isFullCalculator, setIsFullCalculator] = useState(false)

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
    setIsFullCalculator(false)
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
      if (index >= 0) {
        if (initialValue !== undefined) {
          reset(initialValue)
        }
        setIsFullCalculator(false)
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
        {/* Keypad: simple numpad or full calculator */}
        <View style={calculatorStyles.keypadContainer}>
          {!isFullCalculator ? (
            /* Simple numpad: 7-9,4-6 + backspace (2 rows), 1-3 + calculator, 0 wide + . + check */
            <>
              <View style={calculatorStyles.keypadBackspaceBlock}>
                <View style={calculatorStyles.keypadColumn}>
                  <View style={calculatorStyles.keypadRow}>
                    {(["7", "8", "9"] as const).map((num) => (
                      <Pressable
                        key={num}
                        style={calculatorStyles.keypadButton}
                        onPress={() => handleNumberPress(num)}
                      >
                        <Text style={calculatorStyles.keypadButtonText}>
                          {num}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={calculatorStyles.keypadRow}>
                    {(["4", "5", "6"] as const).map((num) => (
                      <Pressable
                        key={num}
                        style={calculatorStyles.keypadButton}
                        onPress={() => handleNumberPress(num)}
                      >
                        <Text style={calculatorStyles.keypadButtonText}>
                          {num}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <Pressable
                  style={[
                    calculatorStyles.keypadButton,
                    calculatorStyles.keypadButtonSpanTwoRows,
                  ]}
                  onPress={handleBackspace}
                  onLongPress={clear}
                >
                  <IconSymbol name="backspace" size={24} />
                </Pressable>
              </View>
              <View style={calculatorStyles.keypadRow}>
                {(["1", "2", "3"] as const).map((num) => (
                  <Pressable
                    key={num}
                    style={calculatorStyles.keypadButton}
                    onPress={() => handleNumberPress(num)}
                  >
                    <Text style={calculatorStyles.keypadButtonText}>{num}</Text>
                  </Pressable>
                ))}
                <Pressable
                  style={calculatorStyles.keypadButton}
                  onPress={() => setIsFullCalculator(true)}
                >
                  <IconSymbol name="calculator" size={24} />
                </Pressable>
              </View>
              <View style={calculatorStyles.keypadRow}>
                <Pressable
                  style={[
                    calculatorStyles.keypadButton,
                    calculatorStyles.keypadButtonWide,
                  ]}
                  onPress={() => handleNumberPress("0")}
                >
                  <Text style={calculatorStyles.keypadButtonText}>0</Text>
                </Pressable>
                <Pressable
                  style={calculatorStyles.keypadButton}
                  onPress={handleDecimalPress}
                >
                  <Text style={calculatorStyles.keypadButtonText}>.</Text>
                </Pressable>
                <Pressable
                  style={[
                    calculatorStyles.keypadButton,
                    calculatorStyles.keypadButtonSubmit,
                  ]}
                  onPress={handleEquals}
                >
                  <IconSymbol
                    name="check"
                    size={24}
                    color={theme.colors.onPrimary}
                  />
                </Pressable>
              </View>
            </>
          ) : (
            /* Full calculator: C, backspace, %, ÷ | 7,8,9,× | 4,5,6,+ (tall) | 1,2,3,- | 0 wide, ., = */
            <>
              <View style={calculatorStyles.keypadRow}>
                <Pressable
                  style={calculatorStyles.keypadButton}
                  onPress={clear}
                >
                  <Text style={calculatorStyles.keypadButtonText}>C</Text>
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
              <View style={calculatorStyles.keypadRowWithOperator}>
                <View style={calculatorStyles.keypadColumn}>
                  <View style={calculatorStyles.keypadRow}>
                    {(["7", "8", "9"] as const).map((num) => (
                      <Pressable
                        key={num}
                        style={calculatorStyles.keypadButton}
                        onPress={() => handleNumberPress(num)}
                      >
                        <Text style={calculatorStyles.keypadButtonText}>
                          {num}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={calculatorStyles.keypadRow}>
                    {(["4", "5", "6"] as const).map((num) => (
                      <Pressable
                        key={num}
                        style={calculatorStyles.keypadButton}
                        onPress={() => handleNumberPress(num)}
                      >
                        <Text style={calculatorStyles.keypadButtonText}>
                          {num}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={calculatorStyles.keypadRow}>
                    {(["1", "2", "3"] as const).map((num) => (
                      <Pressable
                        key={num}
                        style={calculatorStyles.keypadButton}
                        onPress={() => handleNumberPress(num)}
                      >
                        <Text style={calculatorStyles.keypadButtonText}>
                          {num}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <View style={calculatorStyles.keypadOperatorColumn}>
                  <Pressable
                    style={[
                      calculatorStyles.keypadButton,
                      calculatorStyles.keypadButtonOperator,
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
                  <Pressable
                    style={[
                      calculatorStyles.keypadButton,
                      calculatorStyles.keypadButtonOperator,
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
                  <Pressable
                    style={[
                      calculatorStyles.keypadButton,
                      calculatorStyles.keypadButtonOperator,
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
              </View>
              <View
                style={[
                  calculatorStyles.keypadRow,
                  calculatorStyles.keypadRowBottom,
                ]}
              >
                <Pressable
                  style={[
                    calculatorStyles.keypadButton,
                    calculatorStyles.keypadButtonWide,
                  ]}
                  onPress={() => handleNumberPress("0")}
                >
                  <Text style={calculatorStyles.keypadButtonText}>0</Text>
                </Pressable>
                <Pressable
                  style={calculatorStyles.keypadButton}
                  onPress={handleDecimalPress}
                >
                  <Text style={calculatorStyles.keypadButtonText}>.</Text>
                </Pressable>
                <Pressable
                  style={[
                    calculatorStyles.keypadButton,
                    calculatorStyles.keypadButtonSubmitTall,
                    !hasActiveOperation() &&
                      calculatorStyles.keypadButtonSubmit,
                    hasActiveOperation() && calculatorStyles.hasActiveOperation,
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
            </>
          )}
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
    overflow: "hidden",
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
    flex: 1,
    gap: 6,
    minHeight: 280,
  },
  keypadRow: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
  },
  keypadButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  keypadButtonPlaceholder: {
    flex: 1,
    aspectRatio: 1,
  },
  keypadButtonSpanTwoRows: {
    flex: 1,
    alignSelf: "stretch",
    aspectRatio: undefined,
  },
  keypadBackspaceBlock: {
    flexDirection: "row",
    gap: 6,
    flex: 2,
  },
  keypadButtonWide: {
    flex: 2,
    aspectRatio: undefined,
  },
  keypadButtonSubmit: {
    backgroundColor: theme.colors.primary,
  },
  keypadButtonSubmitTall: {
    flex: 1,
    aspectRatio: undefined,
  },
  keypadButtonOperator: {
    flex: 1,
    aspectRatio: undefined,
  },
  keypadRowWithOperator: {
    flexDirection: "row",
    gap: 6,
    flex: 3,
  },
  keypadRowBottom: {
    flex: 1,
  },
  keypadColumn: {
    flex: 3,
    gap: 6,
  },
  keypadOperatorColumn: {
    flex: 1,
    gap: 6,
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
