import { StyleSheet } from "react-native-unistyles"

import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

export default function StatsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="h1" style={styles.title}>
        Stats
      </Text>
      <Text variant="muted" style={styles.subtitle}>
        Use arrows to reorder
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingBlock: 200,
  },
  title: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  subtitle: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
}))
