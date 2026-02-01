import { ScrollView } from "react-native-gesture-handler"
import { StyleSheet } from "react-native-unistyles"

import { IconSymbol, VALID_ICON_NAMES } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

// TODO: delete later
export default function IconsScreen() {
  return (
    <ScrollView>
      <View style={styles.container}>
        {VALID_ICON_NAMES.map((icon, index) => (
          <View key={icon + index.toString()}>
            <Text variant="h4">{icon}</Text>
            <View style={styles.iconsWrapper}>
              <IconSymbol name={icon} size={40} />
              <IconSymbol name={icon} size={40} outline />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  iconsWrapper: {
    flexDirection: "row",
    gap: 16,
  },
}))
