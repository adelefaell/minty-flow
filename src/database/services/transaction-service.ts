import { Q } from "@nozbe/watermelondb"
import type { Observable } from "rxjs"
import { map } from "rxjs/operators"

import type { TransactionFormValues } from "~/schemas/transactions.schema"
import type { TransactionType } from "~/types/transactions"

import { database } from "../index"
import type AccountModel from "../models/Account"
import type CategoryModel from "../models/Category"
import type TagModel from "../models/Tag"
import type TransactionModel from "../models/Transaction"
import type TransactionTagModel from "../models/TransactionTag"

/**
 * TransactionModel Service
 *
 * Provides functions for managing transaction data.
 * Follows WatermelonDB CRUD pattern: https://watermelondb.dev/docs/CRUD
 */

/**
 * Get the transactions collection
 */
const getTransactionModelCollection = () => {
  return database.get<TransactionModel>("transactions")
}

/**
 * Get transactions with optional filters
 */
export const getTransactionModels = async (filters?: {
  accountId?: string
  categoryId?: string
  type?: TransactionType
  isPending?: boolean
  includeDeleted?: boolean
}): Promise<TransactionModel[]> => {
  const transactions = getTransactionModelCollection()
  let query = transactions.query()

  if (filters?.accountId) {
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
  if (!filters?.includeDeleted) {
    query = query.extend(Q.where("is_deleted", false))
  }

  return await query.fetch()
}

/**
 * Find a transaction by ID
 */
export const findTransactionModel = async (
  id: string,
): Promise<TransactionModel | null> => {
  try {
    return await getTransactionModelCollection().find(id)
  } catch {
    return null
  }
}

/**
 * Observe transactions reactively with optional filters
 */
export const observeTransactionModels = (filters?: {
  accountId?: string
  categoryId?: string
  type?: TransactionType
  isPending?: boolean
  includeDeleted?: boolean
}): Observable<TransactionModel[]> => {
  const transactions = getTransactionModelCollection()
  let query = transactions.query()

  if (filters?.accountId) {
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
  if (!filters?.includeDeleted) {
    query = query.extend(Q.where("is_deleted", false))
  }

  return query.observe()
}

/**
 * Observe a specific transaction by ID
 */
export const observeTransactionModelById = (
  id: string,
): Observable<TransactionModel> => {
  return getTransactionModelCollection().findAndObserve(id)
}

/**
 * Get tag IDs linked to a transaction (for loading when editing)
 */
export const getTransactionTagIds = async (
  transactionId: string,
): Promise<string[]> => {
  const transactionTags = database.get<TransactionTagModel>("transaction_tags")
  const rows = await transactionTags
    .query(Q.where("transaction_id", transactionId))
    .fetch()
  return rows.map((row) => row.tagId)
}

/**
 * Observe tag IDs linked to a transaction (reactive, for edit screen)
 */
export const observeTransactionTagIds = (
  transactionId: string,
): Observable<string[]> => {
  const transactionTags = database.get<TransactionTagModel>("transaction_tags")
  return transactionTags
    .query(Q.where("transaction_id", transactionId))
    .observe()
    .pipe(map((rows) => rows.map((row) => row.tagId)))
}

/**
 * Create a new transaction
 */
export const createTransactionModel = async (
  data: TransactionFormValues,
): Promise<TransactionModel> => {
  const transactions = getTransactionModelCollection()
  const categories = database.get<CategoryModel>("categories")
  const accounts = database.get<AccountModel>("accounts")

  return await database.write(async () => {
    // Fetch related models
    let category: CategoryModel | null = null
    if (data.categoryId) {
      category = await categories.find(data.categoryId)
      if (!category) {
        throw new Error(`Category with id ${data.categoryId} not found`)
      }
    }

    const account = await accounts.find(data.accountId)
    if (!account) {
      throw new Error(`Account with id ${data.accountId} not found`)
    }

    const transaction = await transactions.create((t) => {
      t.amount = data.amount
      t.currency = account.currencyCode
      t.type = data.type
      t.transactionDate = data.date
      t.category = category
      t.account = account
      if (data.title !== undefined) t.title = data.title
      t.description = data.description
      t.isPending = data.isPending || false
      t.isDeleted = false
      t.createdAt = new Date()
      t.updatedAt = new Date()
      if (data.location) {
        t.location = data.location
      }
      if (data.extra !== undefined) {
        t.extra = data.extra
      }
      if (data.subtype !== undefined) {
        t.subtype = data.subtype
      }
    })

    // Link tags via transaction_tags and update tag usage counts
    const tagIds = data.tags ?? []
    if (tagIds.length > 0) {
      const transactionTags =
        database.get<TransactionTagModel>("transaction_tags")
      const tagsCollection = database.get<TagModel>("tags")
      for (const tagId of tagIds) {
        const tag = await tagsCollection.find(tagId)
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

    // Update category transaction count if category exists
    if (category) {
      await category.update((c) => {
        c.transactionCount += 1
        c.updatedAt = new Date()
      })
    }

    return transaction
  })
}

/**
 * Update transaction
 */
export const updateTransactionModel = async (
  transaction: TransactionModel,
  updates: Partial<TransactionFormValues>,
): Promise<TransactionModel> => {
  const categories = database.get<CategoryModel>("categories")

  return await database.write(async () => {
    // Track old category for count update
    const oldCategoryId = transaction.categoryId
    let oldCategory: CategoryModel | null = null
    if (oldCategoryId) {
      try {
        oldCategory = await categories.find(oldCategoryId)
      } catch {
        // Category might not exist, ignore
      }
    }

    const updatedTransaction = await transaction.update(async (t) => {
      if (updates.amount !== undefined) t.amount = updates.amount
      if (updates.type !== undefined) t.type = updates.type
      if (updates.date !== undefined) t.transactionDate = updates.date
      if (updates.title !== undefined) t.title = updates.title
      if (updates.description !== undefined) t.description = updates.description
      if (updates.isPending !== undefined) t.isPending = updates.isPending

      // Handle relation updates
      if (updates.categoryId !== undefined) {
        if (updates.categoryId) {
          const category = await categories.find(updates.categoryId)
          if (category) {
            t.category = category
          }
        } else {
          // Set to null for uncategorized
          t.categoryId = null
        }
      }
      if (updates.accountId) {
        const account = await database
          .get<AccountModel>("accounts")
          .find(updates.accountId)
        if (account) {
          t.account = account
        }
      }

      t.updatedAt = new Date()
      if (updates.extra !== undefined) {
        t.extra = updates.extra
      }
      if (updates.subtype !== undefined) {
        t.subtype = updates.subtype
      }
    })

    // Update category transaction counts if category changed
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

    // Sync transaction_tags when tags are updated
    if (updates.tags !== undefined) {
      const transactionTags =
        database.get<TransactionTagModel>("transaction_tags")
      const tagsCollection = database.get<TagModel>("tags")
      const existing = await transactionTags
        .query(Q.where("transaction_id", transaction.id))
        .fetch()
      const existingTagIds = new Set(existing.map((tt) => tt.tagId))
      const newTagIds = new Set(updates.tags)

      for (const tt of existing) {
        if (!newTagIds.has(tt.tagId)) {
          const tag = await tagsCollection.find(tt.tagId)
          await tag.update((t) => {
            t.transactionCount = Math.max(0, t.transactionCount - 1)
            t.updatedAt = new Date()
          })
          await tt.destroyPermanently()
        }
      }
      for (const tagId of newTagIds) {
        if (!existingTagIds.has(tagId)) {
          const tag = await tagsCollection.find(tagId)
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

    return updatedTransaction
  })
}

/**
 * Update transaction by ID
 */
export const updateTransactionModelById = async (
  id: string,
  updates: Partial<TransactionFormValues>,
): Promise<TransactionModel> => {
  const transaction = await findTransactionModel(id)
  if (!transaction) {
    throw new Error(`TransactionModel with id ${id} not found`)
  }
  return await updateTransactionModel(transaction, updates)
}

/**
 * Delete transaction (mark as deleted for sync)
 */
export const deleteTransactionModel = async (
  transaction: TransactionModel,
): Promise<void> => {
  const categories = database.get<CategoryModel>("categories")

  return await database.write(async () => {
    // Only decrement count if transaction was not already deleted and has a category
    if (!transaction.isDeleted && transaction.categoryId) {
      try {
        const category = await categories.find(transaction.categoryId)
        if (category) {
          await category.update((c) => {
            c.transactionCount = Math.max(0, c.transactionCount - 1)
            c.updatedAt = new Date()
          })
        }
      } catch {
        // Category might not exist, ignore
      }
    }

    await transaction.markAsDeleted()
  })
}

/**
 * Permanently destroy transaction
 */
export const destroyTransactionModel = async (
  transaction: TransactionModel,
): Promise<void> => {
  const categories = database.get<CategoryModel>("categories")

  return await database.write(async () => {
    // Decrement count if transaction was not deleted and has a category
    if (!transaction.isDeleted && transaction.categoryId) {
      try {
        const category = await categories.find(transaction.categoryId)
        if (category) {
          await category.update((c) => {
            c.transactionCount = Math.max(0, c.transactionCount - 1)
            c.updatedAt = new Date()
          })
        }
      } catch {
        // Category might not exist, ignore
      }
    }

    await transaction.destroyPermanently()
  })
}
