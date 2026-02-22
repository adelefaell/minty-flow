import { withObservables } from "@nozbe/watermelondb/react"
import { useLocalSearchParams } from "expo-router"

import { CategoryModifyContent } from "~/components/categories/category-modify"
import type CategoryModel from "~/database/models/category"
import { observeCategoryById } from "~/database/services/category-service"
import { modelToCategory } from "~/database/utils/model-to-category"
import { NewEnum } from "~/types/new"
import type { TransactionType } from "~/types/transactions"

const EnhancedEditScreen = withObservables(
  ["categoryId"],
  ({ categoryId }: { categoryId: string }) => ({
    categoryModel: observeCategoryById(categoryId),
  }),
)(
  ({
    categoryId,
    categoryModel,
  }: {
    categoryId: string
    categoryModel: CategoryModel
  }) => {
    const category = categoryModel ? modelToCategory(categoryModel) : undefined

    return (
      <CategoryModifyContent
        key={category?.id || categoryId}
        categoryModifyId={categoryId}
        category={category}
        categoryModel={categoryModel}
      />
    )
  },
)

export default function EditCategoryScreen() {
  const params = useLocalSearchParams<{
    categoryId: string
    initialType: TransactionType
  }>()

  const isAddMode = params.categoryId === NewEnum.NEW || !params.categoryId

  if (isAddMode) {
    return (
      <CategoryModifyContent
        categoryModifyId={params.categoryId || NewEnum.NEW}
        initialType={params.initialType}
      />
    )
  }

  return <EnhancedEditScreen categoryId={params.categoryId} />
}
