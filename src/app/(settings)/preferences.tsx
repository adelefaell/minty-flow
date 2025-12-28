import { type Href, useRouter } from "expo-router"
import { Pressable, ScrollView } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { IconSymbol, type IconSymbolName } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

interface PreferenceItem {
  id: string
  title: string
  subtitle?: string
  route: Href
  icon: IconSymbolName
}

const preferenceItems: PreferenceItem[] = [
  {
    id: "theme",
    title: "Theme",
    subtitle: "Choose light, dark, or device adaptive theme",
    route: "/(settings)/preferences/theme",
    icon: "paintbrush.fill",
  },
  {
    id: "toast",
    title: "Toast Appearance",
    subtitle: "Configure notification appearance and behavior",
    route: "/(settings)/preferences/toast-appearance",
    icon: "bell.fill",
  },
]

export default function PreferencesScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const handleItemPress = (route: Href) => {
    router.push(route)
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View native style={styles.itemsList}>
        {preferenceItems.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.item,
              pressed && styles.itemPressed,
            ]}
            onPress={() => handleItemPress(item.route)}
            android_ripple={{
              color: theme.colors.rippleColor,
              foreground: true,
            }}
          >
            <View native style={styles.itemIcon}>
              <IconSymbol name={item.icon} size={24} />
            </View>
            <View native style={styles.itemContent}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              {/* {item.subtitle && (
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              )} */}
            </View>
            <View native style={styles.itemChevron}>
              <IconSymbol name="chevron.right" size={20} />
            </View>
          </Pressable>
        ))}
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
    paddingBottom: 40,
  },
  itemsList: {
    gap: 0,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 56,
    _web: {
      cursor: "pointer",
      transitionProperty: "all",
      transitionDuration: "150ms",
      _hover: {
        backgroundColor: theme.colors.secondary,
      },
    },
  },
  itemPressed: {
    backgroundColor: theme.colors.secondary,
    opacity: 0.8,
  },
  itemIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: theme.colors.onSurface,
  },
  itemSubtitle: {
    fontSize: 13,
    color: theme.colors.onSecondary,
    lineHeight: 18,
  },
  itemChevron: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
}))
