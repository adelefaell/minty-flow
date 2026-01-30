import { Q } from "@nozbe/watermelondb"
import type { Observable } from "@nozbe/watermelondb/utils/rx"

import type {
  AddAccountsFormSchema,
  UpdateAccountsFormSchema,
} from "~/schemas/accounts.schema"

import { database } from "../index"
import type AccountModel from "../models/Account"

/**
 * Account Service
 *
 * Provides functions for managing account data.
 * Follows WatermelonDB CRUD pattern: https://watermelondb.dev/docs/CRUD
 */

/**
 * Get the accounts collection
 */
const getAccountCollection = () => {
  return database.get<AccountModel>("accounts")
}

/**
 * Get all accounts
 */
export const getAccounts = async (
  includeArchived = false,
): Promise<AccountModel[]> => {
  const accounts = getAccountCollection()
  if (includeArchived) {
    return await accounts.query(Q.sortBy("sort_order", Q.asc)).fetch()
  }
  return await accounts
    .query(Q.where("is_archived", false), Q.sortBy("sort_order", Q.asc))
    .fetch()
}

/**
 * Get all accounts
 */
export const observeArchivedAccounts = () =>
  getAccountCollection()
    .query(Q.where("is_archived", true), Q.sortBy("sort_order", Q.asc))
    .observe()

/**
 * Find an account by ID
 */
export const findAccount = async (id: string): Promise<AccountModel | null> => {
  try {
    return await getAccountCollection().find(id)
  } catch {
    return null
  }
}

/**
 * Observe all accounts reactively
 */
export const observeAccounts = (
  includeArchived = false,
): Observable<AccountModel[]> => {
  const accounts = getAccountCollection()
  if (includeArchived) {
    return accounts.query(Q.sortBy("sort_order", Q.asc)).observe()
  }
  return accounts
    .query(Q.where("is_archived", false), Q.sortBy("sort_order", Q.asc))
    .observe()
}

/**
 * Observe a specific account by ID
 */
export const observeAccountById = (id: string): Observable<AccountModel> => {
  return getAccountCollection().findAndObserve(id)
}

/**
 * Create a new account
 */
export const createAccount = async (
  data: AddAccountsFormSchema,
): Promise<AccountModel> => {
  // Get the last account's sort order to append the new one at the end
  const lastAccount = await getAccountCollection()
    .query(Q.sortBy("sort_order", Q.desc), Q.take(1))
    .fetch()
  const nextSortOrder =
    lastAccount.length > 0 ? (lastAccount[0].sortOrder || 0) + 1 : 0

  return await database.write(async () => {
    return await getAccountCollection().create((account) => {
      account.name = data.name
      account.type = data.type
      account.balance = data.balance
      account.currencyCode = data.currencyCode
      account.icon = data.icon
      account.colorSchemeName = data.colorSchemeName
      account.isPrimary = data.isPrimary
      account.sortOrder = nextSortOrder
      account.excludeFromBalance = data.excludeFromBalance
    })
  })
}

/**
 * Update account
 */
export const updateAccount = async (
  account: AccountModel,
  updates: Partial<UpdateAccountsFormSchema>,
): Promise<AccountModel> => {
  return await database.write(async () => {
    return await account.update((a) => {
      if (updates.name !== undefined) a.name = updates.name
      if (updates.type !== undefined) a.type = updates.type
      if (updates.balance !== undefined) a.balance = updates.balance
      if (updates.currencyCode !== undefined)
        a.currencyCode = updates.currencyCode
      if (updates.icon !== undefined) a.icon = updates.icon
      if (updates.colorSchemeName !== undefined)
        a.colorSchemeName = updates.colorSchemeName
      if (updates.isArchived !== undefined) a.isArchived = updates.isArchived
      if (updates.isPrimary !== undefined) a.isPrimary = updates.isPrimary
      if (updates.excludeFromBalance !== undefined)
        a.excludeFromBalance = updates.excludeFromBalance
      a.updatedAt = new Date()
    })
  })
}

/**
 * Update account by ID
 */
export const updateAccountById = async (
  id: string,
  updates: Partial<UpdateAccountsFormSchema>,
): Promise<AccountModel> => {
  const account = await findAccount(id)
  if (!account) {
    throw new Error(`Account with id ${id} not found`)
  }
  return await updateAccount(account, updates)
}

/**
 * Delete account (mark as deleted for sync)
 */
export const deleteAccount = async (account: AccountModel): Promise<void> => {
  await database.write(async () => {
    await account.markAsDeleted()
  })
}

/**
 * Permanently destroy account
 */
export const destroyAccount = async (account: AccountModel): Promise<void> => {
  await database.write(async () => {
    await account.destroyPermanently()
  })
}

/**
 * Update the order of accounts
 */
export const updateAccountsOrder = async (
  accounts: AccountModel[],
): Promise<void> => {
  await database.write(async () => {
    const updates = accounts.map((account, index) =>
      account.prepareUpdate((a) => {
        a.sortOrder = index
      }),
    )
    await database.batch(...updates)
  })
}
