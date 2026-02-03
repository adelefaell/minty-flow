import { type Href, useRouter } from "expo-router"
import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { ActionItem } from "~/components/action-item"
import { ProfileSection } from "~/components/profile/profile-section"
import type { IconSymbolName } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

interface SettingsItem {
  id: string
  title: string
  description?: string
  route: Href
  icon: IconSymbolName
}

const moneyManagementItems: SettingsItem[] = [
  {
    id: "loans",
    title: "Loans",
    description: "Track money lent and borrowed",
    route: "/settings/loans",
    icon: "handshake",
  },
  {
    id: "categories",
    title: "Categories",
    description: "Manage your transaction categories",
    route: "/settings/categories/categories-view",
    icon: "shape",
  },
  {
    id: "tags",
    title: "Tags",
    description: "Manage your transaction tags",
    route: "/settings/tags",
    icon: "tag-multiple",
  },
  {
    id: "trash",
    title: "Trash",
    description: "View and restore deleted transactions",
    route: "/settings/trash",
    icon: "trash-can",
  },
  {
    id: "goals",
    title: "Goals",
    description: "Set and track your financial goals",
    route: "/settings/goals",
    icon: "target",
  },
  {
    id: "budgets",
    title: "Budgets",
    description: "Create and manage your budgets",
    route: "/settings/budgets",
    icon: "chart-pie",
  },
  {
    id: "pending-transactions",
    title: "Pending Transactions",
    description: "View and manage pending transactions",
    route: "/settings/pending-transactions",
    icon: "clock",
  },
  {
    id: "bill-splitter",
    title: "Bill Splitter",
    description: "Split bills with friends and family",
    route: "/settings/bill-splitter",
    icon: "format-page-split",
  },
]

const otherSettingsItems: SettingsItem[] = [
  {
    id: "preferences",
    title: "Preferences",
    description: "General preferences",
    route: "/settings/preferences",
    icon: "puzzle-edit",
  },
  {
    id: "data-management",
    title: "Data Management",
    description: "Backup, import, and export your data",
    route: "/settings/data-management",
    icon: "server",
  },
]

export default function SettingsScreen() {
  const router = useRouter()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text variant="h2" style={styles.headerTitle}>
          SETTINGS
        </Text>
      </View> */}

      {/* User Profile Section */}
      <ProfileSection />

      {/* Money Management Section */}
      <View style={styles.section}>
        <View>
          {moneyManagementItems.map((item) => (
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

      {/* Other Settings Section */}
      <View style={styles.section}>
        <Text variant="small" style={styles.sectionTitle}>
          Other
        </Text>
        <View>
          {otherSettingsItems.map((item) => (
            <ActionItem
              key={item.id}
              icon={item.icon}
              title={item.title}
              soon={item.id === "data-management"}
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
    marginBottom: 50,
    paddingTop: 50,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: theme.colors.onSecondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: theme.colors.onSecondary,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
}))
