import { Q } from "@nozbe/watermelondb"

import type { TransactionFormValues } from "~/schemas/transactions.schema"
import { usePendingTransactionsStore } from "~/stores/pending-transactions.store"
import { TransactionTypeEnum } from "~/types/transactions"
import { logger } from "~/utils/logger"
import { nextAbsoluteOccurrence } from "~/utils/recurrence"

import { database } from "../index"
import type RecurringTransactionModel from "../models/RecurringTransaction"
import type TransactionModel from "../models/Transaction"
import type TransactionTagModel from "../models/TransactionTag"
import {
  createTransactionModel,
  deleteTransactionModel,
  findTransactionModel,
  updateTransactionModel,
} from "./transaction-service"

/**
 * Scope for recurring edit/delete, matching flow project's RecurringUpdateMode.
 * - current: only this occurrence
 * - thisAndFuture: this occurrence and all future ones (by recurringInitialDate)
 * - all: all occurrences in the series
 */
export type RecurringUpdateMode = "current" | "thisAndFuture" | "all"

function getRecurringTransactionsCollection() {
  return database.get<RecurringTransactionModel>("recurring_transactions")
}

/** Find a recurring template by WatermelonDB id. Returns null when not found. */
export async function findRecurringById(
  id: string,
): Promise<RecurringTransactionModel | null> {
  try {
    return await getRecurringTransactionsCollection().find(id)
  } catch {
    return null
  }
}

/**
 * Active recurrings: disabled is null or false.
 * Matches Flutter's `disabled.isNull().or(disabled.notEquals(true))`.
 */
export async function getActiveRecurringTransactions(): Promise<
  RecurringTransactionModel[]
> {
  return getRecurringTransactionsCollection()
    .query(Q.where("disabled", Q.notEq(true)))
    .fetch()
}

function getInitialDateMs(t: TransactionModel): number {
  const raw = t.extra?.recurringInitialDate
  if (!raw) return t.transactionDate.getTime()
  const n = Number.parseInt(raw, 10)
  return Number.isNaN(n) ? t.transactionDate.getTime() : n
}

/**
 * Related transactions for a recurring template (by recurring_id column).
 * Excludes soft-deleted (trashed) transactions. Sorted by recurringInitialDate asc.
 */
export async function getRelatedTransactionsByRecurringId(
  recurringId: string,
): Promise<TransactionModel[]> {
  const transactions = await database
    .get<TransactionModel>("transactions")
    .query(Q.where("recurring_id", recurringId), Q.where("is_deleted", false))
    .fetch()
  transactions.sort((a, b) => getInitialDateMs(a) - getInitialDateMs(b))
  return transactions
}

/**
 * Get the recurring template and related transactions for a given transaction and mode.
 * Matches flow's findRelatedTransactionsByMode. Throws if transaction has no recurring extension.
 */
export async function findRelatedTransactionsByMode(
  transaction: TransactionModel,
  mode: RecurringUpdateMode,
): Promise<{
  recurring: RecurringTransactionModel
  transactions: TransactionModel[]
}> {
  const recurringId = transaction.recurringId ?? transaction.extra?.recurringId
  if (!recurringId) {
    throw new Error("Transaction does not have a recurring extension")
  }

  const recurring = await findRecurringById(recurringId)
  if (!recurring) {
    throw new Error(
      `Recurring template not found for transaction: ${transaction.id}`,
    )
  }

  const allRelated = await getRelatedTransactionsByRecurringId(recurring.id)

  if (mode === "current") {
    return { recurring, transactions: [transaction] }
  }

  if (mode === "all") {
    return { recurring, transactions: allRelated }
  }

  // thisAndFuture: from this transaction's occurrence onward (inclusive)
  const cutoffMs = getInitialDateMs(transaction)
  const filtered = allRelated.filter((t) => getInitialDateMs(t) >= cutoffMs)
  return { recurring, transactions: filtered }
}

/**
 * Set lastGeneratedTransactionDate on a recurring template so sync will generate after this date.
 */
export async function updateRecurringLastGenerated(
  recurring: RecurringTransactionModel,
  date: Date,
): Promise<void> {
  await database.write(async () => {
    await recurring.update((r) => {
      r.lastGeneratedTransactionDate = date
    })
  })
}

/**
 * Apply "edit this and future" for a recurring instance.
 *
 * Matches Flutter's full `_update()` → `thisAndFuture` path:
 * 1. Find related transactions from this occurrence onward.
 * 2. Soft-delete every *future pending* occurrence (not this one).
 * 3. Set lastGeneratedTransactionDate back to this occurrence so sync
 *    won't re-generate the deleted ones.
 * 4. Optionally update the recurring template (amount, category, etc.)
 *    and its recurrence rules, then re-sync so one new future occurrence
 *    is generated from the updated template.
 */
export async function applyRecurringEditThisAndFuture(
  transaction: TransactionModel,
  templateUpdates?: {
    jsonTransactionTemplate?: string
    transferToAccountId?: string | null
    rangeEncoded?: string
    rulesEncoded?: string
  },
): Promise<void> {
  const { recurring, transactions } = await findRelatedTransactionsByMode(
    transaction,
    "thisAndFuture",
  )
  const initialDateMs = getInitialDateMs(transaction)

  // Future pending only: same as flow's futureRelatedRecurringTransactionsToDelete
  const toRemove = transactions.filter(
    (t) =>
      t.id !== transaction.id &&
      t.isPending &&
      getInitialDateMs(t) > initialDateMs,
  )

  let hasDeletedFuture = false
  for (const t of toRemove) {
    try {
      await deleteTransactionModel(t)
      hasDeletedFuture = true
    } catch (e) {
      logger.error("Failed to delete future recurring occurrence", {
        transactionId: t.id,
        error: e instanceof Error ? e.message : String(e),
      })
    }
  }

  // Reset lastGenerated so sync generates from this point forward
  if (hasDeletedFuture) {
    await updateRecurringLastGenerated(recurring, new Date(initialDateMs))
  }

  // Update the recurring template with new values and re-sync, matching
  // Flutter's `RecurringTransactionsService().updateSync(recurringTransaction)`
  const hasTemplateUpdates =
    templateUpdates &&
    Object.values(templateUpdates).some((v) => v !== undefined)
  if (hasTemplateUpdates || hasDeletedFuture) {
    await database.write(async () => {
      await recurring.update((r) => {
        if (templateUpdates?.jsonTransactionTemplate !== undefined)
          r.jsonTransactionTemplate = templateUpdates.jsonTransactionTemplate
        if (templateUpdates?.transferToAccountId !== undefined)
          r.transferToAccountId = templateUpdates.transferToAccountId
        if (templateUpdates?.rangeEncoded !== undefined)
          r.rangeEncoded = templateUpdates.rangeEncoded
        if (templateUpdates?.rulesEncoded !== undefined)
          r.rulesEncoded = templateUpdates.rulesEncoded
      })
    })
    // Re-sync so a new future occurrence is generated from the updated template.
    await synchronizeRecurringTransaction(recurring)
  }
}

/**
 * Generate the next occurrence for a recurring template and save it.
 *
 * Port of Flutter's RecurringTransactionsService._synchronize():
 * - ONE-AHEAD POLICY: if lastGenerated >= anchor → stop (already have a future occurrence).
 * - NO-DUPLICATE: if nextOccurrence <= lastGenerated → stop.
 * - EFFECTIVE-LAST: double-check against related transactions (tag-based).
 * - CATCH-UP: if the generated occurrence is still in the past, recurse.
 */
export async function synchronizeRecurringTransaction(
  recurring: RecurringTransactionModel,
  anchor: Date = new Date(),
): Promise<void> {
  if (recurring.disabled) return

  // Flutter wraps the entire sync body in try-catch so one failure doesn't
  // break the entire sync loop.  Match that here.
  try {
    const range = recurring.timeRange
    const rules = recurring.recurrenceRules
    const lastGenerated = recurring.lastGeneratedTransactionDate
    const fromDate = new Date(range.from)

    // ── Flutter guard 1: ONE-AHEAD POLICY ────────────────────────────
    // If we already generated an occurrence at or past the anchor, we
    // have one future occurrence — stop.  This is the critical guard
    // that prevents generating 5-6 transactions when sync runs multiple
    // times.
    if (lastGenerated && lastGenerated.getTime() >= anchor.getTime()) {
      return
    }

    // ── Compute next-occurrence anchor (matches Flutter logic) ───────
    let nextAnchor: Date
    if (lastGenerated) {
      nextAnchor = lastGenerated
    } else {
      // No lastGenerated → first sync.  Use the earlier of (anchor,
      // range.from) so we can catch up missed past occurrences, matching
      // Flutter's min(anchor.date, range.from.date)
      const earlier = Math.min(anchor.getTime(), fromDate.getTime())
      nextAnchor = new Date(earlier)
    }

    const nextOccurrence = nextAbsoluteOccurrence(rules, range, nextAnchor)
    if (!nextOccurrence) return

    // ── Flutter guard 2: NO-DUPLICATE ────────────────────────────────
    // nextOccurrence must be strictly after lastGenerated.
    if (lastGenerated && nextOccurrence.getTime() <= lastGenerated.getTime()) {
      return
    }

    // ── Effective-last from related transactions ──────────────────────
    const related = await getRelatedTransactionsByRecurringId(recurring.id)
    const effectiveLast = related.length
      ? new Date(Math.max(...related.map(getInitialDateMs)))
      : null

    if (effectiveLast && nextOccurrence.getTime() <= effectiveLast.getTime())
      return

    const template = recurring.template
    const isTransfer = Boolean(recurring.transferToAccountId)

    // Match Flutter behavior: future occurrences are pending only when
    // requireConfirmation is on; past occurrences (backfill) are always
    // confirmed (isPending = false).
    const isPending =
      nextOccurrence.getTime() > anchor.getTime()
        ? usePendingTransactionsStore.getState().requireConfirmation
        : false

    const extra: Record<string, string> = {
      ...template.extra,
      recurringId: recurring.id,
      recurringInitialDate: String(nextOccurrence.getTime()),
    }

    if (!isTransfer) {
      const data: TransactionFormValues = {
        amount: template.amount,
        type: template.type as "expense" | "income" | "transfer",
        transactionDate: nextOccurrence,
        accountId: template.accountId,
        categoryId: template.categoryId ?? undefined,
        title: template.title,
        description: template.description,
        subtype: template.subtype,
        tags: template.tags ?? [],
        recurringId: recurring.id,
        extra,
        isPending,
      }
      await createTransactionModel(data)
    } else {
      const fromAccountId = template.accountId
      const toAccountId = recurring.transferToAccountId
      if (!toAccountId)
        throw new Error("Recurring transfer missing transferToAccountId")
      const amount = template.amount
      const outData: TransactionFormValues = {
        amount,
        type: TransactionTypeEnum.TRANSFER,
        transactionDate: nextOccurrence,
        accountId: fromAccountId,
        categoryId: null,
        title: template.title,
        description: template.description,
        subtype: template.subtype,
        tags: template.tags ?? [],
        recurringId: recurring.id,
        extra,
        isPending,
      }
      const inData: TransactionFormValues = {
        amount,
        type: TransactionTypeEnum.TRANSFER,
        transactionDate: nextOccurrence,
        accountId: toAccountId,
        categoryId: null,
        title: template.title,
        description: template.description,
        subtype: template.subtype,
        tags: template.tags ?? [],
        recurringId: recurring.id,
        extra: { ...extra },
        isPending,
      }
      await createTransactionModel(outData)
      await createTransactionModel(inData)
      // TODO: link transfer pair via extra.transferPairId when we have both ids
    }

    // ── Update lastGeneratedTransactionDate ──────────────────────────
    await database.write(async () => {
      await recurring.update((r) => {
        r.lastGeneratedTransactionDate = nextOccurrence
      })
    })

    // ── CATCH-UP: if the generated occurrence is still in the past,
    //    recurse to fill in the next one.  The ONE-AHEAD guard at the
    //    top will stop us once we've generated one at-or-past anchor. ──
    if (nextOccurrence.getTime() < anchor.getTime()) {
      await synchronizeRecurringTransaction(recurring, anchor)
    }
  } catch (e) {
    // Match Flutter: log and continue — don't break the sync loop.
    logger.error("Failed to synchronize recurring transaction", {
      recurringId: recurring.id,
      error: e instanceof Error ? e.message : String(e),
    })
  }
}

/* ------------------------------------------------------------------ */
/* Concurrency lock – prevents parallel sync runs from creating dupes  */
/* ------------------------------------------------------------------ */

let _syncRunning = false

export async function synchronizeAllRecurringTransactions(
  anchor: Date = new Date(),
): Promise<void> {
  if (_syncRunning) return
  _syncRunning = true
  try {
    const list = await getActiveRecurringTransactions()
    for (const r of list) {
      await synchronizeRecurringTransaction(r, anchor)
    }
  } finally {
    _syncRunning = false
  }
}

export interface CreateRecurringFromTransactionOptions {
  transferToAccountId?: string
}

export interface RecurrenceInput {
  range: { from: number; to: number }
  rules: string[] // RRULE strings
}

/**
 * Create a RecurringTransaction from an existing transaction.
 * The transaction's date is used as lastGeneratedTransactionDate (first occurrence).
 */
export async function createRecurringFromTransaction(
  transactionId: string,
  recurrence: RecurrenceInput,
  options: CreateRecurringFromTransactionOptions = {},
): Promise<RecurringTransactionModel> {
  const transaction = await findTransactionModel(transactionId)
  if (!transaction) {
    throw new Error(`Transaction with id ${transactionId} not found`)
  }

  const template: import("../models/RecurringTransaction").RecurringTransactionTemplate =
    {
      amount: transaction.amount,
      type: transaction.type,
      accountId: transaction.accountId,
      categoryId: transaction.categoryId ?? null,
      title: transaction.title,
      description: transaction.description,
      subtype: transaction.subtype,
      extra: transaction.extra,
    }

  const tags = await database
    .get<TransactionTagModel>("transaction_tags")
    .query(Q.where("transaction_id", transactionId))
    .fetch()
  if (tags.length) {
    template.tags = tags.map((t) => t.tagId)
  }

  const rangeEncoded = JSON.stringify(recurrence.range)
  const rulesEncoded = JSON.stringify(recurrence.rules)

  let created: RecurringTransactionModel | null = null
  await database.write(async () => {
    const coll = getRecurringTransactionsCollection()
    created = await coll.create((r) => {
      r.jsonTransactionTemplate = JSON.stringify(template)
      r.transferToAccountId = options.transferToAccountId ?? null
      r.rangeEncoded = rangeEncoded
      r.rulesEncoded = rulesEncoded
      r.createdAt = new Date()
      r.lastGeneratedTransactionDate = transaction.transactionDate
      r.disabled = false
    })
  })
  if (!created) throw new Error("Failed to create RecurringTransaction")
  const recurringModel = created as RecurringTransactionModel

  // Mark the source transaction as the first recurring instance (recurring_id + extra for ordering)
  const existingTagIds = tags.map((t) => t.tagId)
  const newExtra: Record<string, string> = {
    ...(transaction.extra ?? {}),
    recurringId: recurringModel.id,
    recurringInitialDate: String(transaction.transactionDate.getTime()),
  }
  await updateTransactionModel(transaction, {
    extra: newExtra,
    recurringId: recurringModel.id,
    tags: existingTagIds,
  })

  await synchronizeAllRecurringTransactions()
  return recurringModel
}

export async function updateRecurringTransaction(
  recurring: RecurringTransactionModel,
  updates: {
    jsonTransactionTemplate?: string
    transferToAccountId?: string | null
    rangeEncoded?: string
    rulesEncoded?: string
    disabled?: boolean
  },
): Promise<RecurringTransactionModel> {
  await database.write(async () => {
    await recurring.update((r) => {
      if (updates.jsonTransactionTemplate !== undefined)
        r.jsonTransactionTemplate = updates.jsonTransactionTemplate
      if (updates.transferToAccountId !== undefined)
        r.transferToAccountId = updates.transferToAccountId
      if (updates.rangeEncoded !== undefined)
        r.rangeEncoded = updates.rangeEncoded
      if (updates.rulesEncoded !== undefined)
        r.rulesEncoded = updates.rulesEncoded
      if (updates.disabled !== undefined) r.disabled = updates.disabled
    })
  })
  await synchronizeRecurringTransaction(recurring)
  return recurring
}

/**
 * Delete a recurring template. Allowed only if there are no related (generated) transactions.
 */
export async function deleteRecurringTransaction(
  recurring: RecurringTransactionModel,
): Promise<void> {
  const related = await getRelatedTransactionsByRecurringId(recurring.id)
  if (related.length > 0) {
    throw new Error(
      "Cannot delete recurring template: it has generated transactions. Use RecurringUpdateMode (current / thisAndFuture / all) from UI.",
    )
  }
  await database.write(async () => {
    await recurring.destroyPermanently()
  })
}
