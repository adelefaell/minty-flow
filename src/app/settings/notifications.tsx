import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

export default function NotificationsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="h2" style={styles.title}>
        Notifications
      </Text>
      <Text variant="p" style={styles.description}>
        Manage your notification preferences. Control when and how you receive
        alerts about your finances, budgets, and goals.
      </Text>
      <View style={styles.placeholder}>
        <Text variant="small" style={styles.placeholderText}>
          Notification settings coming soon
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
