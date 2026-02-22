import { Q } from "@nozbe/watermelondb"

import { database } from "../index"
import type TransactionModel from "../models/transaction"

/**
 * Compute the account balance at the moment BEFORE a given transaction.
 * Called when rendering the transaction detail screen (read-time only).
 *
 * Source-verified: Flow does not store "balance before" on the entity; it is
 * computed dynamically at read time. Storing it would require updating it on
 * every edit of earlier transactions.
 *
 * Sums all non-deleted, non-pending transactions for the account with
 * transaction_date strictly less than the given timestamp.
 */
export async function getBalanceBeforeTransaction(
  accountId: string,
  transactionDateMs: number,
): Promise<number> {
  const txs = await database
    .get<TransactionModel>("transactions")
    .query(
      Q.where("account_id", accountId),
      Q.where("is_pending", false),
      Q.where("is_deleted", false),
      Q.where("transaction_date", Q.lt(transactionDateMs)),
    )
    .fetch()

  return txs.reduce((sum, tx) => sum + tx.amount, 0)
}

/**
 * Compute the account's running balance at the moment a transaction settled.
 * This is the value shown next to the account name on the transaction detail screen.
 *
 * Uses `<=` (inclusive) so the transaction itself is included in the sum.
 * Result = balance AFTER this transaction was applied (snapshot behavior).
 *
 * @param accountId       - WatermelonDB id of the account
 * @param transactionDateMs - Unix ms timestamp of the transaction
 */
export async function getBalanceAtTransaction(
  accountId: string,
  transactionDateMs: number,
): Promise<number> {
  const txs = await database
    .get<TransactionModel>("transactions")
    .query(
      Q.where("account_id", accountId),
      Q.where("is_pending", false),
      Q.where("is_deleted", false),
      Q.where("transaction_date", Q.lte(transactionDateMs)),
    )
    .fetch()

  return txs.reduce((sum, tx) => sum + tx.amount, 0)
}

/**
 * Current confirmed balance for an account (includes transfers).
 */
export async function getAccountBalance(accountId: string): Promise<number> {
  const txs = await database
    .get<TransactionModel>("transactions")
    .query(
      Q.where("account_id", accountId),
      Q.where("is_pending", false),
      Q.where("is_deleted", false),
    )
    .fetch()

  return txs.reduce((sum, tx) => sum + tx.amount, 0)
}
