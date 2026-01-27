import { type Href, useRouter } from "expo-router"
import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { ActionItem } from "~/components/action-item"
import type { IconSymbolName } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

interface PreferenceItem {
  id: string
  title: string
  description?: string
  route: Href
  icon: IconSymbolName
}

const appearanceItems: PreferenceItem[] = [
  {
    id: "theme",
    title: "Theme",
    description: "Choose your preferred theme",
    route: "/(settings)/(preferences)/theme",
    icon: "palette-swatch-outline",
  },
  {
    id: "money-formatting",
    title: "Money Formatting",
    description: "Configure how money is displayed",
    route: "/(settings)/(preferences)/money-formatting",
    icon: "pound",
  },
  {
    id: "numpad",
    title: "Numpad",
    description: "Configure numpad layout",
    route: "/(settings)/(preferences)/numpad",
    icon: "dialpad",
  },
  {
    id: "toast",
    title: "Toast Style",
    description: "Configure your preferred toast style",
    route: "/(settings)/(preferences)/toast-style",
    icon: "toaster",
  },
]

const otherPreferenceItems: PreferenceItem[] = [
  {
    id: "privacy",
    title: "Privacy",
    description: "Manage privacy and security settings",
    route: "/(settings)/(preferences)/privacy",
    icon: "lock-outline",
  },
  {
    id: "transaction-location",
    title: "Transaction Location",
    description: "Configure transaction location settings",
    route: "/(settings)/(preferences)/transaction-location",
    icon: "map-marker-outline",
  },
  {
    id: "exchange-rates",
    title: "Exchange Rates",
    description: "Configure your preferred exchange rates",
    route: "/(settings)/(preferences)/exchange-rates",
    icon: "wallet",
  },
  {
    id: "trash-bin",
    title: "Trash bin",
    description: "Manage deleted items and retention period",
    route: "/(settings)/(preferences)/trash-bin",
    icon: "trash-can-outline",
  },
  {
    id: "reminder",
    title: "Reminder",
    description: "Set up daily reminders for expense tracking",
    route: "/(settings)/(preferences)/reminder",
    icon: "bell-outline",
  },
  {
    id: "pending-transactions",
    title: "Pending transactions",
    description: "Configure pending transaction settings",
    route: "/(settings)/(preferences)/pending-transactions",
    icon: "clock-outline",
  },
]

export default function PreferencesScreen() {
  const router = useRouter()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Other Preferences */}
      <View style={styles.section}>
        <View style={styles.itemsList}>
          {otherPreferenceItems.map((item) => (
            <ActionItem
              key={item.id}
              icon={item.icon}
              title={item.title}
              // description={item.description}
              onPress={() => router.push(item.route)}
            />
          ))}
        </View>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text variant="h4" style={styles.sectionTitle}>
          Appearance
        </Text>
        <View style={styles.itemsList}>
          {appearanceItems.map((item) => (
            <ActionItem
              key={item.id}
              icon={item.icon}
              title={item.title}
              // description={item.description}
              onPress={() => router.push(item.route)}
            />
          ))}
        </View>
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
  section: {
    marginBlock: 10,
  },
  sectionTitle: {
    fontWeight: "600",
    color: theme.colors.onSurface,
    paddingHorizontal: 20,
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
  itemDescription: {
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
