import { z } from "zod"

import { GoalTypeEnum } from "~/types/goals"

const addGoalSchema = z.object({
  goalType: z.enum([GoalTypeEnum.SAVINGS, GoalTypeEnum.EXPENSE]),
  name: z.string().min(1, "validation.goal.name.required"),
  description: z.string().nullable().optional(),
  icon: z.string().max(100).nullable().optional(),
  colorSchemeName: z.string().max(50).nullable().optional(),
  currencyCode: z.string().min(1, "validation.goal.currency.required"),
  accountIds: z.array(z.string()).min(1, "validation.goal.accounts.required"),
  targetAmount: z.number().positive("validation.goal.targetAmount.positive"),
  targetDate: z.number().nullable().optional(), // Unix timestamp
})

const updateGoalSchema = addGoalSchema

export { addGoalSchema, updateGoalSchema }
export type AddGoalFormSchema = z.infer<typeof addGoalSchema>
export type UpdateGoalFormSchema = z.infer<typeof updateGoalSchema>
