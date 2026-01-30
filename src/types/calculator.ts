/**
 * Calculator operation types.
 */
export enum Operation {
  /** Addition operation */
  PLUS = "+",
  /** Subtraction operation */
  MINUS = "-",
  /** Multiplication operation */
  MULTIPLY = "×",
  /** Division operation */
  DIVIDE = "÷",
  /** Percentage operation */
  PERCENT = "%",
}

/**
 * Calculator state interface.
 */
export interface CalculatorState {
  /** Current display value as string */
  display: string
  /** Current input value as number */
  inputValue: number
  /** Previous value for operations */
  previousValue: number | null
  /** Current operation being performed */
  operation: Operation | null
  /** Whether waiting for a new operand */
  waitingForOperand: boolean
  /** Whether calculator actions are visible */
  showCalculatorActions: boolean
}

/**
 * Calculator store interface with actions and selectors.
 */
export interface CalculatorStore extends CalculatorState {
  /**
   * Input a number digit.
   *
   * @param num - The digit to input
   */
  inputNumber: (num: string) => void
  /**
   * Input a decimal point.
   */
  inputDecimal: () => void
  /**
   * Clear the calculator.
   */
  clear: () => void
  /**
   * Remove the last entered digit.
   */
  backspace: () => void
  /**
   * Toggle the sign of the current input value.
   */
  toggleSign: () => void
  /**
   * Perform a mathematical operation.
   *
   * @param operation - The operation to perform
   */
  performOperation: (operation: Operation) => void
  /**
   * Calculate and display the result.
   */
  calculateResult: () => void
  /**
   * Toggle calculator actions visibility.
   */
  toggleCalculatorActions: () => void
  /**
   * Reset the calculator to initial state.
   *
   * @param initialValue - Optional initial value
   */
  reset: (initialValue?: number) => void
  /**
   * Get the current calculator value.
   *
   * @returns Current value as number
   */
  getCurrentValue: () => number
  /**
   * Check if there's an active operation.
   *
   * @returns True if an operation is active
   */
  hasActiveOperation: () => boolean
}
