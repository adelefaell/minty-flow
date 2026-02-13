import { Q } from "@nozbe/watermelondb"
import type { Observable } from "rxjs"
import { combineLatest, from, map, of, startWith, switchMap } from "rxjs"

import type { TransactionFormValues } from "~/schemas/transactions.schema"
import {
  type TransactionListFilters,
  type TransactionType,
  TransactionTypeEnum,
} from "~/types/transactions"

import { database } from "../index"
import type AccountModel from "../models/Account"
import type CategoryModel from "../models/Category"
import type TagModel from "../models/Tag"
import type TransactionModel from "../models/Transaction"
import type TransactionTagModel from "../models/TransactionTag"

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

export interface TransactionWithRelations {
  transaction: TransactionModel
  account: AccountModel
  category: CategoryModel | null
  tags: TagModel[]
}

/* ------------------------------------------------------------------ */
/* Base collections */
/* ------------------------------------------------------------------ */

const transactionsCollection = () =>
  database.get<TransactionModel>("transactions")

const accountsCollection = () => database.get<AccountModel>("accounts")

const transactionTagsCollection = () =>
  database.get<TransactionTagModel>("transaction_tags")

const tagsCollection = () => database.get<TagModel>("tags")

/* ------------------------------------------------------------------ */
/* Hydration helpers */
/* ------------------------------------------------------------------ */

const hydrateTransaction = async (
  transaction: TransactionModel,
): Promise<TransactionWithRelations> => {
  const accounts = database.get<AccountModel>("accounts")
  const categories = database.get<CategoryModel>("categories")
  const [account, category, tags] = await Promise.all([
    accounts.find(transaction.accountId),
    transaction.categoryId
      ? categories.find(transaction.categoryId)
      : Promise.resolve(null),
    loadTransactionTags(transaction.id),
  ])

  return {
    transaction,
    account,
    category,
    tags,
  }
}

/**
 * Balance delta for the account: expense/transfer = -amount, income = +amount.
 */
const getBalanceDelta = (amount: number, type: TransactionType): number => {
  if (type === TransactionTypeEnum.INCOME) return amount
  return -amount // expense or transfer (money out of account)
}

const loadTransactionTags = async (
  transactionId: string,
): Promise<TagModel[]> => {
  const tts = await transactionTagsCollection()
    .query(Q.where("transaction_id", transactionId))
    .fetch()

  if (tts.length === 0) return []

  const tagIds = tts.map((t) => t.tagId)

  return tagsCollection()
    .query(Q.where("id", Q.oneOf(tagIds)))
    .fetch()
}

/* ------------------------------------------------------------------ */
/* Query builder */
/* ------------------------------------------------------------------ */

const buildTransactionQuery = (filters?: TransactionListFilters) => {
  let query = transactionsCollection().query()

  if (filters?.accountIds?.length) {
    query = query.extend(Q.where("account_id", Q.oneOf(filters.accountIds)))
  } else if (filters?.accountId) {
    query = query.extend(Q.where("account_id", filters.accountId))
  }
  if (filters?.categoryId) {
    query = query.extend(Q.where("category_id", filters.categoryId))
  }
  if (filters?.type) {
    query = query.extend(Q.where("type", filters.type))
  }
  if (filters?.isPending !== undefined) {
    query = query.extend(Q.where("is_pending", filters.isPending))
  }
  if (filters?.deletedOnly) {
    query = query.extend(Q.where("is_deleted", true))
  } else if (!filters?.includeDeleted) {
    query = query.extend(Q.where("is_deleted", false))
  }
  if (filters?.fromDate !== undefined) {
    query = query.extend(Q.where("transaction_date", Q.gte(filters.fromDate)))
  }
  if (filters?.toDate !== undefined) {
    query = query.extend(Q.where("transaction_date", Q.lte(filters.toDate)))
  }

  return query
}

/* ------------------------------------------------------------------ */
/* READ – raw models (for edit screen, etc.) */
/* ------------------------------------------------------------------ */

export const getTransactionModels = async (
  filters?: TransactionListFilters,
): Promise<TransactionModel[]> => {
  return buildTransactionQuery(filters).fetch()
}

/** Number of transactions for an account (non-deleted by default). */
export const getTransactionCountByAccountId = async (
  accountId: string,
  includeDeleted = false,
): Promise<number> => {
  const rows = await buildTransactionQuery({
    accountId,
    includeDeleted,
  }).fetch()
  return rows.length
}

/** Observable count of transactions for an account (non-deleted). */
export const observeTransactionCountByAccountId = (
  accountId: string,
): Observable<number> =>
  observeTransactionModels({ accountId }).pipe(map((rows) => rows.length))

/** Number of transactions for a category (non-deleted by default). */
export const getTransactionCountByCategoryId = async (
  categoryId: string,
  includeDeleted = false,
): Promise<number> => {
  const rows = await buildTransactionQuery({
    categoryId,
    includeDeleted,
  }).fetch()
  return rows.length
}

/** Number of transactions linked to a tag (via transaction_tags). */
export const getTransactionTagCountByTagId = async (
  tagId: string,
): Promise<number> => {
  const rows = await transactionTagsCollection()
    .query(Q.where("tag_id", tagId))
    .fetch()
  return rows.length
}

/**
 * Unlink a tag from all transactions (removes all transaction_tags for this tag).
 * Call before deleting/destroying a tag.
 */
export const unlinkTagFromAllTransactions = async (
  tagId: string,
): Promise<void> => {
  const rows = await transactionTagsCollection()
    .query(Q.where("tag_id", tagId))
    .fetch()
  await database.write(async () => {
    for (const row of rows) {
      await row.destroyPermanently()
    }
  })
}

export const findTransactionModel = async (
  id: string,
): Promise<TransactionModel | null> => {
  try {
    return await transactionsCollection().find(id)
  } catch {
    return null
  }
}

/** Columns that affect list display or commonly change on edit – re-emit when these change. */
const TRANSACTION_OBSERVE_COLUMNS = [
  "title",
  "transaction_date",
  "amount",
  "type",
  "is_pending",
  "category_id",
  "account_id",
  "updated_at",
  "is_deleted",
] as const

export const observeTransactionModels = (
  filters?: TransactionListFilters,
): Observable<TransactionModel[]> => {
  return buildTransactionQuery(filters).observeWithColumns([
    ...TRANSACTION_OBSERVE_COLUMNS,
  ])
}

export const observeTransactionModelById = (
  id: string,
): Observable<TransactionModel> => {
  return transactionsCollection().findAndObserve(id)
}

/* ------------------------------------------------------------------ */
/* READ – fully hydrated */
/* ------------------------------------------------------------------ */

export const getTransactionModelsFull = async (
  filters?: TransactionListFilters,
): Promise<TransactionWithRelations[]> => {
  const rows = await buildTransactionQuery(filters).fetch()
  return Promise.all(rows.map(hydrateTransaction))
}

export const findTransactionModelFull = async (
  id: string,
): Promise<TransactionWithRelations | null> => {
  try {
    const transaction = await transactionsCollection().find(id)
    return hydrateTransaction(transaction)
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/* OBSERVE – fully hydrated */
/* ------------------------------------------------------------------ */

/**
 * Observe transactions with account, category, and tags hydrated.
 * Uses observeTransactionModels (with observeWithColumns) so transaction title/date/amount
 * updates re-emit. When refreshWhen observables are provided, re-hydrates whenever they
 * emit so account/category (e.g. icon) updates appear instantly.
 */
export const observeTransactionModelsFull = (
  filters?: TransactionListFilters,
  refreshWhen?: Observable<unknown>[],
): Observable<TransactionWithRelations[]> => {
  const transactions$ = observeTransactionModels(filters)

  const source$ =
    refreshWhen?.length && Array.isArray(refreshWhen) && refreshWhen.length > 0
      ? combineLatest([
          transactions$.pipe(startWith([] as TransactionModel[])),
          ...refreshWhen.map((o) => o.pipe(startWith(null))),
        ]).pipe(map(([rows]) => rows as TransactionModel[]))
      : transactions$

  return source$.pipe(
    switchMap((rows) =>
      rows.length === 0
        ? of([])
        : combineLatest(rows.map((t) => from(hydrateTransaction(t)))),
    ),
  )
}

export const observeTransactionModelFullById = (
  id: string,
): Observable<TransactionWithRelations> => {
  return transactionsCollection()
    .findAndObserve(id)
    .pipe(switchMap((t) => from(hydrateTransaction(t))))
}

/* ------------------------------------------------------------------ */
/* Tag helpers (for edit screen) */
/* ------------------------------------------------------------------ */

export const getTransactionTagIds = async (
  transactionId: string,
): Promise<string[]> => {
  const rows = await transactionTagsCollection()
    .query(Q.where("transaction_id", transactionId))
    .fetch()
  return rows.map((row) => row.tagId)
}

export const observeTransactionTagIds = (
  transactionId: string,
): Observable<string[]> => {
  return transactionTagsCollection()
    .query(Q.where("transaction_id", transactionId))
    .observe()
    .pipe(map((rows) => rows.map((row) => row.tagId)))
}

/* ------------------------------------------------------------------ */
/* WRITE */
/* ------------------------------------------------------------------ */

export const createTransactionModel = async (
  data: TransactionFormValues,
): Promise<TransactionModel> => {
  const transactions = transactionsCollection()
  const categories = database.get<CategoryModel>("categories")
  // const accounts = database.get<AccountModel>("accounts")

  return database.write(async () => {
    const category = data.categoryId
      ? await categories.find(data.categoryId)
      : null

    const transaction = await transactions.create((t) => {
      t.amount = data.amount
      t.type = data.type
      t.transactionDate = data.transactionDate
      t.accountId = data.accountId
      t.categoryId = data.categoryId ?? null
      t.title = data.title ?? ""
      t.description = data.description ?? ""
      t.isPending = data.isPending ?? false
      t.isDeleted = false
      t.createdAt = new Date()
      t.updatedAt = new Date()
      t.extra = data.extra
      t.subtype = data.subtype
      t.location = data.location
    })

    const account = await accountsCollection().find(data.accountId)
    const balanceDelta = getBalanceDelta(data.amount, data.type)
    await account.update((a) => {
      a.balance = a.balance + balanceDelta
      a.updatedAt = new Date()
    })

    if (category) {
      await category.update((c) => {
        c.transactionCount += 1
        c.updatedAt = new Date()
      })
    }

    if (data.tags?.length) {
      const tt = transactionTagsCollection()
      const tags = tagsCollection()

      for (const tagId of data.tags) {
        const tag = await tags.find(tagId)

        await tt.create((r) => {
          r.transactionId = transaction.id
          r.tagId = tagId
        })

        await tag.update((t) => {
          t.transactionCount += 1
          t.updatedAt = new Date()
        })
      }
    }

    return transaction
  })
}

export const updateTransactionModel = async (
  transaction: TransactionModel,
  updates: Partial<TransactionFormValues>,
): Promise<TransactionModel> => {
  const categories = database.get<CategoryModel>("categories")
  const oldAmount = transaction.amount
  const oldType = transaction.type
  const oldAccountId = transaction.accountId

  return database.write(async () => {
    const oldCategoryId = transaction.categoryId
    let oldCategory: CategoryModel | null = null
    if (oldCategoryId) {
      try {
        oldCategory = await categories.find(oldCategoryId)
      } catch {
        // ignore
      }
    }

    const updatedTransaction = await transaction.update((t) => {
      if (updates.amount !== undefined) t.amount = updates.amount
      if (updates.type !== undefined) t.type = updates.type
      if (updates.transactionDate !== undefined)
        t.transactionDate = updates.transactionDate
      if (updates.title !== undefined) t.title = updates.title
      if (updates.description !== undefined) t.description = updates.description
      if (updates.isPending !== undefined) t.isPending = updates.isPending

      if (updates.categoryId !== undefined) {
        t.categoryId = updates.categoryId ?? null
      }
      if (updates.accountId) {
        t.accountId = updates.accountId
      }

      t.updatedAt = new Date()
      if (updates.extra !== undefined) {
        t.extra = updates.extra
      }
      if (updates.subtype !== undefined) {
        t.subtype = updates.subtype
      }
      if (updates.location !== undefined) {
        t.location = updates.location
      }
    })

    if (
      updates.categoryId !== undefined &&
      oldCategoryId !== updates.categoryId
    ) {
      if (oldCategory && !transaction.isDeleted) {
        await oldCategory.update((c) => {
          c.transactionCount = Math.max(0, c.transactionCount - 1)
          c.updatedAt = new Date()
        })
      }
      if (updates.categoryId && !transaction.isDeleted) {
        const newCategory = await categories.find(updates.categoryId)
        if (newCategory) {
          await newCategory.update((c) => {
            c.transactionCount += 1
            c.updatedAt = new Date()
          })
        }
      }
    }

    if (updates.tags !== undefined) {
      const transactionTags = transactionTagsCollection()
      const tagsCollectionRef = tagsCollection()
      const existing = await transactionTags
        .query(Q.where("transaction_id", transaction.id))
        .fetch()
      const existingTagIds = new Set(existing.map((tt) => tt.tagId))
      const newTagIds = new Set(updates.tags)

      for (const tt of existing) {
        if (!newTagIds.has(tt.tagId)) {
          const tag = await tagsCollectionRef.find(tt.tagId)
          await tag.update((t) => {
            t.transactionCount = Math.max(0, t.transactionCount - 1)
            t.updatedAt = new Date()
          })
          await tt.destroyPermanently()
        }
      }
      for (const tagId of newTagIds) {
        if (!existingTagIds.has(tagId)) {
          const tag = await tagsCollectionRef.find(tagId)
          await transactionTags.create((ttRecord) => {
            ttRecord.transactionId = transaction.id
            ttRecord.tagId = tagId
          })
          await tag.update((t) => {
            t.transactionCount += 1
            t.updatedAt = new Date()
          })
        }
      }
    }

    const newAmount = updatedTransaction.amount
    const newType = updatedTransaction.type
    const newAccountId = updatedTransaction.accountId
    const reverseOldDelta = -getBalanceDelta(oldAmount, oldType)
    const forwardNewDelta = getBalanceDelta(newAmount, newType)

    const accounts = accountsCollection()
    if (newAccountId === oldAccountId) {
      const account = await accounts.find(oldAccountId)
      await account.update((a) => {
        a.balance = a.balance + reverseOldDelta + forwardNewDelta
        a.updatedAt = new Date()
      })
    } else {
      const oldAccount = await accounts.find(oldAccountId)
      const newAccount = await accounts.find(newAccountId)
      await oldAccount.update((a) => {
        a.balance = a.balance + reverseOldDelta
        a.updatedAt = new Date()
      })
      await newAccount.update((a) => {
        a.balance = a.balance + forwardNewDelta
        a.updatedAt = new Date()
      })
    }

    return updatedTransaction
  })
}

export const updateTransactionModelById = async (
  id: string,
  updates: Partial<TransactionFormValues>,
): Promise<TransactionModel> => {
  const transaction = await findTransactionModel(id)
  if (!transaction) {
    throw new Error(`Transaction with id ${id} not found`)
  }
  return updateTransactionModel(transaction, updates)
}

/* ------------------------------------------------------------------ */
/* DELETE */
/* ------------------------------------------------------------------ */

export const deleteTransactionModel = async (
  transaction: TransactionModel,
): Promise<void> => {
  const categories = database.get<CategoryModel>("categories")

  return database.write(async () => {
    if (!transaction.isDeleted) {
      if (transaction.categoryId) {
        const category = await categories.find(transaction.categoryId)
        await category.update((c) => {
          c.transactionCount = Math.max(0, c.transactionCount - 1)
          c.updatedAt = new Date()
        })
      }

      const reverseDelta = -getBalanceDelta(
        transaction.amount,
        transaction.type,
      )
      const account = await accountsCollection().find(transaction.accountId)
      await account.update((a) => {
        a.balance = a.balance + reverseDelta
        a.updatedAt = new Date()
      })
    }

    // Use our is_deleted column so the record still appears in trash queries.
    // WatermelonDB's markAsDeleted() sets _status = 'deleted' and hides the record from all queries.
    await transaction.update((t) => {
      t.isDeleted = true
      t.updatedAt = new Date()
    })
  })
}

/**
 * Restore a soft-deleted transaction: set is_deleted = false, re-add balance to
 * account, and re-increment category transaction count.
 */
export const restoreTransactionModel = async (
  transaction: TransactionModel,
): Promise<void> => {
  if (!transaction.isDeleted) return
  const categories = database.get<CategoryModel>("categories")

  return database.write(async () => {
    await transaction.update((t) => {
      t.isDeleted = false
      t.updatedAt = new Date()
    })

    const balanceDelta = getBalanceDelta(transaction.amount, transaction.type)
    const account = await accountsCollection().find(transaction.accountId)
    await account.update((a) => {
      a.balance = a.balance + balanceDelta
      a.updatedAt = new Date()
    })

    if (transaction.categoryId) {
      const category = await categories.find(transaction.categoryId)
      await category.update((c) => {
        c.transactionCount += 1
        c.updatedAt = new Date()
      })
    }
  })
}

export const destroyTransactionModel = async (
  transaction: TransactionModel,
): Promise<void> => {
  const categories = database.get<CategoryModel>("categories")

  return database.write(async () => {
    if (!transaction.isDeleted && transaction.categoryId) {
      const category = await categories.find(transaction.categoryId)
      await category.update((c) => {
        c.transactionCount = Math.max(0, c.transactionCount - 1)
        c.updatedAt = new Date()
      })
    }

    if (!transaction.isDeleted) {
      const reverseDelta = -getBalanceDelta(
        transaction.amount,
        transaction.type,
      )
      const account = await accountsCollection().find(transaction.accountId)
      await account.update((a) => {
        a.balance = a.balance + reverseDelta
        a.updatedAt = new Date()
      })
    }

    await transaction.destroyPermanently()
  })
}
