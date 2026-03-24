import { z } from "zod"

import type { BudgetPeriod } from "~/types/budgets"
import { BudgetPeriodEnum } from "~/types/budgets"

const addBudgetSchema = z
  .object({
    name: z.string().min(1, "validation.budget.name.required"),
    icon: z.string().max(100).nullable().optional(),
    colorSchemeName: z.string().max(50).nullable().optional(),
    currencyCode: z.string().min(1, "validation.budget.currency.required"),
    accountIds: z
      .array(z.string())
      .min(1, "validation.budget.accounts.required"),
    amount: z.number().positive("validation.budget.amount.positive"),
    period: z.enum(
      Object.values(BudgetPeriodEnum) as [BudgetPeriod, ...BudgetPeriod[]],
    ),
    startDate: z.number(), // Unix timestamp
    endDate: z.number().nullable().optional(),
    categoryIds: z
      .array(z.string())
      .min(1, "validation.budget.categories.required"),
    alertThreshold: z.number().min(1).max(100).nullable().optional(),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.period === BudgetPeriodEnum.CUSTOM && data.endDate == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validation.budget.endDate.requiredForCustom",
        path: ["endDate"],
      })
    }
  })

const updateBudgetSchema = addBudgetSchema

export { addBudgetSchema, updateBudgetSchema }
export type AddBudgetFormSchema = z.infer<typeof addBudgetSchema>
export type UpdateBudgetFormSchema = z.infer<typeof updateBudgetSchema>
