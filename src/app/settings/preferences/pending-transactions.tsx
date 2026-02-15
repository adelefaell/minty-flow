import * as Notifications from "expo-notifications"
import { useEffect, useState } from "react"
import {
  AppState,
  type AppStateStatus,
  Linking,
  Platform,
  ScrollView,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { ChoiceChipsComponent } from "~/components/ui/choice-chips"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { usePendingTransactionsStore } from "~/stores/pending-transactions.store"

const SHOW_ON_HOME_DAYS = [1, 2, 3, 5, 7, 14, 30] as const
const SHOW_ON_HOME_CHOICES: readonly string[] = SHOW_ON_HOME_DAYS.map(
  (d) => `Next ${d} day(s)`,
)

function daysToChoice(days: number): string {
  if (SHOW_ON_HOME_DAYS.includes(days as (typeof SHOW_ON_HOME_DAYS)[number])) {
    return `Next ${days} day(s)`
  }
  const closest = SHOW_ON_HOME_DAYS.reduce((prev, curr) =>
    Math.abs(curr - days) < Math.abs(prev - days) ? curr : prev,
  )
  return `Next ${closest} day(s)`
}

function choiceToDays(choice: string): number {
  const match = choice.match(/\d+/)
  const n = match ? Number.parseInt(match[0], 10) : NaN
  return Number.isNaN(n) ? 3 : Math.min(30, Math.max(1, n))
}

async function getPermissionCurrentStatusAsync(): Promise<Notifications.PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync()
  return status
}

function PermissionWarnings() {
  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.PermissionStatus>(
      Notifications.PermissionStatus.UNDETERMINED,
    )

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          getPermissionCurrentStatusAsync().then(setPermissionStatus)
        }
      },
    )
    getPermissionCurrentStatusAsync().then(setPermissionStatus)
    return () => subscription.remove()
  }, [])

  const handleRequestPermission = async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
      })
    }
    const { status } = await Notifications.requestPermissionsAsync()
    setPermissionStatus(status)
    if (status !== Notifications.PermissionStatus.GRANTED) {
      await Linking.openSettings()
    }
  }

  const handleOpenSettings = () => {
    Linking.openSettings()
  }

  const showNotificationsRow =
    permissionStatus !== Notifications.PermissionStatus.GRANTED
  const showAlarmRow = Platform.OS === "android"

  if (!showNotificationsRow && !showAlarmRow) return null

  return (
    <View style={styles.permissionSection}>
      {showNotificationsRow && (
        <Pressable
          onPress={handleRequestPermission}
          style={styles.actionButton}
          accessibilityLabel="Grant notifications permission"
          accessibilityRole="button"
        >
          <View style={styles.grantPermissionContent}>
            <IconSymbol
              name="alert"
              outline
              size={20}
              style={styles.grantPermissionIcon}
            />
            <Text variant="default" style={styles.grantPermissionText}>
              Notifications permission not granted
            </Text>
            <IconSymbol
              name="open-in-new"
              size={20}
              style={styles.grantPermissionIcon}
            />
          </View>
        </Pressable>
      )}
      {showAlarmRow && (
        <>
          <Pressable
            onPress={handleOpenSettings}
            style={styles.actionButton}
            accessibilityLabel="Grant alarm and reminder permission"
            accessibilityRole="button"
          >
            <View style={styles.grantPermissionContent}>
              <IconSymbol
                name="alert"
                outline
                size={20}
                style={styles.grantPermissionIcon}
              />
              <Text variant="default" style={styles.grantPermissionText}>
                Alarm/Reminder permission not granted
              </Text>
              <IconSymbol
                name="open-in-new"
                size={20}
                style={styles.grantPermissionIcon}
              />
            </View>
          </Pressable>
          <View style={styles.permissionInfoRow}>
            <IconSymbol
              name="information"
              size={24}
              style={styles.footerIcon}
            />
            <Text style={styles.footerText}>
              Grant &apos;Alarms and Reminder&apos; permission (last in the
              permissions list) to receive exact-time reminders.
            </Text>
          </View>
        </>
      )}
    </View>
  )
}

function ToggleRow({
  title,
  description,
  value,
  onToggle,
}: {
  title: string
  description?: string
  value: boolean
  onToggle: () => void
}) {
  return (
    <View style={styles.toggleSection}>
      <View style={styles.toggleHeader}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Pressable
          onPress={onToggle}
          style={[
            styles.togglePill,
            value ? styles.togglePillOn : styles.togglePillOff,
          ]}
          accessibilityLabel={value ? "On" : "Off"}
          accessibilityRole="switch"
          accessibilityState={{ checked: value }}
        >
          <Text
            style={[styles.togglePillText, value && styles.togglePillTextOn]}
          >
            {value ? "On" : "Off"}
          </Text>
        </Pressable>
      </View>
      {description && (
        <Text style={styles.toggleDescription}>{description}</Text>
      )}
    </View>
  )
}

export default function PendingTransactionsPreferencesScreen() {
  const requireConfirmation = usePendingTransactionsStore(
    (s) => s.requireConfirmation,
  )
  const setRequireConfirmation = usePendingTransactionsStore(
    (s) => s.setRequireConfirmation,
  )
  const homeTimeframe = usePendingTransactionsStore((s) => s.homeTimeframe)
  const setHomeTimeframe = usePendingTransactionsStore(
    (s) => s.setHomeTimeframe,
  )
  const updateDateUponConfirmation = usePendingTransactionsStore(
    (s) => s.updateDateUponConfirmation,
  )
  const setUpdateDateUponConfirmation = usePendingTransactionsStore(
    (s) => s.setUpdateDateUponConfirmation,
  )

  const showOnHomeValue = daysToChoice(homeTimeframe)
  const handleShowOnHomeSelect = (choice: string) => {
    setHomeTimeframe(choiceToDays(choice))
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.infoRow}>
        <IconSymbol
          name="information"
          size={18}
          color={styles.infoIconColor.color}
        />
        <Text style={styles.infoText}>
          Pending transactions will not be counted towards income, expenses, and
          account balance.
        </Text>
      </View>

      <ChoiceChipsComponent
        title="Show on home"
        choices={SHOW_ON_HOME_CHOICES}
        selectedValue={showOnHomeValue}
        onSelect={handleShowOnHomeSelect}
        style={styles.choiceSection}
      />

      <ToggleRow
        title="Require confirmation"
        description="When on, new planned transactions need your approval before they count. Existing transactions keep their original mode."
        value={requireConfirmation}
        onToggle={() => setRequireConfirmation(!requireConfirmation)}
      />

      {requireConfirmation && (
        <ToggleRow
          title="Update date on confirm"
          description="Disable to retain original transaction date."
          value={updateDateUponConfirmation}
          onToggle={() =>
            setUpdateDateUponConfirmation(!updateDateUponConfirmation)
          }
        />
      )}

      <PermissionWarnings />
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
  infoRow: {
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  infoIconColor: {
    color: theme.colors.customColors.semi,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.onSecondary,
    lineHeight: 20,
  },
  choiceSection: {
    padding: 20,
  },
  toggleSection: {
    padding: 20,
  },
  toggleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.onSurface,
    flex: 1,
  },
  togglePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.colors.radius,
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  togglePillOff: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.rippleColor,
  },
  togglePillOn: {
    backgroundColor: theme.colors.primary,
    borderWidth: 0,
  },
  togglePillText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onSecondary,
  },
  togglePillTextOn: {
    color: theme.colors.onPrimary,
  },
  toggleDescription: {
    fontSize: 14,
    color: theme.colors.onSecondary,
    lineHeight: 20,
    marginTop: 6,
    paddingRight: 60,
  },
  permissionSection: {
    marginTop: 30,
    gap: 12,
  },
  grantPermissionIcon: {
    color: theme.colors.error,
  },
  grantPermissionText: {
    color: theme.colors.error,
    fontWeight: "600",
  },
  grantPermissionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  permissionInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 20,
  },
  footerIcon: {
    color: theme.colors.onSecondary,
    opacity: 0.7,
    marginTop: 5,
  },
  footerText: {
    fontSize: 13,
    color: theme.colors.onSecondary,
    opacity: 0.7,
    lineHeight: 18,
    flex: 1,
  },
}))
