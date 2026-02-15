import { z } from "zod"

import { TransactionTypeEnum } from "~/types/transactions"

export const transactionSchema = z.object({
  amount: z.number().gt(0, "Amount must be greater than 0"),
  type: z.enum(TransactionTypeEnum),
  transactionDate: z.date(),
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().nullable().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  isPending: z.boolean().default(false),
  requiresManualConfirmation: z.boolean().optional(),
  tags: z.array(z.string()).default([]),
  location: z.string().optional(),
  extra: z.record(z.string(), z.string()).optional(),
  subtype: z.string().optional(),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>
