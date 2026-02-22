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
import {
  createCategory,
  observeCategoriesByType,
} from "~/database/services/category-service"
import type { Category } from "~/types/categories"
import { type TransactionType, TransactionTypeEnum } from "~/types/transactions"
import { logger } from "~/utils/logger"
import { Toast } from "~/utils/toast"

const PRESETS_BY_TYPE: Record<
  TransactionType,
  readonly (Category & { id: string })[]
> = {
  expense: ExpensePresets,
  income: IncomePresets,
  transfer: TransferPresets,
}

function alreadyAddedPresetIds(
  categories: Category[],
  presets: readonly (Category & { id: string })[],
): Set<string> {
  const added = new Set<string>()
  for (const preset of presets) {
    const match = categories.some(
      (c) =>
        c.name.trim().toLowerCase() === preset.name.trim().toLowerCase() &&
        c.type === preset.type,
    )
    if (match) added.add(preset.id)
  }
  return added
}

async function createCategories(
  toCreate: Parameters<typeof createCategory>[0][],
) {
  for (const payload of toCreate) {
    await createCategory(payload)
  }
}

interface CategoryPresetsScreenInnerProps {
  type: TransactionType
  categories: Category[]
}

const CategoryPresetsScreenInner = ({
  type,
  categories,
}: CategoryPresetsScreenInnerProps) => {
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

    const toCreate = selected.map((preset) => ({
      name: preset.name,
      type: preset.type,
      icon: preset.icon,
      colorSchemeName: preset.colorSchemeName,
      isArchived: false as const,
    }))

    // Only keep the side-effectful async work inside try/catch
    try {
      await createCategories(toCreate)
      setSelectedPresets(new Set())
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
        style={styles.presetItem}
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />

      <View style={[styles.buttonContainer, { paddingBottom: 16 }]}>
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
  ({ type }: { type: TransactionType }) => ({
    categories: observeCategoriesByType(type, true),
  }),
)(CategoryPresetsScreenInner)

export default function CategoryPresetsScreen() {
  const params = useLocalSearchParams<{ type: TransactionType }>()
  const type = params.type || TransactionTypeEnum.EXPENSE
  return <EnhancedCategoryPresetsScreen type={type} />
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  list: {
    flex: 1,
  },

  listContent: {},

  presetItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
    borderBottomOpacity: 0.1,
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
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
  },
  addedText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.onPrimary,
  },
  buttonContainer: {
    paddingHorizontal: 20,
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
