import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

export type TransactionItemVariant = "compact" | "elevated"

type LeadingIcon = "category" | "account"

interface TransactionItemAppearanceStore {
  variant: TransactionItemVariant
  leadingIcon: LeadingIcon
  showCategory: boolean
  showCategoryForUntitled: boolean
  setVariant: (value: TransactionItemVariant) => void
  setShowCategory: (value: boolean) => void
  setShowCategoryForUntitled: (value: boolean) => void
  setLeadingIcon: (value: LeadingIcon) => void
}

export const useTransactionItemAppearanceStore =
  create<TransactionItemAppearanceStore>()(
    devtools(
      persist(
        (set) => ({
          variant: "compact",
          showCategory: false,
          showCategoryForUntitled: false,
          leadingIcon: "category",
          setVariant: (value: TransactionItemVariant) => {
            set({ variant: value })
          },
          setShowCategory: (value: boolean) => {
            set({ showCategory: value })
          },
          setShowCategoryForUntitled: (value: boolean) => {
            set({ showCategoryForUntitled: value })
          },
          setLeadingIcon: (value: LeadingIcon) => {
            set({ leadingIcon: value })
          },
        }),
        {
          name: "transaction-item-appearance-store",
        },
      ),
      { name: "transaction-item-appearance-store-dev" },
    ),
  )
