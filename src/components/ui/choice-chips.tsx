import type { StyleProp, TextStyle, ViewStyle } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Pressable } from "./pressable"
import { Text } from "./text"
import { View } from "./view"

/**
 * Interface for ChoiceChipsComponent
 */
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
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.titleText}>{title}</Text>
        {description && (
          <Text style={styles.descriptionText}>{description}</Text>
        )}
      </View>

      {/* Chips Grid Section */}
      <View style={styles.chipsWrapper}>
        {choices.map((item, index) => {
          const isSelected = selectedValue === item
          return (
            <Pressable
              key={`${item}-${index.toString()}`}
              onPress={() => onSelect(item)}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.textSelected : styles.textUnselected,
                ]}
              >
                {item}
              </Text>
            </Pressable>
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
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.colors.radius,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipUnselected: {
    borderColor: theme.colors.customColors.semi,
    backgroundColor: "transparent",
  },
  chipSelected: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.secondary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "400",
  },
  textUnselected: {
    color: theme.colors.onSurface,
  },
  textSelected: {
    color: theme.colors.onSurface,
  },
}))
