import { useEffect, useState } from "react"

import type TransactionModel from "~/database/models/Transaction"
import {
  getBalanceAtTransaction,
  getBalanceBeforeTransaction,
} from "~/database/services/balance-service"

/**
 * Compute the account balance before a given transaction (read-time).
 * Used on the transaction detail screen. Source-verified: Flow does not store
 * "balance before" on the entity; it is computed dynamically.
 */
export function useBalanceBefore(
  transaction: TransactionModel | null,
): number | null {
  const [balanceBefore, setBalanceBefore] = useState<number | null>(null)

  useEffect(() => {
    if (!transaction) {
      setBalanceBefore(null)
      return
    }
    const ts =
      transaction.transactionDate instanceof Date
        ? transaction.transactionDate.getTime()
        : transaction.transactionDate
    getBalanceBeforeTransaction(transaction.accountId, ts).then(
      setBalanceBefore,
    )
  }, [transaction])

  return balanceBefore
}

/**
 * Returns the account's running balance at the moment this transaction settled.
 * This is what Flow displays next to the account name (balance after = snapshot).
 */
export function useBalanceAtTransaction(
  transaction: TransactionModel | null,
): number | null {
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    if (!transaction) {
      setBalance(null)
      return
    }
    const ts =
      transaction.transactionDate instanceof Date
        ? transaction.transactionDate.getTime()
        : transaction.transactionDate
    getBalanceAtTransaction(transaction.accountId, ts).then(setBalance)
  }, [transaction])

  return balance
}
