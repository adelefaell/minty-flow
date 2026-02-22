import type CategoryModel from "~/database/models/category"
import type { Category } from "~/types/categories"
import type { TransactionType } from "~/types/transactions"

export interface CategoryModifyContentProps {
  categoryModifyId: string
  initialType?: TransactionType
  categoryModel?: CategoryModel
  category?: Category
}
