import { z } from "zod"

import { AccountTypeEnum } from "~/types/accounts"

const addAccountsSchema = z.object({
  name: z.string().min(1, "Account name is required").max(50),
  type: z.enum(AccountTypeEnum),
  balance: z.number(),
  currencyCode: z.string().min(3).max(3),
  icon: z.string().optional(),
  colorSchemeName: z.string().optional(),
  isPrimary: z.boolean().default(false),
  excludeFromBalance: z.boolean().default(false),
  isArchived: z.boolean().default(false),
})

const updateAccountsSchema = addAccountsSchema

export { addAccountsSchema, updateAccountsSchema }
export type AddAccountsFormSchema = z.infer<typeof addAccountsSchema>
export type UpdateAccountsFormSchema = z.infer<typeof updateAccountsSchema>
