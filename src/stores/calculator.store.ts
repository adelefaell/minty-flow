import { create } from "zustand"
import { devtools } from "zustand/middleware"

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

export const useCalculatorStore = create<CalculatorStore>()(
  devtools(
    (set, get) => ({
      /* ───────── State ───────── */
      display: CALCULATOR_CONFIG.DEFAULT_DISPLAY,
      inputValue: 0,
      previousValue: null,
      operation: null,
      waitingForOperand: false,
      showCalculatorActions: false,

      /* ───────── Actions ───────── */
      inputNumber: (num) => {
        const state = get()
        const next = state.waitingForOperand
          ? num
          : state.display === "0"
            ? num
            : state.display + num

        if (exceedsLimits(next)) return

        set({
          display: next,
          inputValue: Number(next) || 0,
          waitingForOperand: false,
        })
      },

      inputDecimal: () => {
        const state = get()
        if (state.waitingForOperand) {
          set({ display: "0.", inputValue: 0, waitingForOperand: false })
          return
        }

        if (state.display.includes(".")) return

        const next = `${state.display}.`
        if (exceedsLimits(next)) return

        set({ display: next })
      },

      clear: () => {
        const state = get()
        if (state.operation !== null && state.previousValue !== null) {
          set({
            display: CALCULATOR_CONFIG.DEFAULT_DISPLAY,
            inputValue: 0,
            waitingForOperand: true,
          })
          return
        }

        set({
          display: CALCULATOR_CONFIG.DEFAULT_DISPLAY,
          inputValue: 0,
          previousValue: null,
          operation: null,
          waitingForOperand: false,
        })
      },

      backspace: () => {
        const { display } = get()
        if (display.length > 1) {
          const next = display.slice(0, -1)
          set({ display: next, inputValue: Number(next) || 0 })
        } else {
          set({ display: CALCULATOR_CONFIG.DEFAULT_DISPLAY, inputValue: 0 })
        }
      },

      toggleSign: () => {
        const { inputValue } = get()
        if (inputValue === 0) return
        const next = -inputValue
        set({ inputValue: next, display: next.toString() })
      },

      performOperation: (nextOperation) => {
        const state = get()
        if (!state.showCalculatorActions) state.toggleCalculatorActions()

        const { inputValue, previousValue, operation, waitingForOperand } =
          state

        if (previousValue === null) {
          set({
            previousValue: inputValue,
            operation: nextOperation,
            display: CALCULATOR_CONFIG.DEFAULT_DISPLAY,
            inputValue: 0,
            waitingForOperand: true,
          })
          return
        }

        if (waitingForOperand) {
          set({ operation: nextOperation })
          return
        }

        const result = calculateOperation(
          operation as Operation,
          previousValue,
          inputValue,
        )

        if (!Number.isFinite(result) || Number.isNaN(result)) {
          set({
            display: CALCULATOR_CONFIG.DEFAULT_DISPLAY,
            inputValue: 0,
            previousValue: null,
            operation: null,
            waitingForOperand: false,
          })
          return
        }

        set({
          previousValue: roundToDecimals(
            result,
            CALCULATOR_CONFIG.MAX_DECIMALS,
          ),
          operation: nextOperation,
          display: CALCULATOR_CONFIG.DEFAULT_DISPLAY,
          inputValue: 0,
          waitingForOperand: true,
        })
      },

      calculateResult: () => {
        const { previousValue, operation, inputValue } = get()
        if (previousValue === null || operation === null) return

        const result = calculateOperation(operation, previousValue, inputValue)

        if (!Number.isFinite(result) || Number.isNaN(result)) {
          set({
            display: CALCULATOR_CONFIG.DEFAULT_DISPLAY,
            inputValue: 0,
            previousValue: null,
            operation: null,
            waitingForOperand: false,
          })
          return
        }

        const rounded = roundToDecimals(result, CALCULATOR_CONFIG.MAX_DECIMALS)
        set({
          display: rounded.toString(),
          inputValue: rounded,
          previousValue: null,
          operation: null,
          waitingForOperand: true,
        })
      },

      toggleCalculatorActions: () =>
        set((state) => ({
          showCalculatorActions: !state.showCalculatorActions,
        })),

      reset: (initialValue = 0) =>
        set({
          display: initialValue.toString(),
          inputValue: initialValue,
          previousValue: null,
          operation: null,
          waitingForOperand: initialValue !== 0,
          showCalculatorActions: false,
        }),

      /* ───────── Selectors ───────── */
      getCurrentValue: () => get().inputValue || 0,

      hasActiveOperation: () => {
        const state = get()
        return state.operation !== null && state.previousValue !== null
      },
    }),
    { name: "calculator-store" },
  ),
)
