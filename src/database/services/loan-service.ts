import { Q } from "@nozbe/watermelondb"
import type { Observable } from "@nozbe/watermelondb/utils/rx"

import { database } from "../index"
import type AccountModel from "../models/account"
import type LoanModel from "../models/loan"

/**
 * LoanModel Service
 *
 * Provides functions for managing loan data.
 * Follows WatermelonDB CRUD pattern: https://watermelondb.dev/docs/CRUD
 */

/**
 * Get the loans collection
 */
const getLoanModelCollection = () => {
  return database.get<LoanModel>("loans")
}

/**
 * Get loans with optional filters
 */
export const getLoanModels = async (filters?: {
  loanType?: "borrowed" | "lent"
  isPaid?: boolean
  includeArchived?: boolean
}): Promise<LoanModel[]> => {
  const loans = getLoanModelCollection()
  let query = loans.query()

  if (filters?.loanType) {
    query = query.extend(Q.where("loan_type", filters.loanType))
  }
  if (filters?.isPaid !== undefined) {
    query = query.extend(Q.where("is_paid", filters.isPaid))
  }
  if (!filters?.includeArchived) {
    query = query.extend(Q.where("is_archived", false))
  }

  return await query.fetch()
}

/**
 * Find a loan by ID
 */
export const findLoanModel = async (id: string): Promise<LoanModel | null> => {
  try {
    return await getLoanModelCollection().find(id)
  } catch {
    return null
  }
}

/**
 * Observe loans reactively with optional filters
 */
export const observeLoanModels = (filters?: {
  loanType?: "borrowed" | "lent"
  isPaid?: boolean
  includeArchived?: boolean
}): Observable<LoanModel[]> => {
  const loans = getLoanModelCollection()
  let query = loans.query()

  if (filters?.loanType) {
    query = query.extend(Q.where("loan_type", filters.loanType))
  }
  if (filters?.isPaid !== undefined) {
    query = query.extend(Q.where("is_paid", filters.isPaid))
  }
  if (!filters?.includeArchived) {
    query = query.extend(Q.where("is_archived", false))
  }

  return query.observe()
}

/**
 * Observe a specific loan by ID
 */
export const observeLoanModelById = (id: string): Observable<LoanModel> => {
  return getLoanModelCollection().findAndObserve(id)
}

/**
 * Create a new loan
 */
export const createLoanModel = async (data: {
  name: string
  description?: string
  principalAmount: number
  remainingAmount?: number
  interestRate?: number
  currencyCode: string
  loanType: "borrowed" | "lent"
  contactName?: string
  contactPhone?: string
  dueDate?: Date
  accountId?: string
}): Promise<LoanModel> => {
  const loans = getLoanModelCollection()

  return await database.write(async () => {
    // Validate account if provided
    if (data.accountId) {
      const accounts = database.get<AccountModel>("accounts")
      const account = await accounts.find(data.accountId)
      if (!account) {
        throw new Error(`Account with id ${data.accountId} not found`)
      }
    }

    return await loans.create((loan) => {
      loan.name = data.name
      loan.description = data.description
      loan.principalAmount = data.principalAmount
      loan.remainingAmount = data.remainingAmount ?? data.principalAmount
      loan.interestRate = data.interestRate
      loan.currencyCode = data.currencyCode
      loan.loanType = data.loanType
      loan.contactName = data.contactName
      loan.contactPhone = data.contactPhone
      loan.dueDate = data.dueDate
      loan.accountId = data.accountId
      loan.isPaid = false
      loan.isArchived = false
      loan.createdAt = new Date()
      loan.updatedAt = new Date()
    })
  })
}

/**
 * Update loan
 */
export const updateLoanModel = async (
  loan: LoanModel,
  updates: Partial<{
    name: string
    description: string | undefined
    remainingAmount: number
    interestRate: number | undefined
    contactName: string | undefined
    contactPhone: string | undefined
    dueDate: Date | undefined
    isPaid: boolean
    isArchived: boolean
  }>,
): Promise<LoanModel> => {
  return await database.write(async () => {
    return await loan.update((l) => {
      if (updates.name !== undefined) l.name = updates.name
      if (updates.description !== undefined) l.description = updates.description
      if (updates.remainingAmount !== undefined)
        l.remainingAmount = updates.remainingAmount
      if (updates.interestRate !== undefined)
        l.interestRate = updates.interestRate
      if (updates.contactName !== undefined) l.contactName = updates.contactName
      if (updates.contactPhone !== undefined)
        l.contactPhone = updates.contactPhone
      if (updates.dueDate !== undefined) l.dueDate = updates.dueDate
      if (updates.isPaid !== undefined) l.isPaid = updates.isPaid
      if (updates.isArchived !== undefined) l.isArchived = updates.isArchived
      l.updatedAt = new Date()
    })
  })
}

/**
 * Update loan by ID
 */
export const updateLoanModelById = async (
  id: string,
  updates: Partial<{
    name: string
    description: string | undefined
    remainingAmount: number
    interestRate: number | undefined
    contactName: string | undefined
    contactPhone: string | undefined
    dueDate: Date | undefined
    isPaid: boolean
    isArchived: boolean
  }>,
): Promise<LoanModel> => {
  const loan = await findLoanModel(id)
  if (!loan) {
    throw new Error(`LoanModel with id ${id} not found`)
  }
  return await updateLoanModel(loan, updates)
}

/**
 * Record a payment on a loan
 */
export const recordLoanModelPayment = async (
  loan: LoanModel,
  amount: number,
): Promise<LoanModel> => {
  const newRemaining = Math.max(0, loan.remainingAmount - amount)
  const isPaid = newRemaining === 0
  return await updateLoanModel(loan, {
    remainingAmount: newRemaining,
    isPaid,
  })
}

/**
 * Mark loan as paid
 */
export const markLoanModelAsPaid = async (
  loan: LoanModel,
): Promise<LoanModel> => {
  return await updateLoanModel(loan, {
    remainingAmount: 0,
    isPaid: true,
  })
}

/**
 * Permanently destroy loan
 */
export const destroyLoanModel = async (loan: LoanModel): Promise<void> => {
  await database.write(async () => {
    await loan.destroyPermanently()
  })
}
