import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

export default function DataManagementScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="h2" style={styles.title}>
        Data Management
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>COMING SOON</Text>
      </View>
      <Text variant="p" style={styles.description}>
        Backup, import, and export your financial data. Keep your information
        safe and portable across devices.
      </Text>
      <View style={styles.placeholder}>
        <Text variant="small" style={styles.placeholderText}>
          Data management tools in development
        </Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.colors.radius,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.onSecondary,
  },
  description: {
    fontSize: 15,
    color: theme.colors.onSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  placeholder: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
  },
  placeholderText: {
    fontSize: 14,
    color: theme.colors.onSecondary,
  },
}))
