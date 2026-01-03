import { create } from "zustand"
import { devtools } from "zustand/middleware"

export type TransactionType = "expense" | "income" | "transfer"

type OnboardingStep =
  | "account"
  | "to-account"
  | "category"
  | "calculator"
  | "focus-title"
  | null

interface TransactionSheetControlsStore {
  transactionSheetControls: boolean
  setTransactionSheetControls: (value: boolean) => void
  toggleTransactionSheetControls: () => void
  type: TransactionType
  setType: (value: TransactionType) => void
  onboardingStep: OnboardingStep
  shouldRunOnboarding: boolean
  startOnboarding: () => void
  nextOnboardingStep: () => void
  completeOnboarding: () => void
  resetOnboarding: () => void
}

export const useTransactionSheetControlsStore =
  create<TransactionSheetControlsStore>()(
    devtools(
      (set) => ({
        transactionSheetControls: false,
        type: "expense",
        onboardingStep: null,
        shouldRunOnboarding: false,
        setTransactionSheetControls: (value: boolean) => {
          set({ transactionSheetControls: value })
          // Reset onboarding when sheet closes
          if (!value) {
            set({ onboardingStep: null, shouldRunOnboarding: false })
          }
        },
        toggleTransactionSheetControls: () => {
          set((state) => ({
            transactionSheetControls: !state.transactionSheetControls,
          }))
        },
        setType: (value: TransactionType) => {
          set({ type: value })
        },
        startOnboarding: () => {
          set({ shouldRunOnboarding: true, onboardingStep: "account" })
        },
        nextOnboardingStep: () => {
          set((state) => {
            if (state.onboardingStep === "account") {
              return { onboardingStep: "to-account" }
            }
            if (state.onboardingStep === "to-account") {
              return { onboardingStep: "category" }
            }
            if (state.onboardingStep === "category") {
              return { onboardingStep: "calculator" }
            }
            if (state.onboardingStep === "calculator") {
              return { onboardingStep: "focus-title" }
            }
            return state
          })
        },
        completeOnboarding: () => {
          set({ onboardingStep: null, shouldRunOnboarding: false })
        },
        resetOnboarding: () => {
          set({ onboardingStep: null, shouldRunOnboarding: false })
        },
      }),
      {
        name: "transaction-sheet-controls-store-dev",
      },
    ),
  )
