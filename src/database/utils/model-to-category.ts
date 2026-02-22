import type { Category } from "~/types/categories"

import type CategoryModel from "../models/category"

/**
 * Convert CategoryModel to Category domain type
 */
export const modelToCategory = (model: CategoryModel): Category => {
  return {
    id: model.id,
    name: model.name,
    type: model.type,
    icon: model.icon,
    colorSchemeName: model.colorSchemeName,
    colorScheme: model.colorScheme, // Computed getter from model
    transactionCount: model.transactionCount,
    isArchived: model.isArchived,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  }
}
