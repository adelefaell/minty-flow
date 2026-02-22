import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigation, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { ScrollView } from "react-native"

import { CategoryTypeInline } from "~/components/categories/category-type-inline"
import { ChangeIconInline } from "~/components/change-icon-inline"
import { ColorVariantInline } from "~/components/color-variant-inline"
import { ConfirmModal } from "~/components/confirm-modal"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Input } from "~/components/ui/input"
import { Pressable } from "~/components/ui/pressable"
import { Separator } from "~/components/ui/separator"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import {
  createCategory,
  destroyCategory,
  updateCategory,
} from "~/database/services/category-service"
import { useNavigationGuard } from "~/hooks/use-navigation-guard"
import {
  type AddCategoriesFormSchema,
  addCategoriesSchema,
} from "~/schemas/categories.schema"
import { getThemeStrict } from "~/styles/theme/registry"
import { NewEnum } from "~/types/new"
import { TransactionTypeEnum } from "~/types/transactions"
import { logger } from "~/utils/logger"
import { Toast } from "~/utils/toast"

import { categoryModifyStyles } from "./category-modify.styles"
import type { CategoryModifyContentProps } from "./types"

export function CategoryModifyContent({
  categoryModifyId,
  initialType,
  categoryModel,
  category,
}: CategoryModifyContentProps) {
  const router = useRouter()

  const isAddMode = categoryModifyId === NewEnum.NEW || !categoryModifyId

  const handleGoBack = useCallback(() => {
    router.back()
  }, [router])

  const TransactionType = isAddMode
    ? initialType || category?.type || TransactionTypeEnum.EXPENSE
    : category?.type || TransactionTypeEnum.EXPENSE

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(addCategoriesSchema),
    defaultValues: {
      name: category?.name || "",
      icon: category?.icon || "shape",
      type: TransactionType,
      colorSchemeName: category?.colorSchemeName || undefined,
      isArchived: category?.isArchived || false,
    },
  })

  const formName = watch("name")
  const formIcon = watch("icon")
  const formColorSchemeName = watch("colorSchemeName")
  const formType = watch("type")

  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigation = useNavigation()
  const [unsavedModalVisible, setUnsavedModalVisible] = useState(false)
  const { confirmNavigation, allowNavigation } = useNavigationGuard({
    navigation,
    when: isDirty && !isSubmitting,
    onConfirm: handleGoBack,
    onBlock: () => setUnsavedModalVisible(true),
  })

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  const onSubmit = async (data: AddCategoriesFormSchema) => {
    const trimmedName = data.name.trim()
    setIsSubmitting(true)

    try {
      if (isAddMode) {
        await createCategory({
          name: trimmedName,
          type: data.type,
          icon: data.icon,
          colorSchemeName: data.colorSchemeName,
          isArchived: data.isArchived,
        })

        allowNavigation()
        handleGoBack()
      } else {
        if (!categoryModel) {
          Toast.error({
            title: "Error",
            description: "Category not found",
          })
          setIsSubmitting(false)
          return
        }

        await updateCategory(categoryModel, {
          name: trimmedName,
          icon: data.icon,
          colorSchemeName: data.colorSchemeName,
          isArchived: data.isArchived,
        })

        allowNavigation()
        handleGoBack()
      }
    } catch (error) {
      logger.error("Error saving category", { error })
      Toast.error({
        title: "Error",
        description: `Failed to ${isAddMode ? "create" : "update"} category. Please try again.`,
      })
    }
    setIsSubmitting(false)
  }

  const handleSubmit = handleFormSubmit(onSubmit)

  const handleDelete = async () => {
    try {
      if (!categoryModel || !category) {
        Toast.error({
          title: "Error",
          description: "Category not found",
        })
        return
      }

      if (category.transactionCount > 0) {
        Toast.error({
          title: "Cannot delete category",
          description: `This category has ${category.transactionCount} transaction${category.transactionCount !== 1 ? "s" : ""}. Please remove or reassign all transactions before deleting.`,
        })
        return
      }

      await destroyCategory(categoryModel)

      allowNavigation()
      router.replace({
        pathname: "/settings/categories",
      })
    } catch (error) {
      logger.error("Error deleting category", { error })
      Toast.error({
        title: "Error",
        description: "Failed to delete category. Please try again.",
      })
    }
  }

  const handleIconSelected = (icon: string) => {
    setValue("icon", icon, { shouldDirty: true })
  }

  const handleColorSelected = (schemeName: string) => {
    setValue("colorSchemeName", schemeName, { shouldDirty: true })
  }

  const handleColorCleared = () => {
    setValue("colorSchemeName", undefined, { shouldDirty: true })
  }

  const currentColorScheme = getThemeStrict(formColorSchemeName)

  if (!isAddMode && !category) {
    return (
      <View style={categoryModifyStyles.container}>
        <View style={categoryModifyStyles.loadingContainer}>
          <Text variant="default">Loading category...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={categoryModifyStyles.container}>
      <ScrollView
        style={categoryModifyStyles.scrollView}
        contentContainerStyle={categoryModifyStyles.scrollContent}
      >
        <View
          style={categoryModifyStyles.form}
          key={category?.id || NewEnum.NEW}
        >
          <ChangeIconInline
            id={`change-icon-category-${categoryModifyId || NewEnum.NEW}`}
            currentIcon={formIcon}
            onIconSelected={handleIconSelected}
            colorScheme={currentColorScheme}
          />

          <View style={categoryModifyStyles.nameSection}>
            <Text variant="small" style={categoryModifyStyles.label}>
              Category name
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Groceries, Dining out, etc."
                  error={!!errors.name}
                />
              )}
            />
            {errors.name && (
              <Text variant="small" style={categoryModifyStyles.errorText}>
                {errors.name.message}
              </Text>
            )}
          </View>

          <View style={categoryModifyStyles.settingsList}>
            <CategoryTypeInline
              selectedType={formType}
              onTypeSelected={(type) =>
                setValue("type", type, { shouldDirty: true })
              }
              editable={isAddMode}
            />

            <ColorVariantInline
              selectedSchemeName={formColorSchemeName || undefined}
              onColorSelected={handleColorSelected}
              onClearSelection={handleColorCleared}
            />
          </View>

          <Separator />

          <View style={categoryModifyStyles.switchesSection}>
            {!isAddMode && (
              <Controller
                control={control}
                name="isArchived"
                render={({ field: { value, onChange } }) => (
                  <Pressable
                    style={categoryModifyStyles.switchRow}
                    onPress={() => onChange(!value)}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: value }}
                  >
                    <View style={categoryModifyStyles.switchLeft}>
                      <IconSymbol name="archive-arrow-down" size={24} />
                      <Text
                        variant="default"
                        style={categoryModifyStyles.switchLabel}
                      >
                        Archive category
                      </Text>
                    </View>

                    <View pointerEvents="none">
                      <Switch value={value} />
                    </View>
                  </Pressable>
                )}
              />
            )}
          </View>

          {!isAddMode && <Separator />}
        </View>

        {!isAddMode && (
          <View style={categoryModifyStyles.deleteSection}>
            <Button
              variant="ghost"
              onPress={() => setDeleteModalVisible(true)}
              style={categoryModifyStyles.actionButton}
            >
              <IconSymbol
                name="trash-can"
                size={20}
                style={categoryModifyStyles.deleteIcon}
              />
              <Text variant="default" style={categoryModifyStyles.deleteText}>
                Permanently delete
              </Text>
            </Button>
          </View>
        )}
      </ScrollView>

      <View style={categoryModifyStyles.actions}>
        <Button
          variant="outline"
          onPress={handleGoBack}
          style={categoryModifyStyles.button}
        >
          <Text variant="default" style={categoryModifyStyles.cancelText}>
            Cancel
          </Text>
        </Button>
        <Button
          variant="default"
          onPress={handleSubmit}
          style={categoryModifyStyles.button}
          disabled={
            !formName.trim() || (!isAddMode && !isDirty) || isSubmitting
          }
        >
          <Text variant="default" style={categoryModifyStyles.saveText}>
            {isSubmitting ? "Saving..." : isAddMode ? "Create" : "Save Changes"}
          </Text>
        </Button>
      </View>

      {!isAddMode && category && (
        <ConfirmModal
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
          onConfirm={handleDelete}
          title={`Delete ${category.name}?`}
          description={
            category.transactionCount > 0
              ? `This category is used by ${category.transactionCount} transaction${category.transactionCount !== 1 ? "s" : ""}. Deleting will unlink ${category.transactionCount === 1 ? "it" : "them"}. This cannot be undone.`
              : "Deleting this category cannot be undone."
          }
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="destructive"
          icon="trash-can"
        />
      )}

      <ConfirmModal
        visible={unsavedModalVisible}
        onRequestClose={() => setUnsavedModalVisible(false)}
        onConfirm={() => {
          setUnsavedModalVisible(false)
          confirmNavigation()
        }}
        title="Close without saving?"
        description="All changes will be lost."
        confirmLabel="Discard"
        cancelLabel="Cancel"
        variant="default"
      />
    </View>
  )
}
