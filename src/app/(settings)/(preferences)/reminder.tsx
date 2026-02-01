//import Constants from "expo-constants"
import * as Device from "expo-device"
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
import { logger } from "~/utils/logger"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export default function ReminderScreen() {
  const [expoPushToken, setExpoPushToken] = useState("")
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    [],
  )
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined)

  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.PermissionStatus>(
      Notifications.PermissionStatus.UNDETERMINED,
    )

  const [notificationSettings, setNotificationSettings] =
    useState<boolean>(false)

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

  useEffect(() => {
    const checkStatus = async () => {
      const status = await getPermissionCurrentStatusAsync()
      setPermissionStatus(status)
    }
    checkStatus()

    // 1. REGISTRATION & TOKEN FETCHING
    // This will fail on Emulators.
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        logger.info(token)
        setExpoPushToken(token)
      }
    })

    // 2. ANDROID CHANNEL SYNCING
    // Android needs "Channels" to display notifications.
    if (Platform.OS === "android") {
      Notifications.getNotificationChannelsAsync().then((value) => {
        setChannels(value ?? [])
        logger.info("Channels", { value })
      })
    }

    // 3. FOREGROUND LISTENER (App is OPEN)
    // This fires when a notification arrives while the app is actively being used.
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification)
        logger.info("FOREGROUND LISTENER", { notification })
      },
    )

    // 4. INTERACTION LISTENER (User TAPPED the notification)
    // This fires when the user actually TAPS the notification banner.
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        logger.info("INTERACTION LISTENER.", { response })
      })

    return () => {
      notificationListener.remove()
      responseListener.remove()
    }
  }, [])

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* grant permission button */}
      {permissionStatus !== Notifications.PermissionStatus.GRANTED && (
        <Button
          variant="ghost"
          onPress={async () => await Linking.openSettings()}
          style={styles.actionButton}
        >
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
        </Button>
      )}

      {/* Remind daily */}
      <Pressable
        style={styles.settingRow}
        // onPress={}
      >
        <View style={styles.iconContainer}>
          <IconSymbol name="bell" size={24} />
        </View>
        <View style={styles.labelContainer}>
          <Text variant="p" style={styles.settingLabel}>
            Remind daily
          </Text>
        </View>
        <Switch
          value={notificationSettings === true}
          onValueChange={() => setNotificationSettings(!notificationSettings)}
        />
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.headerLabel}>Remind me at</Text>

        {/* The Main Time Card */}
        <Pressable style={styles.timeCard}>
          <Text style={styles.timeText}>8:22 PM</Text>
        </Pressable>

        {/* The Info Footer */}
        <View style={styles.footer}>
          <IconSymbol name="information" size={24} style={styles.footerIcon} />
          <Text style={styles.footerText}>
            Reminders will stop if you don't open the app for 7 consecutive days
          </Text>
        </View>

        {/* Press to schedule a notification */}
        <Button
          variant="default"
          onPress={async () => await schedulePushNotification()}
          style={styles.actionButton}
        >
          <Text variant="default">Press to schedule a notification</Text>
        </Button>
      </View>

      {/* notifications data */}
      {/* <Text>Your expo push token: {expoPushToken}</Text>
      <Text>{`Channels: ${JSON.stringify(
        channels.map((c) => c.id),
        null,
        2,
      )}`}</Text>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text>
          Title: {notification && notification.request.content.title}{" "}
        </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>
          Data:{" "}
          {notification && JSON.stringify(notification.request.content.data)}
        </Text>
      </View> */}
    </ScrollView>
  )
}

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

async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Must be a physical device
  if (!Device.isDevice) {
    alert("Must use physical device for Push Notifications")
    return null
  }

  // Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "human-readable name",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    })
  }

  // Check existing permission
  let status = await getPermissionCurrentStatusAsync()

  // Request permission if needed
  if (status !== Notifications.PermissionStatus.GRANTED) {
    const result = await Notifications.requestPermissionsAsync()
    status = result.status

    if (status !== Notifications.PermissionStatus.GRANTED) {
      return null
    }
  }

  return null
  // Retrieve Expo push token
  // try {
  //   const projectId =
  //     Constants?.expoConfig?.extra?.eas?.projectId ??
  //     Constants?.easConfig?.projectId

  //   if (!projectId) {
  //     throw new Error("Project ID not found")
  //   }

  //   const { data } = await Notifications.getExpoPushTokenAsync({ projectId })
  //   logger.info(data)
  //   return data
  // } catch (error) {
  //   logger.error(
  //     "Error occurred while retrieving push token.",
  //     error as Record<string, unknown>,
  //   )
  //   return null
  // }
}

/**
 * Gets the current notification permission status.
 */
async function getPermissionCurrentStatusAsync(): Promise<Notifications.PermissionStatus> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync() // get the current permission status
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
    flex: 1,
    color: theme.colors.error,
  },
  actionButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
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
  headerLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  timeCard: {
    backgroundColor: theme.colors.boxShadow,
    borderRadius: 16,
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
