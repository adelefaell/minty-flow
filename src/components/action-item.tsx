import { StyleSheet } from "react-native-unistyles"

import { IconSymbol, type IconSymbolName } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

interface ActionItemProps {
  icon: IconSymbolName
  title: string
  description?: string
  onPress: () => void
  soon?: boolean
}

export const ActionItem = ({
  icon,
  title,
  description,
  onPress,
  soon,
}: ActionItemProps) => {
  return (
    <Pressable
      style={() => [
        styles.actionItem,
        // state.pressed && styles.actionItemPressed,
        soon && { opacity: 0.5 },
      ]}
      onPress={onPress}
    >
      <View style={styles.actionItemLeft}>
        <View style={styles.iconContainer}>
          <IconSymbol name={icon} size={24} />
        </View>
        <View style={styles.actionItemContent}>
          <View style={styles.titleRow}>
            <Text variant="default" style={styles.actionItemTitle}>
              {title}
            </Text>
            {soon && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>SOON</Text>
              </View>
            )}
          </View>
          {description && (
            <Text variant="small" style={styles.actionItemDescription}>
              {description}
            </Text>
          )}
        </View>
      </View>
      <IconSymbol name="chevron-right" size={18} />
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    // backgroundColor: theme.card,
  },
  // actionItemPressed: {
  //   opacity: 0.8,
  // },
  actionItemLeft: {
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
  actionItemContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  actionItemDescription: {
    fontSize: 13,
    color: theme.colors.onSecondary,
  },
  badge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.colors.radius,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.onSecondary,
  },
  chevron: {
    marginLeft: 8,
  },
}))
