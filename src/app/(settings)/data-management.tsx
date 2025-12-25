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
    backgroundColor: theme.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.foreground,
    marginBottom: 12,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: theme.muted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.mutedForeground,
  },
  description: {
    fontSize: 15,
    color: theme.mutedForeground,
    lineHeight: 22,
    marginBottom: 24,
  },
  placeholder: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.muted,
    borderRadius: theme.radius,
  },
  placeholderText: {
    fontSize: 14,
    color: theme.mutedForeground,
  },
}))
