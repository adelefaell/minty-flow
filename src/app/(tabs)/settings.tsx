import { useRouter } from "expo-router"
import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { ProfileSection } from "~/components/profile-section"
import { SettingsItem } from "~/components/settings-item"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

export default function SettingsScreen() {
  const router = useRouter()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h2" style={styles.headerTitle}>
          SETTINGS
        </Text>
      </View>

      {/* User Profile Section */}
      <ProfileSection />

      {/* Money Management Section */}
      <View style={styles.section}>
        <Text variant="small" style={styles.sectionTitle}>
          MONEY MANAGEMENT
        </Text>
        <View style={styles.sectionContent}>
          <SettingsItem
            icon="dollarsign.circle"
            title="Loans"
            description="Track money lent and borrowed"
            onPress={() => router.push("/(settings)/loans")}
          />

          <SettingsItem
            icon="square.grid.2x2"
            title="Categories"
            description="Manage your transaction categories"
            onPress={() => router.push("/(settings)/categories")}
          />

          <SettingsItem
            icon="tag"
            title="Tags"
            description="Manage your transaction tags"
            onPress={() => router.push("/(settings)/tags")}
          />

          <SettingsItem
            icon="trash"
            title="Trash"
            description="View and restore deleted transactions"
            onPress={() => router.push("/(settings)/trash")}
          />
        </View>
      </View>

      {/* Other Settings Section */}
      <View style={styles.section}>
        <Text variant="small" style={styles.sectionTitle}>
          OTHER SETTINGS
        </Text>
        <View style={styles.sectionContent}>
          <SettingsItem
            icon="gearshape.fill"
            title="Preferences"
            description="General preferences"
            onPress={() => router.push("/(settings)/preferences")}
          />

          <SettingsItem
            icon="server.rack"
            title="Data Management"
            description="Backup, import, and export your data"
            onPress={() => router.push("/(settings)/data-management")}
            soon={true}
          />
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
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
    color: theme.colors.onSecondary,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
    color: theme.colors.onSecondary,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  },
}))
