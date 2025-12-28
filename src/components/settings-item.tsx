import { Pressable } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { IconSymbol, type IconSymbolName } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

interface SettingsItemProps {
  icon: IconSymbolName
  title: string
  description: string
  onPress: () => void
  soon?: boolean
}

export const SettingsItem = ({
  icon,
  title,
  description,
  onPress,
  soon,
}: SettingsItemProps) => {
  const { theme } = useUnistyles()

  return (
    <Pressable
      style={(state) => [
        styles.settingsItem,
        state.pressed && styles.settingsItemPressed,
        soon && { opacity: 0.5 },
      ]}
      onPress={onPress}
      android_ripple={{
        color: theme.colors.rippleColor,
        foreground: true, // <-- KEY TO MAKE IT SHOW
      }}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.iconContainer}>
          <IconSymbol name={icon} size={24} />
        </View>
        <View style={styles.settingsItemContent}>
          <View style={styles.titleRow}>
            <Text variant="default" style={styles.settingsItemTitle}>
              {title}
            </Text>
            {soon && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>SOON</Text>
              </View>
            )}
          </View>
          <Text variant="small" style={styles.settingsItemDescription}>
            {description}
          </Text>
        </View>
      </View>
      <IconSymbol name="chevron.right" size={18} />
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    // backgroundColor: theme.card,
  },
  settingsItemPressed: {
    opacity: 0.8,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingsItemContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingsItemTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  settingsItemDescription: {
    fontSize: 13,
    color: theme.colors.onSecondary,
  },
  badge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: theme.colors.onSecondary,
  },
  chevron: {
    marginLeft: 8,
  },
}))
