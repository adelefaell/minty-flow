import type { Category } from "~/types/categories"

/**
 * Preset expense categories for quick setup.
 *
 * @remarks
 * These are default categories that users can use when setting up their account.
 */
export const ExpensePresets: Category[] = [
  {
    id: "exp_groceries",
    name: "Groceries",
    type: "expense",
    icon: "basket-outline",
    colorSchemeName: "emerald",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "exp_transportation",
    name: "Transportation",
    type: "expense",
    icon: "car-outline",
    colorSchemeName: "blue",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "exp_healthcare",
    name: "Healthcare",
    type: "expense",
    icon: "heart-outline",
    colorSchemeName: "red",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "exp_education",
    name: "Education",
    type: "expense",
    icon: "school-outline",
    colorSchemeName: "purple",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "exp_shopping",
    name: "Shopping",
    type: "expense",
    icon: "shopping-outline",
    colorSchemeName: "pink",
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
export const IncomePresets: Category[] = [
  {
    id: "inc_salary",
    name: "Salary",
    type: "income",
    icon: "wallet",
    colorSchemeName: "green",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "inc_freelance",
    name: "Freelance",
    type: "income",
    icon: "briefcase-outline",
    colorSchemeName: "amber",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "inc_investment",
    name: "Investment",
    type: "income",
    icon: "trending-up",
    colorSchemeName: "teal",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "inc_business",
    name: "Business",
    type: "income",
    icon: "office-building-outline",
    colorSchemeName: "indigo",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "inc_gift",
    name: "Gift",
    type: "income",
    icon: "gift-outline",
    colorSchemeName: "rose",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

/**
 * Preset transfer categories for quick setup.
 *
 * @remarks
 * These are default categories that users can use when setting up their account.
 */
export const TransferPresets: Category[] = [
  {
    id: "trf_savings",
    name: "Savings",
    type: "transfer",
    icon: "piggy-bank-outline",
    colorSchemeName: "emerald",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "trf_investment",
    name: "Investment",
    type: "transfer",
    icon: "chart-line",
    colorSchemeName: "blue",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "trf_retirement",
    name: "Retirement",
    type: "transfer",
    icon: "clock-outline",
    colorSchemeName: "purple",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "trf_debt_payment",
    name: "Debt Payment",
    type: "transfer",
    icon: "credit-card-outline",
    colorSchemeName: "orange",
    transactionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]
