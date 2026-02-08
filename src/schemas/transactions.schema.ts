import { z } from "zod"

export const transactionSchema = z.object({
  amount: z.number().gt(0, "Amount must be greater than 0"),
  type: z.enum(["expense", "income", "transfer"]),
  date: z.date(),
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().nullable().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  isPending: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  location: z.string().optional(),
  extra: z.record(z.string(), z.string()).optional(),
  subtype: z.string().optional(),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>
