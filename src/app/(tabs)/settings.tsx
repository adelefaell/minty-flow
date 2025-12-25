import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Pressable, ScrollView } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { ProfileSection } from "~/components/profile-section"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  description: string
  onPress: () => void
  soon?: boolean
}

function SettingsItem({
  icon,
  title,
  description,
  onPress,
  soon,
}: SettingsItemProps) {
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
        color: theme.rippleColor,
        foreground: true, // <-- KEY TO MAKE IT SHOW
      }}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={18} style={styles.icon} />
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
      <Ionicons name="chevron-forward" size={18} style={styles.chevron} />
    </Pressable>
  )
}

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
            icon="cash-outline"
            title="Loans"
            description="Track money lent and borrowed"
            onPress={() => router.push("/(settings)/loans")}
          />

          <SettingsItem
            icon="grid-outline"
            title="Categories"
            description="Manage your transaction categories"
            onPress={() => router.push("/(settings)/categories")}
          />

          <SettingsItem
            icon="pricetag-outline"
            title="Tags"
            description="Manage your transaction tags"
            onPress={() => router.push("/(settings)/tags")}
          />

          <SettingsItem
            icon="trash-outline"
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
            icon="settings-outline"
            title="Preferences"
            description="General preferences"
            onPress={() => router.push("/(settings)/preferences")}
          />

          <SettingsItem
            icon="server-outline"
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
    backgroundColor: theme.background,
    marginBottom: 50,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
    color: theme.mutedForeground,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
    color: theme.mutedForeground,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderColor: theme.border,
  },
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
    borderRadius: theme.radius,
    backgroundColor: theme.card,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  icon: {
    color: theme.foreground,
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
    fontWeight: "semibold",
    color: theme.foreground,
    marginBottom: 2,
  },
  settingsItemDescription: {
    fontSize: 13,
    color: theme.mutedForeground,
  },
  badge: {
    backgroundColor: theme.muted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: theme.mutedForeground,
  },
  chevron: {
    color: theme.mutedForeground,
    marginLeft: 8,
  },
}))
