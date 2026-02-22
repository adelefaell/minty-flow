import { StyleSheet } from "react-native-unistyles"

import { IconSymbol, type IconSymbolName } from "./ui/icon-symbol"
import { Pressable } from "./ui/pressable"
import { Switch } from "./ui/switch"
import { Text } from "./ui/text"
import { View } from "./ui/view"

interface ToggleItemProps {
  icon: IconSymbolName
  title: string
  description?: string
  value: boolean
  onValueChange: (value: boolean) => void
}

export const ToggleItem = ({
  icon,
  title,
  description,
  value,
  onValueChange,
}: ToggleItemProps) => {
  return (
    <Pressable style={styles.toggleItem} onPress={() => onValueChange(!value)}>
      <View style={styles.toggleItemIcon}>
        <IconSymbol name={icon} size={20} />
      </View>
      <View style={styles.toggleItemContent}>
        <Text style={styles.toggleItemTitle}>{title}</Text>
        {description && (
          <Text style={styles.toggleItemDescription}>{description}</Text>
        )}
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  toggleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 56,
    backgroundColor: theme.colors.surface,
  },
  toggleItemIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  toggleItemContent: {
    backgroundColor: "transparent",
    flex: 1,
    gap: 2,
  },
  toggleItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  toggleItemDescription: {
    fontSize: 13,
    color: theme.colors.onSecondary,
    lineHeight: 18,
  },
}))
