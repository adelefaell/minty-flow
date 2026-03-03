import { StyleSheet } from "react-native-unistyles"

import type { IconSymbolName } from "~/components/ui/icon-symbol"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

type AlertBannerProps = {
  text: string
  icon?: IconSymbolName
}

export function InfoBanner({ text, icon = "information" }: AlertBannerProps) {
  return (
    <View style={styles.container}>
      <IconSymbol name={icon} size={20} style={styles.icon} />
      <Text style={styles.text}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  icon: {
    color: theme.colors.customColors.semi,
  },
  text: {
    fontSize: 13,
    color: theme.colors.customColors.semi,
    lineHeight: 18,
    flex: 1,
  },
}))
