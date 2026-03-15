import { useTranslation } from "react-i18next"
import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { EmptyState } from "~/components/ui/empty-state"
import { Text } from "~/components/ui/text"

export default function LoansScreen() {
  const { t } = useTranslation()
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="h2" style={styles.title}>
        {t("screens.settings.loans.title")}
      </Text>
      <Text variant="p" style={styles.description}>
        {t("screens.settings.loans.body")}
      </Text>
      <EmptyState
        icon="cash-banknote"
        title={t("screens.settings.loans.empty")}
      />
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
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: theme.colors.onSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
}))
