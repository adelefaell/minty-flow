import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

export default function TagsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="h2" style={styles.title}>
        Tags
      </Text>
      <Text variant="p" style={styles.description}>
        Add tags to your transactions for more flexible organization and
        filtering. Tags can be used alongside categories for detailed tracking.
      </Text>
      <View style={styles.placeholder}>
        <Text variant="small" style={styles.placeholderText}>
          Tag management coming soon
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
