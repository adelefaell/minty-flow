/**
 * Category type definitions
 */

export type CategoryType = "expense" | "income" | "transfer"

export interface Category {
  id: string
  name: string
  type: CategoryType
  icon?: string
  color?: {
    name: string
    bgClass?: string
    textClass?: string
    borderClass?: string
  }
  transactionCount: number
  isArchived?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CategoryFormData {
  name: string
  icon?: string
  color?: Category["color"]
}
