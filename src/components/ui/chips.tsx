import type { ReactNode } from "react"
import type { StyleProp, TextStyle, ViewStyle } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

// --- Chip (filter-header style) ---

interface ChipProps {
  label: string
  selected: boolean
  onPress: () => void
  leading?: ReactNode
  hideCheck?: boolean
}

export function Chip({
  label,
  selected,
  onPress,
  leading,
  hideCheck,
}: ChipProps) {
  const { theme } = useUnistyles()
  const borderColor = theme.colors.customColors.semi
  const selectedBg = theme.colors.secondary

  return (
    <Pressable
      style={[
        chipStyles.chip,
        {
          backgroundColor: selected ? selectedBg : "transparent",
          borderColor: selected ? "transparent" : borderColor,
          borderWidth: 1,
        },
      ]}
      onPress={onPress}
    >
      {leading}
      <Text
        style={[
          chipStyles.chipLabel,
          {
            color: selected ? theme.colors.primary : theme.colors.onSurface,
            fontWeight: selected ? "600" : "400",
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {selected && !hideCheck ? <IconSymbol name="check" size={14} /> : null}
    </Pressable>
  )
}

const chipStyles = StyleSheet.create((theme) => ({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.colors.radius ?? 12,
    gap: 6,
  },
  chipLabel: {
    fontSize: 14,
  },
}))

// --- ChoiceChipsComponent ---

interface ChoiceChipsProps<T extends string> {
  title: string
  description?: string
  style?: StyleProp<ViewStyle>
  choices: T[] | readonly T[]
  selectedValue: T
  onSelect: (value: T) => void
  textStyle?: StyleProp<TextStyle>
}

export const ChoiceChipsComponent = <T extends string>({
  title,
  description,
  style,
  choices,
  selectedValue,
  onSelect,
}: ChoiceChipsProps<T>) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.titleText}>{title}</Text>
        {description && (
          <Text style={styles.descriptionText}>{description}</Text>
        )}
      </View>

      <View style={styles.chipsWrapper}>
        {choices.map((item, index) => {
          const isSelected = selectedValue === item
          return (
            <Chip
              key={`${item}-${index.toString()}`}
              label={item}
              selected={isSelected}
              onPress={() => onSelect(item)}
            />
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    marginBottom: 12,
  },
  header: {
    marginBottom: 24,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: theme.colors.onSecondary,
    lineHeight: 20,
  },
  chipsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
}))
