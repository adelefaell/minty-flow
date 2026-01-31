import { withObservables } from "@nozbe/watermelondb/react"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useMemo, useState } from "react"
import { FlatList } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { DynamicIcon } from "~/components/dynamic-icon"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import {
  ExpensePresets,
  IncomePresets,
  TransferPresets,
} from "~/constants/pre-sets-categories"
import type CategoryModel from "~/database/models/Category"
import {
  createCategory,
  observeCategoriesByType,
} from "~/database/services/category-service"
import { modelToCategory } from "~/database/utils/model-to-category"
import {
  type Category,
  type CategoryType,
  CategoryTypeEnum,
} from "~/types/categories"
import { logger } from "~/utils/logger"
import { Toast } from "~/utils/toast"

const PRESETS_BY_TYPE: Record<
  CategoryType,
  readonly (Category & { id: string })[]
> = {
  expense: ExpensePresets,
  income: IncomePresets,
  transfer: TransferPresets,
}

function alreadyAddedPresetIds(
  categoryModels: Category[],
  presets: readonly (Category & { id: string })[],
): Set<string> {
  const added = new Set<string>()
  for (const preset of presets) {
    const match = categoryModels.some(
      (c) =>
        c.name === preset.name &&
        c.type === preset.type &&
        (c.icon ?? undefined) === (preset.icon ?? undefined) &&
        (c.colorSchemeName ?? undefined) ===
          (preset.colorSchemeName ?? undefined),
    )
    if (match) added.add(preset.id)
  }
  return added
}

interface CategoryPresetsScreenInnerProps {
  type: CategoryType
  categoryModels: CategoryModel[]
}

const CategoryPresetsScreenInner = ({
  type,
  categoryModels,
}: CategoryPresetsScreenInnerProps) => {
  // Convert models to domain types
  const categories = categoryModels.map(modelToCategory)

  const router = useRouter()
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set())

  const presets = PRESETS_BY_TYPE[type] ?? []
  const addedPresets = useMemo(
    () => alreadyAddedPresetIds(categories, presets),
    [categories, presets],
  )

  const togglePreset = (presetId: string) => {
    setSelectedPresets((prev) => {
      const next = new Set(prev)
      if (next.has(presetId)) {
        next.delete(presetId)
      } else {
        next.add(presetId)
      }
      return next
    })
  }

  const handleAddSelected = async () => {
    const selected = presets.filter((preset) =>
      selectedPresets.has(preset.id),
    ) as Category[]

    if (selected.length === 0) return

    try {
      // Save all selected presets to database
      for (const preset of selected) {
        await createCategory({
          name: preset.name,
          type: preset.type,
          icon: preset.icon,
          colorSchemeName: preset.colorSchemeName,
        })
      }

      setSelectedPresets(new Set())

      Toast.success({
        title: "Categories created",
        description: `Successfully created ${selected.length} categor${selected.length === 1 ? "y" : "ies"}`,
      })

      // Navigate back
      router.back()
    } catch (error) {
      logger.error("Error creating preset categories", { error })
      Toast.error({
        title: "Error",
        description: "Failed to create categories. Please try again.",
      })
    }
  }

  const renderPresetItem = ({ item }: { item: (typeof presets)[0] }) => {
    const isSelected = selectedPresets.has(item.id)
    const isAdded = addedPresets.has(item.id)

    return (
      <Pressable
        style={[styles.presetItem, isAdded && styles.presetItemDisabled]}
        onPress={() => {
          if (!isAdded) {
            togglePreset(item.id)
          }
        }}
        disabled={isAdded}
      >
        {/* Icon container - using DynamicIcon */}
        <DynamicIcon icon={item.icon} size={24} />

        {/* Text content */}
        <View style={styles.textContainer}>
          <Text variant="default" style={styles.presetName}>
            {item.name}
          </Text>
        </View>

        {/* Right side action */}
        {isAdded ? (
          <View style={styles.addedBadge}>
            <Text variant="small" style={styles.addedText}>
              Added
            </Text>
          </View>
        ) : isSelected ? (
          <View style={styles.checkmark}>
            <IconSymbol
              name="check"
              size={16}
              color={styles.checkmarkColor.color}
            />
          </View>
        ) : (
          <View style={styles.plusButton}>
            <IconSymbol name="plus" size={20} />
          </View>
        )}
      </Pressable>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={presets}
        keyExtractor={(item) => item.id}
        renderItem={renderPresetItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.buttonContainer}>
        <Button
          variant="default"
          onPress={handleAddSelected}
          disabled={selectedPresets.size === 0}
          style={styles.addButton}
        >
          <Text variant="default" style={styles.addButtonText}>
            Add {selectedPresets.size} Selected
          </Text>
        </Button>
      </View>
    </View>
  )
}

const EnhancedCategoryPresetsScreen = withObservables(
  ["type"],
  ({ type }: { type: CategoryType }) => ({
    categoryModels: observeCategoriesByType(type),
  }),
)(CategoryPresetsScreenInner)

export default function CategoryPresetsScreen() {
  const params = useLocalSearchParams<{ type: CategoryType }>()
  const type = params.type || CategoryTypeEnum.EXPENSE
  return <EnhancedCategoryPresetsScreen type={type} />
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  listContent: {
    paddingBottom: 100,
    gap: 0,
  },
  presetItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
    borderBottomOpacity: 0.1,
  },
  presetItemDisabled: {
    opacity: 0.8,
  },
  textContainer: {
    flex: 1,
  },
  presetName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkColor: {
    color: theme.colors.onPrimary,
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  addedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
  },
  addedText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.onPrimary,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: theme.colors.surface,
  },
  addButton: {
    width: "100%",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onPrimary,
  },
}))
