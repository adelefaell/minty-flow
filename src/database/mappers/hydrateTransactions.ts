import type { Account } from "~/types/accounts"
import type { Category } from "~/types/categories"
import type { Transaction } from "~/types/transactions"

import { getAllAccounts } from "../repos/account-repo"
import { getAllCategories } from "../repos/category-repo"
import { getTagsForTransactions } from "../repos/transaction-tag-repo"
import { query } from "../sql"
import type { RowTransaction } from "../types/rows"
import { mapAccount } from "./account.mapper"
import { mapCategory } from "./category.mapper"
import { mapTransaction } from "./transaction.mapper"

interface RowTransfer {
  from_transaction_id: string
  to_transaction_id: string
  from_account_id: string
  to_account_id: string
  conversion_rate: number
}

export interface TransactionWithRelations extends Transaction {
  account: Account | undefined
  category: Category | undefined
  relatedAccount: Account | undefined
  conversionRate: number | null
  tagIds: string[]
}

export async function hydrateTransactions(
  rows: RowTransaction[],
): Promise<TransactionWithRelations[]> {
  if (rows.length === 0) return []

  const txIds = rows.map((r) => r.id)
  const transferIds = rows.filter((r) => r.is_transfer).map((r) => r.id)

  // Batch — no N+1
  const [tagLinks, accountRows, categoryRows] = await Promise.all([
    getTagsForTransactions(txIds),
    getAllAccounts(),
    getAllCategories(),
  ])

  // Index maps — O(1) lookup
  const accountMap = new Map<string, Account>(
    accountRows.map((a) => [a.id, mapAccount(a)]),
  )
  const categoryMap = new Map<string, Category>(
    categoryRows.map((c) => [c.id, mapCategory(c)]),
  )

  const tagMap = new Map<string, string[]>()
  for (const link of tagLinks) {
    const existing = tagMap.get(link.transaction_id)
    if (existing) {
      existing.push(link.tag_id)
    } else {
      tagMap.set(link.transaction_id, [link.tag_id])
    }
  }

  // Transfer metadata: relatedAccount + conversionRate
  const transferMap = new Map<
    string,
    { relatedAccountId: string; conversionRate: number }
  >()
  if (transferIds.length > 0) {
    const tfPlaceholders = transferIds.map(() => "?").join(",")
    const transferRows = await query<RowTransfer>(
      `SELECT from_transaction_id, to_transaction_id, from_account_id, to_account_id, conversion_rate
       FROM transfers
       WHERE from_transaction_id IN (${tfPlaceholders}) OR to_transaction_id IN (${tfPlaceholders})`,
      [...transferIds, ...transferIds],
    )
    for (const tf of transferRows) {
      transferMap.set(tf.from_transaction_id, {
        relatedAccountId: tf.to_account_id,
        conversionRate: tf.conversion_rate,
      })
      transferMap.set(tf.to_transaction_id, {
        relatedAccountId: tf.from_account_id,
        conversionRate: tf.conversion_rate,
      })
    }
  }

  return rows.map((row) => {
    const tf = transferMap.get(row.id)
    return {
      ...mapTransaction(row),
      account: accountMap.get(row.account_id),
      category: row.category_id ? categoryMap.get(row.category_id) : undefined,
      relatedAccount: tf ? accountMap.get(tf.relatedAccountId) : undefined,
      conversionRate: tf?.conversionRate ?? null,
      tagIds: tagMap.get(row.id) ?? [],
    }
  })
}
