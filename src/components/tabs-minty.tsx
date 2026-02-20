import { Pressable, type StyleProp, type ViewStyle } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { IconSymbol, type IconSymbolName } from "./ui/icon-symbol"
import { Text } from "./ui/text"
import { View } from "./ui/view"

type TabMintyItem<T> = {
  value: T
  label: string
  icon?: IconSymbolName
}

type TabsMintyProps<T> = {
  items: TabMintyItem<T>[]
  activeValue: T
  onValueChange: (value: T) => void
  variant?: "button" | "segmented"
  style?: StyleProp<ViewStyle>
}

export const TabsMinty = <T,>({
  items,
  activeValue,
  onValueChange,
  variant = "button",
  style,
}: TabsMintyProps<T>) => {
  const isSegmented = variant === "segmented"
  // const isButton = variant === "segmented"

  return (
    <View
      style={[
        isSegmented ? styles.segmentedContainer : styles.buttonContainer,
        style,
      ]}
    >
      {items.map((item) => {
        const isActive = activeValue === item.value

        return (
          <Pressable
            key={String(item.value)}
            style={[
              isSegmented ? styles.segmentedTab : styles.buttonTab,
              isActive &&
                (isSegmented
                  ? styles.segmentedTabActive
                  : styles.buttonTabActive),
            ]}
            onPress={() => onValueChange(item.value)}
          >
            {item.icon && (
              <IconSymbol
                name={item.icon}
                size={18}
                style={[styles.icon, isActive && styles.iconActive]}
              />
            )}
            <Text
              variant="default"
              style={[styles.label, isActive && styles.labelActive]}
            >
              {item.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  // Button variant (Variant 1)
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    margin: 20,
  },
  buttonTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.secondary,
    gap: 6,
  },
  buttonTabActive: {
    backgroundColor: theme.colors.primary,
  },
  // Segmented variant (Variant 2)
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    padding: 4,
    gap: 4,
    margin: 20,
  },
  segmentedTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: theme.colors.radius,
    gap: 6,
  },
  segmentedTabActive: {
    backgroundColor: theme.colors.primary,
  },

  // Common styles
  icon: {
    color: theme.colors.onSurface,
  },
  iconActive: {
    color: theme.colors.onPrimary,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  labelActive: {
    color: theme.colors.onPrimary,
  },
}))
