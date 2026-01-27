import { withObservables } from "@nozbe/watermelondb/react"
import type { EventArg } from "@react-navigation/native"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { ScrollView } from "react-native"
import { KeyboardStickyView } from "react-native-keyboard-controller"
import { StyleSheet } from "react-native-unistyles"

import { ArchiveCategorySheet } from "~/components/archive-category-sheet"
import { useBottomSheet } from "~/components/bottom-sheet"
import { ChangeIconSheet } from "~/components/change-icon-sheet"
import { ColorVariantSheet } from "~/components/color-variant-sheet"
import { DeleteCategorySheet } from "~/components/delete-category-sheet"
import { DynamicIcon } from "~/components/dynamic-icon"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Input } from "~/components/ui/input"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import {
  UnsavedChangesSheet,
  useUnsavedChangesWarning,
} from "~/components/unsaved-changes-sheet"
import type CategoryModel from "~/database/models/Category"
import {
  createCategory,
  deleteCategory,
  observeCategoryById,
  updateCategory,
} from "~/database/services/category-service"
import { getThemeStrict } from "~/styles/theme/registry"
import { logger } from "~/utils/logger"
import { Toast } from "~/utils/toast"

import type {
  Category,
  CategoryFormData,
  CategoryType,
} from "../../../types/categories"

interface EditCategoryScreenProps {
  categoryId: string
  initialType?: CategoryType
  categoryModel?: CategoryModel
}

// TODO: refactor this component to use the new form components

const EditCategoryScreenInner = ({
  categoryId,
  initialType,
  categoryModel,
}: EditCategoryScreenProps) => {
  const router = useRouter()
  const isAddMode = categoryId === "add-category" || !categoryId
  const [selectedType, setSelectedType] = useState<CategoryType>(
    (initialType as CategoryType) ||
      (categoryModel?.type as CategoryType) ||
      "expense",
  )
  const categoryType = isAddMode
    ? selectedType
    : (categoryModel?.type as CategoryType) || "expense"
  const transactionCount = categoryModel?.transactionCount || 0

  // Form state management with react-hook-form
  // Use categoryModel directly in defaultValues - react-hook-form handles initialization
  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: categoryModel?.name || "",
      icon: categoryModel?.icon || "shape",
      colorSchemeName: categoryModel?.colorSchemeName || undefined,
    },
  })

  // Watch for form changes
  const formName = watch("name")
  const formIcon = watch("icon")
  const formColorSchemeName = watch("colorSchemeName")

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Navigation and unsaved changes handling
  const navigation = useNavigation()
  const unsavedChangesWarning = useUnsavedChangesWarning()
  const isNavigatingRef = useRef(false)

  // Bottom sheet controls
  const deleteSheet = useBottomSheet(`delete-category-${categoryId || "new"}`)
  const archiveSheet = useBottomSheet(`archive-category-${categoryId || "new"}`)
  const changeIconSheet = useBottomSheet(
    `change-icon-category-${categoryId || "new"}`,
  )
  const colorVariantSheet = useBottomSheet(
    `color-variant-category-${categoryId || "new"}`,
  )

  // Handle navigation with unsaved changes warning
  useEffect(() => {
    const unsubscribe = navigation.addListener(
      "beforeRemove",
      (e: EventArg<"beforeRemove", true, { action: unknown }>) => {
        // Don't show warning if we're submitting or already navigating
        if (isSubmitting || isNavigatingRef.current || !isDirty) {
          return
        }

        // Prevent default navigation
        e.preventDefault()

        // Show unsaved changes warning
        unsavedChangesWarning.show(
          () => {
            // User confirmed - allow navigation
            isNavigatingRef.current = true
            router.back()
          },
          () => {
            // User cancelled - do nothing
          },
        )
      },
    )

    return unsubscribe
  }, [navigation, isDirty, isSubmitting, router, unsavedChangesWarning])

  const onSubmit = async (data: CategoryFormData) => {
    // Validate name
    const trimmedName = data.name.trim()
    if (!trimmedName) {
      return
    }

    if (trimmedName.length > 50) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isAddMode) {
        // Create new category
        await createCategory({
          name: trimmedName,
          type: selectedType,
          icon: data.icon,
          colorSchemeName: data.colorSchemeName,
        })

        // Toast.success({
        //   title: "Category created",
        //   description: "Your new category has been created",
        // })

        // Navigate back after successful creation
        isNavigatingRef.current = true
        router.back()
      } else {
        // Update existing category
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
        })

        // Toast.success({
        //   title: "Category updated",
        //   description: "Your changes have been saved",
        // })

        // Navigate back after successful update
        isNavigatingRef.current = true
        router.back()
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

  const handleCancel = () => {
    router.back()
  }

  const handleDelete = async () => {
    try {
      if (!categoryModel) {
        Toast.error({
          title: "Error",
          description: "Category not found",
        })
        return
      }

      // Prevent deletion if category has transactions
      if (categoryModel.transactionCount > 0) {
        Toast.error({
          title: "Cannot delete category",
          description: `This category has ${categoryModel.transactionCount} transaction${categoryModel.transactionCount !== 1 ? "s" : ""}. Please remove or reassign all transactions before deleting.`,
        })
        return
      }

      // Permanently delete the category
      await deleteCategory(categoryModel)

      Toast.success({
        title: "Category deleted",
        description: "The category has been permanently deleted",
      })

      // Navigate back after successful deletion
      isNavigatingRef.current = true
      router.back()
    } catch (error) {
      logger.error("Error deleting category", { error })
      Toast.error({
        title: "Error",
        description: "Failed to delete category. Please try again.",
      })
    }
  }

  const handleArchive = async () => {
    try {
      if (!categoryModel) {
        Toast.error({
          title: "Error",
          description: "Category not found",
        })
        return
      }

      // Archive the category
      await updateCategory(categoryModel, {
        isArchived: true,
      })

      Toast.success({
        title: "Category archived",
        description: "The category has been archived",
      })

      // Navigate back after successful archiving
      isNavigatingRef.current = true
      router.back()
    } catch (error) {
      logger.error("Error archiving category", { error })
      Toast.error({
        title: "Error",
        description: "Failed to archive category. Please try again.",
      })
    }
  }

  const handleRestore = async () => {
    try {
      if (!categoryModel) {
        Toast.error({
          title: "Error",
          description: "Category not found",
        })
        return
      }

      // Restore the category
      await updateCategory(categoryModel, {
        isArchived: false,
      })

      Toast.success({
        title: "Category restored",
        description: "The category has been restored",
      })

      // Navigate back after successful restoration
      isNavigatingRef.current = true
      router.back()
    } catch (error) {
      logger.error("Error restoring category", { error })
      Toast.error({
        title: "Error",
        description: "Failed to restore category. Please try again.",
      })
    }
  }

  const typeLabel = categoryType.charAt(0).toUpperCase() + categoryType.slice(1)

  const types: { type: CategoryType; label: string }[] = [
    { type: "expense", label: "Expense" },
    { type: "income", label: "Income" },
    { type: "transfer", label: "Transfer" },
  ]

  // Handle icon selection
  const handleIconSelected = (icon: string) => {
    setValue("icon", icon, { shouldDirty: true })
    changeIconSheet.dismiss()
  }

  // Handle color selection
  const handleColorSelected = (schemeName: string) => {
    setValue("colorSchemeName", schemeName, { shouldDirty: true })
  }

  // Handle color clear
  const handleColorCleared = () => {
    setValue("colorSchemeName", undefined, { shouldDirty: true })
  }

  // Construct a minimal category object for the delete dialog
  const categoryForDelete: Category = {
    id: categoryId || "",
    name: formName || categoryModel?.name || "",
    type: categoryType,
    transactionCount,
    createdAt: categoryModel?.createdAt || new Date(),
    updatedAt: categoryModel?.updatedAt || new Date(),
  }

  // Resolve color scheme from form value
  const currentColorScheme = getThemeStrict(formColorSchemeName)

  // Show loading state if category is being loaded in edit mode
  if (!isAddMode && !categoryModel) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="default" style={styles.loadingText}>
            Loading category...
          </Text>
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
        <View style={styles.form} key={categoryModel?.id || "new"}>
          {/* Icon Selection */}
          <View style={styles.field}>
            <Text
              variant="small"
              style={[
                styles.label,
                {
                  textAlign: "center",
                },
              ]}
            >
              Change Icon
            </Text>
            <Pressable
              style={[
                styles.iconBox,
                currentColorScheme?.secondary && {
                  backgroundColor: currentColorScheme.secondary,
                },
              ]}
              onPress={() => changeIconSheet.present()}
            >
              <DynamicIcon
                icon={formIcon}
                size={48}
                colorScheme={currentColorScheme}
              />
            </Pressable>
          </View>

          {/* Category Name */}
          <View style={styles.field}>
            <Text variant="small" style={styles.label}>
              Category Name
            </Text>
            <Controller
              control={control}
              name="name"
              rules={{
                required: "Category name is required",
                maxLength: {
                  value: 50,
                  message: "Category name must be 50 characters or less",
                },
                validate: (value) =>
                  value.trim().length > 0 || "Category name cannot be empty",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="John's Groceries, etc."
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

          {/* Type Selection */}
          <View style={styles.field}>
            <Text variant="small" style={styles.label}>
              Type
            </Text>
            {isAddMode ? (
              <>
                <View style={styles.typeSelector}>
                  {types.map((typeOption) => (
                    <Pressable
                      key={typeOption.type}
                      style={[
                        styles.typeOption,
                        selectedType === typeOption.type &&
                          styles.typeOptionActive,
                      ]}
                      onPress={() => setSelectedType(typeOption.type)}
                    >
                      <Text
                        variant="default"
                        style={[
                          styles.typeOptionText,
                          selectedType === typeOption.type &&
                            styles.typeOptionTextActive,
                        ]}
                      >
                        {typeOption.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text variant="small" style={styles.helperText}>
                  Select the category type for this category
                </Text>
              </>
            ) : (
              <>
                <View style={styles.typeDisplay}>
                  <Text variant="default" style={styles.typeText}>
                    {typeLabel}
                  </Text>
                </View>
                <Text variant="small" style={styles.helperText}>
                  Category type cannot be changed
                </Text>
              </>
            )}
          </View>

          {/* Color Selection */}
          <View style={styles.field}>
            <Pressable
              style={styles.colorSelector}
              onPress={() => colorVariantSheet.present()}
            >
              <View style={styles.colorSelectorLeft}>
                <IconSymbol name="palette-outline" size={24} />
                <Text variant="default" style={styles.colorLabel}>
                  Change color
                </Text>
              </View>
              <View style={styles.colorSelectorRight}>
                {currentColorScheme ? (
                  <View
                    style={[
                      styles.colorPreview,
                      {
                        backgroundColor: currentColorScheme.primary,
                      },
                    ]}
                  />
                ) : (
                  <Text variant="default" style={styles.defaultColorText}>
                    Default color
                  </Text>
                )}
                <IconSymbol
                  name="chevron-right"
                  size={20}
                  style={styles.chevronIcon}
                />
              </View>
            </Pressable>
          </View>
        </View>

        {!isAddMode && (
          <View style={styles.deleteSection}>
            {categoryModel?.isArchived ? (
              <Button
                variant="ghost"
                onPress={handleRestore}
                style={styles.actionButton}
              >
                <IconSymbol
                  name="check-circle-outline"
                  size={20}
                  style={styles.restoreIcon}
                />
                <Text variant="default" style={styles.restoreText}>
                  Restore Category
                </Text>
              </Button>
            ) : (
              <Button
                variant="ghost"
                onPress={() => archiveSheet.present()}
                style={styles.actionButton}
              >
                <IconSymbol
                  name="server-outline"
                  size={20}
                  style={styles.archiveIcon}
                />
                <Text variant="default" style={styles.archiveText}>
                  Archive Category
                </Text>
              </Button>
            )}
            <Button
              variant="ghost"
              onPress={() => deleteSheet.present()}
              style={styles.actionButton}
            >
              <IconSymbol
                name="trash-can-outline"
                size={20}
                style={[
                  styles.deleteIcon,
                  (categoryModel?.transactionCount ?? 0) > 0 &&
                    styles.deleteIconDisabled,
                ]}
              />
              <Text
                variant="default"
                style={[
                  styles.deleteText,
                  (categoryModel?.transactionCount ?? 0) > 0 &&
                    styles.deleteTextDisabled,
                ]}
              >
                Delete Category
              </Text>
            </Button>
          </View>
        )}
      </ScrollView>

      <KeyboardStickyView>
        <View style={styles.actions}>
          <Button
            variant="outline"
            onPress={handleCancel}
            style={styles.button}
          >
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
              {isSubmitting
                ? "Saving..."
                : isAddMode
                  ? "Create"
                  : "Save Changes"}
            </Text>
          </Button>
        </View>
      </KeyboardStickyView>

      {/* Bottom Sheets */}
      {!isAddMode && (
        <>
          <DeleteCategorySheet
            category={categoryForDelete}
            onConfirm={handleDelete}
          />
          <ArchiveCategorySheet
            category={categoryForDelete}
            onConfirm={handleArchive}
          />
        </>
      )}

      {/* Icon Selection Sheet */}
      <ChangeIconSheet
        id={`change-icon-category-${categoryId || "new"}`}
        currentIcon={formIcon}
        onIconSelected={handleIconSelected}
        colorScheme={currentColorScheme}
      />

      {/* Color Variant Sheet */}
      <ColorVariantSheet
        id={`color-variant-category-${categoryId || "new"}`}
        selectedSchemeName={formColorSchemeName || undefined}
        onColorSelected={handleColorSelected}
        onClearSelection={handleColorCleared}
        onDismiss={() => colorVariantSheet.dismiss()}
      />

      {/* Unsaved Changes Warning Sheet */}
      <UnsavedChangesSheet />
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
    categoryModel?: CategoryModel
  }) => (
    <EditCategoryScreenInner
      key={categoryModel?.id || categoryId}
      categoryId={categoryId}
      categoryModel={categoryModel}
    />
  ),
)

// Main component - conditionally use observable based on mode
export default function EditCategoryScreen() {
  const params = useLocalSearchParams<{
    categoryId: string
    initialType?: CategoryType
  }>()

  const isAddMode = params.categoryId === "add-category" || !params.categoryId

  // Only use withObservables in edit mode
  if (isAddMode) {
    return (
      <EditCategoryScreenInner
        categoryId={params.categoryId || "add-category"}
        initialType={params.initialType}
      />
    )
  }

  // In edit mode, use the enhanced component with observable
  return <EnhancedEditScreen categoryId={params.categoryId} />
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
    paddingBottom: 24,
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.onSurface,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  typeDisplay: {
    padding: 12,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    borderWidth: 1,
    borderColor: theme.colors.onSurface,
    opacity: 0.5,
  },
  typeText: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 8,
  },
  typeOption: {
    flex: 1,
    padding: 12,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    borderWidth: 1,
    borderColor: theme.colors.onSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  typeOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  typeOptionTextActive: {
    color: theme.colors.onPrimary,
    fontWeight: "600",
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.onSecondary,
    fontStyle: "italic",
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
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
  deleteSection: {
    marginTop: 20,
    paddingBlock: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.onSurface,
    gap: 12,
  },
  actionButton: {
    width: "100%",
  },
  archiveIcon: {
    color: theme.colors.primary,
  },
  archiveText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  deleteIcon: {
    color: theme.colors.error,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.error,
  },
  deleteIconDisabled: {
    opacity: 0.4,
  },
  deleteTextDisabled: {
    opacity: 0.4,
  },
  restoreIcon: {
    color: theme.colors.primary,
  },
  restoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  colorSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.colors.radius,
    borderWidth: 1,
    borderColor: theme.colors.onSurface,
  },
  colorSelectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorSelectorRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.onSurface,
  },
  defaultColorText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.6,
  },
  chevronIcon: {
    color: theme.colors.onSurface,
    opacity: 0.4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.onSecondary,
  },
}))
