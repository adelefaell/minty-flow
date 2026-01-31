import { z } from "zod"

import { TransactionTypeEnum } from "~/types/transactions"

const addCategoriesSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  icon: z.string().optional(),
  colorSchemeName: z.string().optional(),
  type: z.enum(TransactionTypeEnum),
})

const updateCategoriesSchema = addCategoriesSchema.extend({
  isArchived: z.boolean().default(false),
})

export { addCategoriesSchema, updateCategoriesSchema }
export type AddCategoriesFormSchema = z.infer<typeof addCategoriesSchema>
export type UpdateCategoriesFormSchema = z.infer<typeof updateCategoriesSchema>
