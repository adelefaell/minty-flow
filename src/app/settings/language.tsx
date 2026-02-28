import { useTranslation } from "react-i18next"
import { ScrollView } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import {
  LangCodeEnum,
  type LangCodeType,
  useLanguageStore,
} from "~/stores/language.store"

const languageOptions: Array<{
  value: LangCodeType
  label: string
}> = [
  {
    value: LangCodeEnum.EN,
    label: "English",
  },
  {
    value: LangCodeEnum.AR,
    label: "العربية",
  },
]

export default function LanguageOptionsScreen() {
  const { t } = useTranslation()
  const { theme } = useUnistyles()
  const languageCode = useLanguageStore((s) => s.languageCode)
  const setLanguageCode = useLanguageStore((s) => s.setLanguageCode)
  const switchLanguage = (code: LangCodeType) => {
    setLanguageCode(code)
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View native style={styles.sectionLabel}>
        <Text variant="small" style={styles.sectionLabelText}>
          {t("screens.settings.preferences.language.sectionLabel")}
        </Text>
      </View>
      <View native style={styles.card}>
        {languageOptions.map((option, index) => {
          const isSelected = languageCode === option.value
          const isLast = index === languageOptions.length - 1
          return (
            <View key={option.value} native>
              <Pressable
                style={styles.row}
                onPress={() => {
                  setLanguageCode(option.value)
                  switchLanguage(option.value)
                }}
              >
                <View native style={styles.rowContent}>
                  <Text style={styles.rowLabel}>{option.label}</Text>
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
    fontWeight: "600",
    letterSpacing: 1,

    color: theme.colors.customColors?.semi,
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
