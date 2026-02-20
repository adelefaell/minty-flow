import type { Tag } from "~/types/tags"

import type TagModel from "../models/Tag"

/**
 * Convert TagModel to Tag domain type
 */
export const modelToTag = (model: TagModel): Tag => {
  return {
    id: model.id,
    name: model.name,
    type: model.type,
    icon: model.icon,
    colorSchemeName: model.colorSchemeName,
    transactionCount: model.transactionCount,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  }
}
