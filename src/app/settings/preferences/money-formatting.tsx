import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Money } from "~/components/ui/money"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import {
  MoneyFormatEnum,
  type MoneyFormatType,
  useMoneyFormattingStore,
} from "~/stores/money-formatting.store"

const formatOptions: Array<{
  value: MoneyFormatType
  label: string
  description: string
}> = [
  {
    value: MoneyFormatEnum.SYMBOL,
    label: "Symbol",
    description: "Display currency symbol (e.g., $, €, £)",
  },
  {
    value: MoneyFormatEnum.CODE,
    label: "Code",
    description: "Display currency code (e.g., USD, EUR, GBP)",
  },
  {
    value: MoneyFormatEnum.NAME,
    label: "Name",
    description: "Display currency name (e.g., US Dollar, Euro)",
  },
]

export default function MoneyFormattingScreen() {
  const preferredCurrency = useMoneyFormattingStore((s) => s.preferredCurrency)
  const setCurrencyLook = useMoneyFormattingStore((s) => s.setCurrencyLook)
  const currencyLook = useMoneyFormattingStore((s) => s.currencyLook)

  const exampleAmount = 1234.56

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Current Format Preview */}
      <View native style={styles.previewSection}>
        <Text variant="small" style={styles.previewLabel}>
          Preview
        </Text>

        <Money
          value={exampleAmount}
          variant="h2"
          currency={preferredCurrency}
        />

        <Text variant="small" style={styles.previewDescription}>
          Example: {exampleAmount}
        </Text>
      </View>

      {/* Format Options */}
      <View native style={styles.section}>
        <Text variant="p" style={styles.sectionTitle}>
          Currency Display Format
        </Text>
        <Text variant="small" style={styles.sectionDescription}>
          Choose how currency is displayed throughout the app
        </Text>

        <View native style={styles.optionsList}>
          {formatOptions.map((option) => {
            const isSelected = currencyLook === option.value
            return (
              <Pressable
                key={option.value}
                style={styles.optionRow}
                onPress={() => setCurrencyLook(option.value)}
              >
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
                <View native style={styles.optionContent}>
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
              </Pressable>
            )
          })}
        </View>
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
  previewSection: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.onSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  previewValue: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 13,
    color: theme.colors.onSecondary,
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
}))
