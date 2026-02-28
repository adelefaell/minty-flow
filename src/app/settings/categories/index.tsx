import { useLocalSearchParams } from "expo-router"
import { useTranslation } from "react-i18next"

import type { TransactionType } from "~/types/transactions"

import { CategoryScreenContent } from "../../../components/categories/category-screen-content"

export default function CategoriesIndexScreen() {
  const params = useLocalSearchParams<{
    createdCategory?: string
    updatedCategory?: string
    deletedCategory?: string
    type?: TransactionType
  }>()
  const { t } = useTranslation()

  return (
    <CategoryScreenContent
      subtitle={t("components.categories.subtitle")}
      includeArchived={false}
      initialType={params.type}
      extraListProps={{
        createdCategory: params.createdCategory,
        updatedCategory: params.updatedCategory,
        deletedCategory: params.deletedCategory,
      }}
    />
  )
}
