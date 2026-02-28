import { z } from "zod"

import { TransactionTypeEnum } from "~/types/transactions"

const addCategoriesSchema = z.object({
  name: z.string().min(1, "validation.category.name.required"),
  icon: z.string().optional(),
  colorSchemeName: z.string().optional(),
  type: z.enum(TransactionTypeEnum),
  isArchived: z.boolean().default(false),
})

const updateCategoriesSchema = addCategoriesSchema

export { addCategoriesSchema, updateCategoriesSchema }
export type AddCategoriesFormSchema = z.infer<typeof addCategoriesSchema>
export type UpdateCategoriesFormSchema = z.infer<typeof updateCategoriesSchema>
