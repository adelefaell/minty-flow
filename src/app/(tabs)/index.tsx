import { StyleSheet } from "react-native-unistyles"

import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

export default function HomeScreen() {
  return (
    <View style={styles.stepContainer}>
      <Text variant="h2" style={styles.pageTitle}>
        Home page
      </Text>
      <Text variant="p" style={styles.description}>
        Here where the transaction lives
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((t) => ({
  stepContainer: {
    gap: 8,
    paddingBlock: 200,
  },
  pageTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    marginBottom: 16,
    textAlign: "center",
    color: t.colors.onSecondary,
  },
}))
