import { useLocalSearchParams, useRouter } from "expo-router"
import { useState } from "react"
import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { ArchiveCategorySheet } from "~/components/archive-category-sheet"
import { useBottomSheet } from "~/components/bottom-sheet"
import { DeleteCategorySheet } from "~/components/delete-category-sheet"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Input } from "~/components/ui/input"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

import type { Category, CategoryType } from "../../../types/categories"

export default function EditCategoryScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    categoryId: string
    categoryName?: string
    categoryType?: CategoryType
    transactionCount?: string
    initialType?: CategoryType
  }>()

  const isAddMode = params.categoryId === "add-category" || !params.categoryId
  const [name, setName] = useState(params.categoryName || "")
  const [nameError, setNameError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<CategoryType>(
    (params.initialType as CategoryType) ||
      (params.categoryType as CategoryType) ||
      "expense",
  )
  const categoryType = isAddMode
    ? selectedType
    : (params.categoryType as CategoryType) || "expense"
  const transactionCount = parseInt(params.transactionCount || "0", 10)

  // Bottom sheet controls (only for edit mode)
  const deleteSheet = useBottomSheet(
    `delete-category-${params.categoryId || "new"}`,
  )
  const archiveSheet = useBottomSheet(
    `archive-category-${params.categoryId || "new"}`,
  )

  const handleSubmit = () => {
    // Validate name
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError("Category name is required")
      return
    }

    if (trimmedName.length > 50) {
      setNameError("Category name must be 50 characters or less")
      return
    }

    // TODO: Check for uniqueness within same type (excluding current category)
    // For now, we'll skip this check

    // Navigate back and set params on the parent route
    router.back()
    // Use a small delay to ensure navigation completes before setting params
    setTimeout(() => {
      if (isAddMode) {
        router.setParams({
          createdCategory: JSON.stringify({
            name: trimmedName,
            type: selectedType,
          }),
        })
      } else {
        router.setParams({
          updatedCategory: JSON.stringify({
            id: params.categoryId,
            name: trimmedName,
          }),
        })
      }
    }, 100)
  }

  const handleCancel = () => {
    router.back()
  }

  const handleDelete = () => {
    // Navigate back and set params on the parent route to trigger deletion
    router.back()
    // Use a small delay to ensure navigation completes before setting params
    setTimeout(() => {
      router.setParams({
        deletedCategory: JSON.stringify({
          id: params.categoryId,
          action: "delete",
        }),
      })
    }, 100)
  }

  const handleArchive = () => {
    // Navigate back and set params on the parent route to trigger archiving
    router.back()
    // Use a small delay to ensure navigation completes before setting params
    setTimeout(() => {
      router.setParams({
        deletedCategory: JSON.stringify({
          id: params.categoryId,
          action: "archive",
        }),
      })
    }, 100)
  }

  const typeLabel = categoryType.charAt(0).toUpperCase() + categoryType.slice(1)

  const types: { type: CategoryType; label: string }[] = [
    { type: "expense", label: "Expense" },
    { type: "income", label: "Income" },
    { type: "transfer", label: "Transfer" },
  ]

  // Construct a minimal category object for the delete dialog
  const categoryForDelete: Category = {
    id: params.categoryId || "",
    name: name || params.categoryName || "",
    type: categoryType,
    transactionCount,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.form}>
          <View style={styles.field}>
            <Text variant="small" style={styles.label}>
              Name
            </Text>
            <Input
              value={name}
              onChangeText={(text) => {
                setName(text)
                if (nameError) setNameError(null)
              }}
              placeholder="Enter category name"
              error={!!nameError}
              autoFocus
            />
            {nameError && (
              <Text variant="small" style={styles.errorText}>
                {nameError}
              </Text>
            )}
          </View>

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
        </View>

        {!isAddMode && (
          <View style={styles.deleteSection}>
            <Button
              variant="ghost"
              onPress={() => archiveSheet.present()}
              style={styles.actionButton}
            >
              <IconSymbol
                name="server.rack"
                size={20}
                style={styles.archiveIcon}
              />
              <Text variant="default" style={styles.archiveText}>
                Archive Category
              </Text>
            </Button>
            <Button
              variant="ghost"
              onPress={() => deleteSheet.present()}
              style={styles.actionButton}
            >
              <IconSymbol name="trash" size={20} style={styles.deleteIcon} />
              <Text variant="default" style={styles.deleteText}>
                Delete Category
              </Text>
            </Button>
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <Button variant="outline" onPress={handleCancel} style={styles.button}>
          <Text variant="default" style={styles.cancelText}>
            Cancel
          </Text>
        </Button>
        <Button
          variant="default"
          onPress={handleSubmit}
          style={styles.button}
          disabled={
            !name.trim() ||
            (!isAddMode && name.trim() === (params.categoryName || ""))
          }
        >
          <Text variant="default" style={styles.saveText}>
            {isAddMode ? "Create" : "Save Changes"}
          </Text>
        </Button>
      </View>

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
    </View>
  )
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
    padding: 20,
    marginBottom: 10,
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
}))
