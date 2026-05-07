import { startOfDay, startOfMonth, startOfWeek, startOfYear } from "date-fns"
import type { SQLiteBindValue } from "expo-sqlite"

import type { BudgetPeriod } from "~/types/budgets"
import { BudgetPeriodEnum } from "~/types/budgets"
import { getWeekStartsOn } from "~/utils/get-week-start-on"

import { query, queryOne } from "../sql"
import type {
  RowBudget,
  RowBudgetAccount,
  RowBudgetCategory,
} from "../types/rows"

export async function getAllBudgets(): Promise<RowBudget[]> {
  return query<RowBudget>(`SELECT * FROM budgets ORDER BY name ASC`)
}

export async function getBudgetById(id: string): Promise<RowBudget | null> {
  return queryOne<RowBudget>(`SELECT * FROM budgets WHERE id = ?`, [id])
}

export async function getBudgetAccountIds(budgetId: string): Promise<string[]> {
  const rows = await query<RowBudgetAccount>(
    `SELECT * FROM budget_accounts WHERE budget_id = ?`,
    [budgetId],
  )
  return rows.map((r) => r.account_id)
}

export async function getBudgetCategoryIds(
  budgetId: string,
): Promise<string[]> {
  const rows = await query<RowBudgetCategory>(
    `SELECT * FROM budget_categories WHERE budget_id = ?`,
    [budgetId],
  )
  return rows.map((r) => r.category_id)
}

export function getBudgetPeriodRange(
  period: BudgetPeriod,
  startDateIso: string,
  endDateIso: string | null,
): { periodStart: string; periodEnd: string } {
  const now = new Date()
  const weekStartsOn = getWeekStartsOn()
  let periodStart: Date
  let periodEnd: Date = now

  switch (period) {
    case BudgetPeriodEnum.DAILY:
      periodStart = startOfDay(now)
      break
    case BudgetPeriodEnum.WEEKLY:
      periodStart = startOfWeek(now, { weekStartsOn })
      break
    case BudgetPeriodEnum.MONTHLY:
      periodStart = startOfMonth(now)
      break
    case BudgetPeriodEnum.YEARLY:
      periodStart = startOfYear(now)
      break
    default:
      periodStart = new Date(startDateIso)
      if (endDateIso != null) periodEnd = new Date(endDateIso)
      break
  }

  return {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
  }
}

export async function getBudgetSpent(
  accountIds: string[],
  categoryIds: string[],
  period: BudgetPeriod,
  startDateIso: string,
  endDateIso: string | null,
): Promise<number> {
  if (accountIds.length === 0) return 0

  const { periodStart, periodEnd } = getBudgetPeriodRange(
    period,
    startDateIso,
    endDateIso,
  )

  const conditions = [
    "is_deleted = 0",
    "is_pending = 0",
    "type = 'expense'",
    "is_transfer = 0",
    `account_id IN (${accountIds.map(() => "?").join(",")})`,
    "transaction_date >= ?",
    "transaction_date <= ?",
  ]
  const values: SQLiteBindValue[] = [...accountIds, periodStart, periodEnd]

  if (categoryIds.length > 0) {
    conditions.push(`category_id IN (${categoryIds.map(() => "?").join(",")})`)
    values.push(...categoryIds)
  }

  const row = await queryOne<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE ${conditions.join(" AND ")}`,
    values,
  )
  return row?.total ?? 0
}
