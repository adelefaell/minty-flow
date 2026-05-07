
# ✅ Phase 1 — Repos + Mappers (Production Setup)

---

# Folder structure

```
src/database/
  repos/
    transaction-repo.ts
    account-repo.ts
    category-repo.ts
    tag-repo.ts
    transaction-tag-repo.ts
  mappers/
    transaction.mapper.ts
    account.mapper.ts
    category.mapper.ts
    tag.mapper.ts
  types/
    rows.ts
```

---

# 1️⃣ Row Types (STRICT — no domain leakage)

## `src/database/types/rows.ts`

```ts
export interface RowTransaction {
  id: string
  account_id: string
  category_id: string | null
  amount: number
  type: string
  note: string | null
  transaction_date: string // ISO
  created_at: string
  updated_at: string
  is_deleted: number
  deleted_at: string | null
  account_balance_before: number | null
}

export interface RowAccount {
  id: string
  name: string
  balance: number
  currency: string
  is_archived: number
  sort_order: number
  created_at: string
}

export interface RowCategory {
  id: string
  name: string
  type: string
  transaction_count: number
}

export interface RowTag {
  id: string
  name: string
}
```

---

# 2️⃣ Repos (RAW SQL ONLY — no logic)

## 🔑 Rules

* No business logic
* No mapping
* No joins unless required
* Always parameterized
* Always filter `is_deleted = 0` unless explicitly needed

---

## `transaction-repo.ts`

```ts
import { query } from "../sql"
import type { RowTransaction } from "../types/rows"

export async function getTransactionsByIds(
  ids: string[]
): Promise<RowTransaction[]> {
  if (ids.length === 0) return []

  const placeholders = ids.map(() => "?").join(",")

  return query<RowTransaction>(
    `SELECT * FROM transactions 
     WHERE id IN (${placeholders})`,
    ids
  )
}

export async function getTransactionsByFilter(params: {
  from?: string
  to?: string
  accountIds?: string[]
  limit?: number
  offset?: number
}): Promise<RowTransaction[]> {
  const conditions = ["is_deleted = 0"]
  const values: any[] = []

  if (params.from) {
    conditions.push("transaction_date >= ?")
    values.push(params.from)
  }

  if (params.to) {
    conditions.push("transaction_date <= ?")
    values.push(params.to)
  }

  if (params.accountIds?.length) {
    const placeholders = params.accountIds.map(() => "?").join(",")
    conditions.push(`account_id IN (${placeholders})`)
    values.push(...params.accountIds)
  }

  const where = conditions.join(" AND ")

  return query<RowTransaction>(
    `
    SELECT *
    FROM transactions
    WHERE ${where}
    ORDER BY transaction_date DESC, created_at DESC
    LIMIT ? OFFSET ?
    `,
    [
      ...values,
      params.limit ?? 100,
      params.offset ?? 0,
    ]
  )
}
```

---

## `account-repo.ts`

```ts
import { query } from "../sql"
import type { RowAccount } from "../types/rows"

export async function getAllAccounts(): Promise<RowAccount[]> {
  return query<RowAccount>(`
    SELECT *
    FROM accounts
    ORDER BY sort_order ASC
  `)
}
```

---

## `category-repo.ts`

```ts
import { query } from "../sql"
import type { RowCategory } from "../types/rows"

export async function getAllCategories(): Promise<RowCategory[]> {
  return query<RowCategory>(`
    SELECT *
    FROM categories
  `)
}
```

---

## `tag-repo.ts`

```ts
import { query } from "../sql"
import type { RowTag } from "../types/rows"

export async function getAllTags(): Promise<RowTag[]> {
  return query<RowTag>(`SELECT * FROM tags`)
}
```

---

## `transaction-tag-repo.ts`

```ts
import { query } from "../sql"

export interface RowTransactionTag {
  transaction_id: string
  tag_id: string
}

export async function getTagsForTransactions(
  txIds: string[]
): Promise<RowTransactionTag[]> {
  if (txIds.length === 0) return []

  const placeholders = txIds.map(() => "?").join(",")

  return query<RowTransactionTag>(
    `
    SELECT transaction_id, tag_id
    FROM transaction_tags
    WHERE transaction_id IN (${placeholders})
    `,
    txIds
  )
}
```

---

# 3️⃣ Mappers (PURE — NO SIDE EFFECTS)

---

## `transaction.mapper.ts`

```ts
import type { RowTransaction } from "../types/rows"
import type { Transaction } from "~/types"

export function mapTransaction(row: RowTransaction): Transaction {
  return {
    id: row.id,
    accountId: row.account_id,
    categoryId: row.category_id,
    amount: row.amount,
    type: row.type as any,
    note: row.note,
    date: new Date(row.transaction_date),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    isDeleted: !!row.is_deleted,
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    accountBalanceBefore: row.account_balance_before,
  }
}
```

---

## `account.mapper.ts`

```ts
import type { RowAccount } from "../types/rows"
import type { Account } from "~/types"

export function mapAccount(row: RowAccount): Account {
  return {
    id: row.id,
    name: row.name,
    balance: row.balance,
    currency: row.currency,
    isArchived: !!row.is_archived,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at),
  }
}
```

---

# 4️⃣ 🔥 Batch Hydration (REPLACES WATERMELON MAGIC)

This is the most important part.

---

## `hydrateTransactions.ts`

```ts
import { getTagsForTransactions } from "../repos/transaction-tag-repo"
import { getAllAccounts } from "../repos/account-repo"
import { getAllCategories } from "../repos/category-repo"

import { mapTransaction } from "../mappers/transaction.mapper"
import { mapAccount } from "../mappers/account.mapper"

import type { RowTransaction } from "../types/rows"

export async function hydrateTransactions(
  rows: RowTransaction[]
) {
  if (rows.length === 0) return []

  const txIds = rows.map(r => r.id)

  // 🔥 batch queries (NO N+1)
  const [tagLinks, accounts, categories] = await Promise.all([
    getTagsForTransactions(txIds),
    getAllAccounts(),
    getAllCategories(),
  ])

  // index maps (O(1))
  const accountMap = new Map(accounts.map(a => [a.id, mapAccount(a)]))
  const categoryMap = new Map(categories.map(c => [c.id, c]))

  const tagMap = new Map<string, string[]>()

  for (const link of tagLinks) {
    if (!tagMap.has(link.transaction_id)) {
      tagMap.set(link.transaction_id, [])
    }
    tagMap.get(link.transaction_id)!.push(link.tag_id)
  }

  // final hydration
  return rows.map(row => {
    const base = mapTransaction(row)

    return {
      ...base,
      account: accountMap.get(row.account_id),
      category: row.category_id
        ? categoryMap.get(row.category_id)
        : null,
      tagIds: tagMap.get(row.id) ?? [],
    }
  })
}
```

---

# 5️⃣ 🚨 Critical Rules (DO NOT BREAK)

### ❌ Never:

* call repo inside a loop
* map inside repo
* join everything blindly
* fetch relations per row

### ✅ Always:

* batch → index → map
* keep repos dumb
* keep mappers pure
* hydrate explicitly

---

# 6️⃣ Performance Guarantees

This setup gives you:

* O(1) relation lookup
* O(n) hydration
* 0 N+1 queries
* predictable query cost

Even at:

* 5,000 transactions
* 20 accounts
* 100 categories

→ still smooth

---

# 7️⃣ What you now unlocked

You just replaced:
❌ Watermelon implicit magic
with
✅ Explicit, predictable, fast pipeline

