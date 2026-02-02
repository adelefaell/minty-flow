import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker"
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

import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { useTimeUtils } from "~/hooks/use-time-utils"
import { useNotificationStore } from "~/stores/notification.store"

const DAILY_REMINDER_ID = "daily-check-in-reminder"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export default function ReminderScreen() {
  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.PermissionStatus>(
      Notifications.PermissionStatus.UNDETERMINED,
    )

  const {
    isDailyReminderEnabled,
    dailyReminderTime,
    setDailyReminderEnabled,
    setDailyReminderTime,
  } = useNotificationStore()

  const dailyReminderDate = (() => {
    const [hours, minutes] = dailyReminderTime.split(":").map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  })()

  const { formatReadableTime } = useTimeUtils()
  const [showIosPicker, setShowIosPicker] = useState(false)

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

  const scheduleDailyReminder = async (time: Date) => {
    // Cancel the specific daily reminder if it exists
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID)

    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_ID,
      content: {
        title: "Time for a check-in! 🍃",
        body: "Don't forget to log your transactions for today.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.getHours(),
        minute: time.getMinutes(),
      },
    })
  }

  const handleToggleDailyReminder = async (value: boolean) => {
    setDailyReminderEnabled(value)
    if (value) {
      if (permissionStatus !== Notifications.PermissionStatus.GRANTED) {
        await handleRequestPermission()
      }
      await scheduleDailyReminder(dailyReminderDate)
    } else {
      await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID)
    }
  }

  const handleTimeChange = async (newTime: Date) => {
    const timeStr = `${newTime.getHours().toString().padStart(2, "0")}:${newTime.getMinutes().toString().padStart(2, "0")}`
    setDailyReminderTime(timeStr)
    if (isDailyReminderEnabled) {
      await scheduleDailyReminder(newTime)
    }
  }

  const onIosTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "set" && date) {
      handleTimeChange(date)
    }
    setShowIosPicker(false)
  }

  const showTimePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: dailyReminderDate,
        onChange: (event, date) => {
          if (event.type === "set" && date) {
            handleTimeChange(date)
          }
        },
        mode: "time",
        is24Hour: false,
      })
    } else {
      setShowIosPicker(true)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* grant permission button */}
      {permissionStatus !== Notifications.PermissionStatus.GRANTED && (
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

      {/* Remind daily */}
      <Pressable
        style={styles.settingRow}
        onPress={() => handleToggleDailyReminder(!isDailyReminderEnabled)}
      >
        <View style={styles.labelContainer}>
          <Text variant="p" style={styles.settingLabel}>
            Remind daily
          </Text>
          <Text variant="small" style={styles.settingLabelDescription}>
            Remind me to log my transactions
          </Text>
        </View>
        <Switch
          value={isDailyReminderEnabled === true}
          onValueChange={handleToggleDailyReminder}
        />
      </Pressable>

      {isDailyReminderEnabled && (
        <View style={styles.section}>
          <Text style={styles.headerLabel}>Remind me at</Text>

          {/* The Main Time Card */}
          <Pressable style={styles.timeCard} onPress={showTimePicker}>
            <Text style={styles.timeText}>
              {formatReadableTime(dailyReminderDate)}
            </Text>
          </Pressable>

          {/* iOS Native Picker Modal */}
          {Platform.OS === "ios" && showIosPicker && (
            <DateTimePicker
              value={dailyReminderDate}
              mode="time"
              display="spinner"
              onChange={onIosTimeChange}
            />
          )}

          {/* The Info Footer */}
          <View style={styles.footer}>
            <IconSymbol
              name="information"
              size={24}
              style={styles.footerIcon}
            />
            <Text style={styles.footerText}>
              Reminders will stop if you don't open the app for 7 consecutive
              days
            </Text>
          </View>

          {/* TODO: DELETE LATER */}
          {/* Press to schedule a notification */}
          <Button
            variant="default"
            onPress={async () => await schedulePushNotification()}
            style={[styles.actionButton, { marginTop: 100 }]}
          >
            <Text variant="default">Press Test Notification</Text>
          </Button>
        </View>
      )}
    </ScrollView>
  )
}

// TODO: refactore this LATER
async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: "Here is the notification body",
      data: { data: "goes here", test: { test1: "more data" } },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
    },
  })
}

/**
 * Gets the current notification permission status.
 */
async function getPermissionCurrentStatusAsync(): Promise<Notifications.PermissionStatus> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  return existingStatus
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: theme.colors.onSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    paddingVertical: 10,
    paddingHorizontal: 20,
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
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  settingLabelDescription: {
    fontSize: 13,
    fontWeight: "400",
  },
  headerLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  timeCard: {
    backgroundColor: theme.colors.boxShadow,
    borderRadius: theme.colors.radius,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  timeText: {
    fontSize: 48,
    fontWeight: "500",
    height: 64,
    textAlignVertical: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 4,
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
