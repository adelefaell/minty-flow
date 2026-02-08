import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import {
  NumpadStyleEnum,
  type NumpadStyleType,
  useNumpadStyleStore,
} from "~/stores/numpad-style.store"

function toInt(value: string): number | null {
  const n = parseInt(value, 10)
  return Number.isNaN(n) ? null : n
}
export const classicNumpad = [
  "eraser",
  "plus-minus-variant",
  "percent",
  "division",
  "7",
  "8",
  "9",
  "multiply",
  "4",
  "5",
  "6",
  "minus",
  "1",
  "2",
  "3",
  "plus",
  "decimal",
  "0",
  "backspace",
  "equal",
]
export const modernNumpad = [
  "eraser",
  "plus-minus-variant",
  "percent",
  "division",
  "1",
  "2",
  "3",
  "multiply",
  "4",
  "5",
  "6",
  "minus",
  "7",
  "8",
  "9",
  "plus",
  "decimal",
  "0",
  "backspace",
  "equal",
]

const NumpadRenderer = ({ type }: { type: NumpadStyleType }) => {
  // Select the layout based on the passed prop
  const activeLayout = type === "modern" ? modernNumpad : classicNumpad

  return (
    <View style={styles.numpadContainer}>
      <View style={styles.grid}>
        {activeLayout.slice(4).map((key, keyIndex) => {
          const isNumber = toInt(key)

          return (
            <View key={`key-${keyIndex.toString()}`} style={[styles.button]}>
              {key !== null && (
                <Text style={styles.buttonText}>{isNumber && key}</Text>
              )}
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styleOptions: Array<{
  value: NumpadStyleType
  label: string
  description: string
}> = [
  {
    value: NumpadStyleEnum.CLASSIC,
    label: "Classic",
    description: "Standard calculator layout",
  },
  {
    value: NumpadStyleEnum.MODERN,
    label: "Modern",
    description: "Standard phone layout",
  },
]

export default function NumpadScreen() {
  const setNumpadStyle = useNumpadStyleStore((s) => s.setNumpadStyle)
  const numpadStyle = useNumpadStyleStore((s) => s.numpadStyle)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View native style={styles.section}>
        <Text variant="p" style={styles.sectionTitle}>
          Numpad Layout
        </Text>
        <Text variant="small" style={styles.sectionDescription}>
          Select your preferred keypad layout
        </Text>
      </View>
      <View native style={styles.optionsList}>
        {styleOptions.map((option) => {
          const isSelected = numpadStyle === option.value
          return (
            <Pressable
              key={option.value}
              style={styles.optionRow}
              onPress={() => setNumpadStyle(option.value)}
            >
              <View native style={styles.optionContent}>
                <View style={styles.optionContentRow}>
                  {/* Radio, label and description Container */}
                  <View style={styles.optionRowContentLabelSection}>
                    {/* Radio container */}
                    <View
                      native
                      style={[
                        styles.radioButton,
                        isSelected && styles.radioButtonSelected,
                      ]}
                    >
                      {isSelected && (
                        <View native style={styles.radioButtonInner} />
                      )}
                    </View>
                    {/* Label & description container */}
                    <View style={styles.optionRowContentLabelWrap}>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text variant="small" style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                </View>

                <NumpadRenderer type={option.value} />
              </View>
            </Pressable>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.onSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsList: {
    gap: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    gap: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.onSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  optionContent: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
    backgroundColor: theme.colors.secondary,
  },
  optionLabelSelected: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  optionDescription: {
    fontSize: 13,
    color: theme.colors.onSecondary,
    lineHeight: 18,
  },

  optionContentRow: {
    flexDirection: "column",
  },
  optionRowContentLabelSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: theme.colors.secondary,
    gap: 12,
  },
  optionRowContentLabelWrap: {
    backgroundColor: theme.colors.secondary,
  },

  numpadContainer: {
    backgroundColor: "transparent",
    padding: 4,
    borderRadius: 24,
    marginBottom: 32,
    width: "100%",
    maxWidth: 150,
    alignSelf: "center",
  },
  grid: {
    backgroundColor: "transparent",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    backgroundColor: theme.colors.surface,
    height: 28,
    maxWidth: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    margin: "1%",
    flexBasis: "23%",
  },
  buttonText: {
    color: theme.colors.onSurface,
    fontSize: 14,
    fontWeight: "400",
  },
}))
