import { Q } from "@nozbe/watermelondb"
import type { Observable } from "@nozbe/watermelondb/utils/rx"

import type { AccountType } from "../../types/accounts"
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
    return await accounts.query().fetch()
  }
  return await accounts.query(Q.where("is_archived", false)).fetch()
}

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
    return accounts.query().observe()
  }
  return accounts.query(Q.where("is_archived", false)).observe()
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
export const createAccount = async (data: {
  name: string
  type: AccountType
  balance: number
  currencyCode: string
  icon?: string
  color?: string
}): Promise<AccountModel> => {
  return await database.write(async () => {
    return await getAccountCollection().create((account) => {
      account.name = data.name
      account.type = data.type
      account.balance = data.balance
      account.currencyCode = data.currencyCode
      account.icon = data.icon
      account.color = data.color
      account.isArchived = false
      account.createdAt = new Date()
      account.updatedAt = new Date()
    })
  })
}

/**
 * Update account
 */
export const updateAccount = async (
  account: AccountModel,
  updates: Partial<{
    name: string
    type: AccountType
    balance: number
    currencyCode: string
    icon: string | undefined
    color: string | undefined
    isArchived: boolean
  }>,
): Promise<AccountModel> => {
  return await database.write(async () => {
    return await account.update((a) => {
      if (updates.name !== undefined) a.name = updates.name
      if (updates.type !== undefined) a.type = updates.type
      if (updates.balance !== undefined) a.balance = updates.balance
      if (updates.currencyCode !== undefined)
        a.currencyCode = updates.currencyCode
      if (updates.icon !== undefined) a.icon = updates.icon
      if (updates.color !== undefined) a.color = updates.color
      if (updates.isArchived !== undefined) a.isArchived = updates.isArchived
      a.updatedAt = new Date()
    })
  })
}

/**
 * Update account by ID
 */
export const updateAccountById = async (
  id: string,
  updates: Partial<{
    name: string
    type: AccountType
    balance: number
    currencyCode: string
    icon: string | undefined
    color: string | undefined
    isArchived: boolean
  }>,
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
