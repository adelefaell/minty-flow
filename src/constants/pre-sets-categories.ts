import type { Category } from "~/types/categories"

export type CategoryPreset = Omit<Category, "id">

/**
 * Preset expense categories for quick setup.
 *
 * @remarks
 * These are default categories that users can use when setting up their account.
 */
export const ExpensePresets: CategoryPreset[] = [
  {
    name: "Groceries",
    type: "expense",
    icon: "basket-outline",
    colorSchemeName: "",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Transportation",
    type: "expense",
    icon: "car-outline",
    colorSchemeName: "",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Healthcare",
    type: "expense",
    icon: "heart-outline",
    colorSchemeName: "",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Education",
    type: "expense",
    icon: "school-outline",
    colorSchemeName: "",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Shopping",
    type: "expense",
    icon: "shopping-outline",
    colorSchemeName: "",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

/**
 * Preset income categories for quick setup.
 *
 * @remarks
 * These are default categories that users can use when setting up their account.
 */
export const IncomePresets: CategoryPreset[] = [
  {
    name: "Salary",
    type: "income",
    icon: "wallet",
    colorSchemeName: "",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Freelance",
    type: "income",
    icon: "briefcase-outline",
    colorSchemeName: "",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Investment",
    type: "income",
    icon: "trending-up",
    colorSchemeName: "",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Business",
    type: "income",
    icon: "office-building-outline",
    colorSchemeName: "",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Gift",
    type: "income",
    icon: "gift-outline",
    colorSchemeName: "",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]
