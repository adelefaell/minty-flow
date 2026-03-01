import { useLocalSearchParams } from "expo-router"
import { useTranslation } from "react-i18next"

import type { TransactionType } from "~/types/transactions"

import { CategoryScreenContent } from "../../../components/categories/category-screen-content"

export default function ArchivedCategoriesScreen() {
  const { t } = useTranslation()
  const params = useLocalSearchParams<{
    type?: TransactionType
  }>()

  return (
    <CategoryScreenContent
      subtitle={t("components.categories.form.title.archived")}
      includeArchived={true}
      initialType={params.type}
      searchPlaceholder={t("components.categories.archivedSearchPlaceholder")}
    />
  )
}
