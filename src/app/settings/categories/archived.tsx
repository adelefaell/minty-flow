import { useLocalSearchParams } from "expo-router"

import type { TransactionType } from "~/types/transactions"

import { CategoryScreenContent } from "../../../components/categories/category-screen-content"

export default function ArchivedCategoriesScreen() {
  const params = useLocalSearchParams<{
    type?: TransactionType
  }>()

  return (
    <CategoryScreenContent
      subtitle="Archived Categories"
      includeArchived={true}
      initialType={params.type}
      searchPlaceholder="Search archived categories..."
    />
  )
}
