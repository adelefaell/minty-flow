import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import type { CalculatorStore, Operation } from "~/types/calculator"
import { calculateOperation } from "~/utils/calculate-operations"
import { CALCULATOR_CONFIG, roundToDecimals } from "~/utils/number-format"

const exceedsLimits = (next: string): boolean => {
  const digits = next.replace(/[.-]/g, "").length
  if (digits > CALCULATOR_CONFIG.MAX_DIGITS) return true

  if (next.includes(".")) {
    const decimals = next.split(".")[1]?.length ?? 0
    if (decimals > CALCULATOR_CONFIG.MAX_DECIMALS) return true
  }

  return false
}

// ------------------------
// Refactored store
// ------------------------
export const useCalculatorStore = create<CalculatorStore>()(
  devtools(
    immer((set, get) => ({
      // -- State (separate display text from numeric value) --
      display: CALCULATOR_CONFIG.DEFAULT_DISPLAY,
      // parsed numeric value of `display` (kept for convenience/performance)
      inputValue: 0,
      previousValue: null,
      operation: null,
      waitingForOperand: false,
      showCalculatorActions: false,

      // -- Actions --
      inputNumber: (num: string) => {
        set((state) => {
          const next = state.waitingForOperand
            ? num
            : state.display === "0"
              ? num
              : state.display + num

          if (exceedsLimits(next)) return

          state.display = next
          state.inputValue = Number(next) || 0
          state.waitingForOperand = false
        }, false)
      },

      inputDecimal: () => {
        set((state) => {
          if (state.waitingForOperand) {
            state.display = "0."
            state.inputValue = 0
            state.waitingForOperand = false
            return
          }

          if (state.display.includes(".")) return

          const next = `${state.display}.`
          if (exceedsLimits(next)) return

          state.display = next
        }, false)
      },

      clear: () => {
        set((state) => {
          if (state.operation !== null && state.previousValue !== null) {
            state.display = CALCULATOR_CONFIG.DEFAULT_DISPLAY
            state.inputValue = 0
            state.waitingForOperand = true
            return
          }

          state.display = CALCULATOR_CONFIG.DEFAULT_DISPLAY
          state.inputValue = 0
          state.previousValue = null
          state.operation = null
          state.waitingForOperand = false
        }, false)
      },

      backspace: () => {
        set((state) => {
          if (state.display.length > 1) {
            const next = state.display.slice(0, -1)
            state.display = next
            state.inputValue = Number(next) || 0
            return
          }

          state.display = CALCULATOR_CONFIG.DEFAULT_DISPLAY
          state.inputValue = 0
        }, false)
      },

      toggleSign: () => {
        set((state) => {
          if (state.inputValue === 0) return

          const next = -state.inputValue
          state.inputValue = next
          state.display = next.toString()
        }, false)
      },

      performOperation: (nextOperation: Operation) => {
        const { showCalculatorActions, toggleCalculatorActions } = get()
        if (!showCalculatorActions) toggleCalculatorActions()

        set((state) => {
          const inputValue = state.inputValue

          if (state.previousValue === null) {
            state.previousValue = inputValue
            state.operation = nextOperation
            state.display = CALCULATOR_CONFIG.DEFAULT_DISPLAY
            state.inputValue = 0
            state.waitingForOperand = true
            return
          }

          // If we're waiting for an operand (just pressed an operation and no number typed),
          // simply replace the current operation with the new one
          if (state.waitingForOperand) {
            state.operation = nextOperation
            return
          }

          // previousValue is guaranteed to be non-null here due to check above
          const currentValue = state.previousValue

          const result = calculateOperation(
            state.operation as Operation,
            currentValue,
            inputValue,
          )

          // Check for division by zero or invalid result
          if (!Number.isFinite(result) || Number.isNaN(result)) {
            // Reset on error
            state.display = CALCULATOR_CONFIG.DEFAULT_DISPLAY
            state.inputValue = 0
            state.previousValue = null
            state.operation = null
            state.waitingForOperand = false
            return
          }

          state.previousValue = roundToDecimals(
            result,
            CALCULATOR_CONFIG.MAX_DECIMALS,
          )
          state.operation = nextOperation
          state.display = CALCULATOR_CONFIG.DEFAULT_DISPLAY
          state.inputValue = 0
          state.waitingForOperand = true
        }, false)
      },

      calculateResult: () => {
        set((state) => {
          if (state.previousValue === null || state.operation === null) return

          const inputValue = state.inputValue
          const currentValue = state.previousValue
          const result = calculateOperation(
            state.operation,
            currentValue,
            inputValue,
          )

          // Check for division by zero or invalid result
          if (!Number.isFinite(result) || Number.isNaN(result)) {
            state.display = CALCULATOR_CONFIG.DEFAULT_DISPLAY
            state.inputValue = 0
            state.previousValue = null
            state.operation = null
            state.waitingForOperand = false
            return
          }

          const rounded = roundToDecimals(
            result,
            CALCULATOR_CONFIG.MAX_DECIMALS,
          )
          // Convert to string, removing unnecessary trailing zeros
          // but preserving decimal point if it's a decimal number
          const displayStr = rounded.toString()
          state.display = displayStr
          state.inputValue = rounded
          state.previousValue = null
          state.operation = null
          state.waitingForOperand = true // Next number input should overwrite the result
        }, false)
      },

      toggleCalculatorActions: () => {
        set((state) => {
          state.showCalculatorActions = !state.showCalculatorActions
        }, false)
      },

      reset: (initialValue = 0) => {
        set((state) => {
          state.display = initialValue.toString()
          state.inputValue = initialValue
          state.previousValue = null
          state.operation = null
          state.waitingForOperand = initialValue !== 0 // Set to true if there's an initial value
          state.showCalculatorActions = false
        }, false)
      },

      // Selectors
      getCurrentValue: () => {
        const state = get()
        return state.inputValue || 0
      },

      hasActiveOperation: () => {
        const state = get()
        return state.operation !== null && state.previousValue !== null
      },
    })) as Parameters<typeof devtools<CalculatorStore>>[0],
    { name: "calculator-store" },
  ),
)
