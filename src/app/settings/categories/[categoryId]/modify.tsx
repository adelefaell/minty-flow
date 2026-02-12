import { zodResolver } from "@hookform/resolvers/zod"
import { withObservables } from "@nozbe/watermelondb/react"
import type { EventArg } from "@react-navigation/native"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

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
import type CategoryModel from "~/database/models/Category"
import {
  createCategory,
  destroyCategory,
  observeCategoryById,
  updateCategory,
} from "~/database/services/category-service"
import { modelToCategory } from "~/database/utils/model-to-category"
import {
  type AddCategoriesFormSchema,
  addCategoriesSchema,
} from "~/schemas/categories.schema"
import { getThemeStrict } from "~/styles/theme/registry"
import type { Category } from "~/types/categories"
import { NewEnum } from "~/types/new"
import { type TransactionType, TransactionTypeEnum } from "~/types/transactions"
import { logger } from "~/utils/logger"
import { Toast } from "~/utils/toast"

interface EditCategoryScreenProps {
  categoryModifyId: string
  initialType?: TransactionType
  categoryModel?: CategoryModel
  category?: Category
}

const EditCategoryScreenInner = ({
  categoryModifyId,
  initialType,
  categoryModel,
  category,
}: EditCategoryScreenProps) => {
  const router = useRouter()

  const isAddMode = categoryModifyId === NewEnum.NEW || !categoryModifyId

  const handleGoBack = useCallback(() => {
    router.back()
  }, [router])

  const TransactionType = isAddMode
    ? initialType || category?.type || TransactionTypeEnum.EXPENSE
    : category?.type || TransactionTypeEnum.EXPENSE

  // Form state management with react-hook-form
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

  // Watch for form changes
  const formName = watch("name")
  const formIcon = watch("icon")
  const formColorSchemeName = watch("colorSchemeName")
  const formType = watch("type")

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Navigation and unsaved changes handling (ConfirmModal instead of sheet)
  const navigation = useNavigation()
  const isNavigatingRef = useRef(false)
  const pendingLeaveRef = useRef<(() => void) | null>(null)
  const [unsavedModalVisible, setUnsavedModalVisible] = useState(false)

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  // Handle navigation with unsaved changes: show ConfirmModal
  useEffect(() => {
    const unsubscribe = navigation.addListener(
      "beforeRemove",
      (e: EventArg<"beforeRemove", true, { action: unknown }>) => {
        if (isSubmitting || isNavigatingRef.current || !isDirty) {
          return
        }

        e.preventDefault()

        pendingLeaveRef.current = () => {
          isNavigatingRef.current = true
          handleGoBack()
        }
        setUnsavedModalVisible(true)
      },
    )

    return unsubscribe
  }, [navigation, isDirty, isSubmitting, handleGoBack])

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

        isNavigatingRef.current = true
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

        isNavigatingRef.current = true
        handleGoBack()
      }
    } catch (error) {
      logger.error("Error saving category", { error })
      Toast.error({
        title: "Error",
        description: `Failed to ${isAddMode ? "create" : "update"} category. Please try again.`,
      })
    } finally {
      setIsSubmitting(false)
    }
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

      isNavigatingRef.current = true
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
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="default">Loading category...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.form} key={category?.id || NewEnum.NEW}>
          {/* Icon Selection – inline toggle (Icon / Emoji/Letter / Image) */}
          <ChangeIconInline
            id={`change-icon-category-${categoryModifyId || NewEnum.NEW}`}
            currentIcon={formIcon}
            onIconSelected={handleIconSelected}
            colorScheme={currentColorScheme}
          />

          {/* Category Name */}
          <View style={styles.nameSection}>
            <Text variant="small" style={styles.label}>
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
                  autoFocus={isAddMode}
                />
              )}
            />
            {errors.name && (
              <Text variant="small" style={styles.errorText}>
                {errors.name.message}
              </Text>
            )}
          </View>

          {/* Settings List */}
          <View style={styles.settingsList}>
            {/* Type Selection – inline panel (trigger + content in reusable component) */}
            <CategoryTypeInline
              selectedType={formType}
              onTypeSelected={(type) =>
                setValue("type", type, { shouldDirty: true })
              }
              editable={isAddMode}
            />

            {/* Color Selection – inline panel (trigger + content in reusable component) */}
            <ColorVariantInline
              selectedSchemeName={formColorSchemeName || undefined}
              onColorSelected={handleColorSelected}
              onClearSelection={handleColorCleared}
            />
          </View>

          {/* Divider */}
          <Separator />

          {/* Switches Section */}
          <View style={styles.switchesSection}>
            {/* Archive Toggle */}
            {!isAddMode && (
              <Controller
                control={control}
                name="isArchived"
                render={({ field: { value, onChange } }) => (
                  <Pressable
                    style={styles.switchRow}
                    onPress={() => onChange(!value)}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: value }}
                  >
                    <View style={styles.switchLeft}>
                      <IconSymbol name="archive-arrow-down" size={24} />
                      <Text variant="default" style={styles.switchLabel}>
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

          {/* Divider */}
          {!isAddMode && <Separator />}
        </View>

        {!isAddMode && (
          <View style={styles.deleteSection}>
            <Button
              variant="ghost"
              onPress={() => setDeleteModalVisible(true)}
              style={styles.actionButton}
            >
              <IconSymbol
                name="trash-can"
                size={20}
                style={styles.deleteIcon}
              />
              <Text variant="default" style={styles.deleteText}>
                Permanently delete
              </Text>
            </Button>
          </View>
        )}
      </ScrollView>

      {/* <KeyboardStickyViewMinty> */}
      <View style={styles.actions}>
        <Button variant="outline" onPress={handleGoBack} style={styles.button}>
          <Text variant="default" style={styles.cancelText}>
            Cancel
          </Text>
        </Button>
        <Button
          variant="default"
          onPress={handleSubmit}
          style={styles.button}
          disabled={
            !formName.trim() || (!isAddMode && !isDirty) || isSubmitting
          }
        >
          <Text variant="default" style={styles.saveText}>
            {isSubmitting ? "Saving..." : isAddMode ? "Create" : "Save Changes"}
          </Text>
        </Button>
      </View>
      {/* </KeyboardStickyViewMinty> */}

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
          pendingLeaveRef.current?.()
          pendingLeaveRef.current = null
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
      <EditCategoryScreenInner
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
      <EditCategoryScreenInner
        categoryModifyId={params.categoryId || NewEnum.NEW}
        initialType={params.initialType}
      />
    )
  }

  return <EnhancedEditScreen categoryId={params.categoryId} />
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  form: {
    gap: 32,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.onSurface,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nameSection: {
    gap: 10,
    paddingHorizontal: 20,
  },
  settingsList: {},
  switchesSection: {},
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  switchLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 4,
    textAlign: "center",
  },
  deleteSection: {
    marginTop: 32,
    marginHorizontal: 20,
    gap: 10,
  },
  actionButton: {
    width: "100%",
  },
  deleteIcon: {
    color: theme.colors.error,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.error,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  button: {
    flex: 1,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onPrimary,
  },
}))
