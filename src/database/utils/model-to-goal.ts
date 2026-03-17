import type { Goal } from "~/types/goals"

import type GoalModel from "../models/goal"

/**
 * Convert GoalModel to Goal domain type.
 *
 * accountIds is passed as a parameter because it is derived from the
 * goal_accounts join table by the service layer — not stored on the model itself.
 */
export const modelToGoal = (model: GoalModel, accountIds: string[]): Goal => {
  return {
    id: model.id,
    name: model.name,
    goalType: model.goalType || "savings",
    description: model.description,
    targetAmount: model.targetAmount,
    currencyCode: model.currencyCode,
    targetDate: model.targetDate,
    icon: model.icon,
    colorSchemeName: model.colorSchemeName,
    colorScheme: model.colorScheme, // Computed getter from model
    isArchived: model.isArchived,
    accountIds,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  }
}
