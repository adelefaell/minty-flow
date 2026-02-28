import { useTranslation } from "react-i18next"
import { ScrollView } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { Money } from "~/components/money"
import { IconSymbol } from "~/components/ui/icon-symbol"
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
    description: "e.g., $, €, £",
  },
  {
    value: MoneyFormatEnum.CODE,
    label: "Code",
    description: "e.g., USD, EUR, GBP",
  },
  {
    value: MoneyFormatEnum.NAME,
    label: "Name",
    description: "e.g., US Dollar, Euro",
  },
]

export default function MoneyFormattingScreen() {
  const { theme } = useUnistyles()
  const preferredCurrency = useMoneyFormattingStore((s) => s.preferredCurrency)
  const setCurrencyLook = useMoneyFormattingStore((s) => s.setCurrencyLook)
  const currencyLook = useMoneyFormattingStore((s) => s.currencyLook)
  const exampleAmount = 1234.56
  const { t } = useTranslation()

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View native style={styles.previewSection}>
        <Text variant="small" style={styles.previewLabel}>
          {t(
            "screens.settings.preferences.appearance.moneyFormatting.previewLabel",
          )}
        </Text>
        <Money
          value={exampleAmount}
          variant="h2"
          currency={preferredCurrency}
        />
      </View>

      <View native style={styles.sectionLabel}>
        <Text variant="small" style={styles.sectionLabelText}>
          {t(
            "screens.settings.preferences.appearance.moneyFormatting.displayFormatLabel",
          )}
        </Text>
      </View>
      <View native style={styles.card}>
        {formatOptions.map((option, index) => {
          const isSelected = currencyLook === option.value
          const isLast = index === formatOptions.length - 1
          return (
            <View key={option.value} native>
              <Pressable
                style={styles.row}
                onPress={() => setCurrencyLook(option.value)}
              >
                <View native style={styles.rowContent}>
                  <Text style={styles.rowLabel}>
                    {t(
                      `screens.settings.preferences.appearance.moneyFormatting.options.${option.value}.label`,
                    )}
                  </Text>
                  <Text variant="small" style={styles.rowDescription}>
                    {t(
                      `screens.settings.preferences.appearance.moneyFormatting.options.${option.value}.description`,
                    )}
                  </Text>
                </View>
                {isSelected ? (
                  <IconSymbol
                    name="check"
                    size={20}
                    color={theme.colors.primary}
                  />
                ) : null}
              </Pressable>
              {!isLast ? <View native style={styles.divider} /> : null}
            </View>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 48,
  },

  previewSection: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 8,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    opacity: 0.5,
  },

  sectionLabel: {
    paddingHorizontal: 4,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    opacity: 0.5,
  },

  card: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSecondary,
  },
  rowDescription: {
    fontSize: 13,
    color: theme.colors.customColors.semi,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.customColors?.semi,
  },
}))
