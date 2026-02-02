import { Q } from "@nozbe/watermelondb"
import type { Observable } from "rxjs"

import { database } from "../index"
import type AccountModel from "../models/Account"
import type CategoryModel from "../models/Category"
import type TransactionModel from "../models/Transaction"

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
  type?: "expense" | "income" | "transfer"
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
  type?: "expense" | "income" | "transfer"
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
 * Create a new transaction
 */
// export const createTransactionModel = async (data: {
//   amount: number
//   currencyCode: string
//   type: "expense" | "income" | "transfer"
//   date: Date
//   categoryId?: string | null
//   accountId: string
//   description?: string
//   tags?: string[]
//   location?: { latitude: number; longitude: number; address?: string }
//   isPending?: boolean
// }): Promise<TransactionModel> => {
//   const transactions = getTransactionModelCollection()
//   const categories = database.get<CategoryModel>("categories")
//   const accounts = database.get<AccountModel>("accounts")

//   return await database.write(async () => {
//     // Fetch related models
//     let category: CategoryModel | null = null
//     if (data.categoryId) {
//       category = await categories.find(data.categoryId)
//       if (!category) {
//         throw new Error(`Category with id ${data.categoryId} not found`)
//       }
//     }

//     const account = await accounts.find(data.accountId)
//     if (!account) {
//       throw new Error(`Account with id ${data.accountId} not found`)
//     }

//     const transaction = await transactions.create((t) => {
//       t.amount = data.amount
//       t.currencyCode = data.currencyCode
//       t.type = data.type
//       t.date = data.date
//       // Set relations by assigning the model instances (null for uncategorized)
//       t.category = category
//       t.account = account
//       t.description = data.description
//       t.isPending = data.isPending || false
//       t.isDeleted = false
//       t.createdAt = new Date()
//       t.updatedAt = new Date()
//       if (data.tags) {
//         t.tags = data.tags
//       }
//       if (data.location) {
//         t.location = data.location
//       }
//     })

//     // Update category transaction count if category exists
//     if (category) {
//       await category.update((c) => {
//         c.transactionCount += 1
//         c.updatedAt = new Date()
//       })
//     }

//     return transaction
//   })
// }

/**
 * Update transaction
 */
// export const updateTransactionModel = async (
//   transaction: TransactionModel,
//   updates: Partial<{
//     amount: number
//     currencyCode: string
//     type: "expense" | "income" | "transfer"
//     date: Date
//     description: string | undefined
//     isPending: boolean
//     categoryId: string | null
//     accountId: string
//   }>,
// ): Promise<TransactionModel> => {
//   const categories = database.get<CategoryModel>("categories")

//   return await database.write(async () => {
//     // Track old category for count update
//     const oldCategoryId = transaction.categoryId
//     let oldCategory: CategoryModel | null = null
//     if (oldCategoryId) {
//       try {
//         oldCategory = await categories.find(oldCategoryId)
//       } catch {
//         // Category might not exist, ignore
//       }
//     }

//     const updatedTransaction = await transaction.update(async (t) => {
//       if (updates.amount !== undefined) t.amount = updates.amount
//       if (updates.currencyCode !== undefined)
//         t.currencyCode = updates.currencyCode
//       if (updates.type !== undefined) t.type = updates.type
//       if (updates.date !== undefined) t.date = updates.date
//       if (updates.description !== undefined) t.description = updates.description
//       if (updates.isPending !== undefined) t.isPending = updates.isPending

//       // Handle relation updates
//       if (updates.categoryId !== undefined) {
//         if (updates.categoryId) {
//           const category = await categories.find(updates.categoryId)
//           if (category) {
//             t.category = category
//           }
//         } else {
//           // Set to null for uncategorized
//           t.categoryId = null
//         }
//       }
//       if (updates.accountId) {
//         const account = await database
//           .get<AccountModel>("accounts")
//           .find(updates.accountId)
//         if (account) {
//           t.account = account
//         }
//       }

//       t.updatedAt = new Date()
//     })

//     // Update category transaction counts if category changed
//     if (
//       updates.categoryId !== undefined &&
//       oldCategoryId !== updates.categoryId
//     ) {
//       // Decrement old category count (only if transaction was not deleted)
//       if (oldCategory && !transaction.isDeleted) {
//         await oldCategory.update((c) => {
//           c.transactionCount = Math.max(0, c.transactionCount - 1)
//           c.updatedAt = new Date()
//         })
//       }

//       // Increment new category count (only if new category is not null)
//       if (updates.categoryId && !transaction.isDeleted) {
//         const newCategory = await categories.find(updates.categoryId)
//         if (newCategory) {
//           await newCategory.update((c) => {
//             c.transactionCount += 1
//             c.updatedAt = new Date()
//           })
//         }
//       }
//     }

//     return updatedTransaction
//   })
// }

/**
 * Update transaction by ID
 */
// export const updateTransactionModelById = async (
//   id: string,
//   updates: Partial<{
//     amount: number
//     currencyCode: string
//     type: "expense" | "income" | "transfer"
//     date: Date
//     description: string | undefined
//     isPending: boolean
//     categoryId: string | null
//     accountId: string
//   }>,
// ): Promise<TransactionModel> => {
//   const transaction = await findTransactionModel(id)
//   if (!transaction) {
//     throw new Error(`TransactionModel with id ${id} not found`)
//   }
//   return await updateTransactionModel(transaction, updates)
// }

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
