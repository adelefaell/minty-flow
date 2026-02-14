import * as Notifications from "expo-notifications"
import { useEffect, useState } from "react"
import {
  AppState,
  type AppStateStatus,
  Linking,
  Platform,
  Pressable,
  ScrollView,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { ChoiceChipsComponent } from "~/components/choice-chips"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import {
  PendingTransactionEarlyReminder,
  PendingTransactionRange,
  usePendingTransactionStore,
} from "~/stores/pending-transaction.store"

/**
 * Gets the current notification permission status.
 */
async function getPermissionCurrentStatusAsync(): Promise<Notifications.PermissionStatus> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  return existingStatus
}

export default function PendingTransactionsPreferencesScreen() {
  const pendingTransactionRange = usePendingTransactionStore(
    (s) => s.pendingTransactionRange,
  )
  const pendingTransactionReminder = usePendingTransactionStore(
    (s) => s.PendingTransactionEarlyReminder,
  )
  const RequireConfirmation = usePendingTransactionStore(
    (s) => s.RequireConfirmation,
  )
  const UpdateDateOnConfirm = usePendingTransactionStore(
    (s) => s.UpdateDateOnConfirm,
  )
  const setPendingTransactionRange = usePendingTransactionStore(
    (s) => s.setPendingTransactionRange,
  )
  const setPendingTransactionReminder = usePendingTransactionStore(
    (s) => s.setPendingTransactionEarlyReminder,
  )
  const setRequireConfirmation = usePendingTransactionStore(
    (s) => s.setRequireConfirmation,
  )
  const setUpdateDateOnConfirm = usePendingTransactionStore(
    (s) => s.setUpdateDateOnConfirm,
  )

  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.PermissionStatus>(
      Notifications.PermissionStatus.UNDETERMINED,
    )

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          getPermissionCurrentStatusAsync().then((status) => {
            setPermissionStatus(status)
          })
        }
      },
    )
    getPermissionCurrentStatusAsync().then((status) =>
      setPermissionStatus(status),
    )
    return () => {
      subscription.remove()
    }
  }, [])

  const handleRequestPermission = async () => {
    // Android notification channel setup
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
      })
    }

    const { status } = await Notifications.requestPermissionsAsync()
    setPermissionStatus(status)

    if (status !== Notifications.PermissionStatus.GRANTED) {
      // If it's still not granted (e.g. user denied or it's already denied),
      // open settings as a fallback for the user.
      await Linking.openSettings()
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Retention Period Choices */}
      <ChoiceChipsComponent
        title="Show on home"
        description="Select the look‑ahead range for pending transactions"
        style={{
          paddingHorizontal: 20,
        }}
        choices={Object.values(PendingTransactionRange)}
        selectedValue={pendingTransactionRange}
        onSelect={(choice) => setPendingTransactionRange(choice)}
      />

      {/* Require Confirmation */}
      <Pressable
        style={styles.settingRow}
        onPress={() => setRequireConfirmation(!RequireConfirmation)}
      >
        <View style={styles.labelContainer}>
          <Text variant="p" style={styles.settingLabel}>
            Require confirmation
          </Text>
        </View>
        <Switch
          value={RequireConfirmation}
          onValueChange={() => setRequireConfirmation(!RequireConfirmation)}
        />
      </Pressable>

      {/* Update Date On Confirm  */}
      {RequireConfirmation && (
        <Pressable
          style={styles.settingRow}
          onPress={() => setUpdateDateOnConfirm(!UpdateDateOnConfirm)}
        >
          <View style={styles.labelContainer}>
            <Text variant="p" style={styles.settingLabel}>
              Update date on confirm
            </Text>
            <Text variant="p" style={styles.settingDescription}>
              Disable to retain original transaction date
            </Text>
          </View>
          <Switch
            value={UpdateDateOnConfirm}
            onValueChange={() => setUpdateDateOnConfirm(!UpdateDateOnConfirm)}
          />
        </Pressable>
      )}

      {/* grant permission button */}
      {permissionStatus !== Notifications.PermissionStatus.GRANTED &&
        RequireConfirmation && (
          <Pressable
            onPress={handleRequestPermission}
            style={styles.actionButton}
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

      {/* Early Reminder */}
      {RequireConfirmation && (
        <ChoiceChipsComponent
          title="Early Reminder"
          description="description goes here..."
          style={{
            paddingHorizontal: 20,
          }}
          choices={Object.values(PendingTransactionEarlyReminder)}
          selectedValue={pendingTransactionReminder}
          onSelect={(choice) => setPendingTransactionReminder(choice)}
        />
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: theme.colors.onSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  placeholder: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
  },
  placeholderText: {
    fontSize: 14,
    color: theme.colors.onSecondary,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.colors.radius ?? 12,
    gap: 6,
  },
  chipLabel: {
    fontSize: 14,
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  labelContainer: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 0,
    marginBottom: 0,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.onSecondary,
    lineHeight: 20,
    marginTop: 0,
  },

  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    flexDirection: "row",
    marginBottom: 16,
  },
  grantPermissionIcon: {
    color: theme.colors.error,
  },
  grantPermissionText: {
    fontSize: 14,
    color: theme.colors.error,
    fontWeight: "600",
  },
  grantPermissionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
}))
