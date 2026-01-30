import { z } from "zod"

import { CategoryTypeEnum } from "~/types/categories"

const addCategoriesSchema = z.object({
  name: z.string().min(3),
  icon: z.string().optional(),
  colorSchemeName: z.string().optional(),
  type: z.enum(CategoryTypeEnum),
})

const updateCategoriesSchema = addCategoriesSchema.extend({
  isArchived: z.boolean().default(false),
})

export { addCategoriesSchema, updateCategoriesSchema }
export type AddCategoriesFormSchema = z.infer<typeof addCategoriesSchema>
export type UpdateCategoriesFormSchema = z.infer<typeof updateCategoriesSchema>
