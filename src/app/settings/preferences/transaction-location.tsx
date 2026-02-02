import { PermissionsAndroid, Platform, ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { useTransactionLocationStore } from "~/stores/transaction-location.store"

export default function TransactionLocationScreen() {
  const enableLocation = useTransactionLocationStore((s) => s.enableLocation)
  const autoAttach = useTransactionLocationStore((s) => s.autoAttach)
  const setEnableLocation = useTransactionLocationStore(
    (s) => s.setEnableLocation,
  )
  const setAutoAttach = useTransactionLocationStore((s) => s.setAutoAttach)

  const requestLocationPermission = async () => {
    if (!enableLocation) {
      try {
        if (Platform.OS === "android") {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Permission",
              message:
                "This app needs access to your location for transaction tagging.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK",
            },
          )
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            return
          }
        } else if (Platform.OS === "ios") {
          // For iOS, you would typically use expo-location or similar
          // This is a placeholder for the permission request
          const granted = true // Replace with actual permission check
          if (!granted) {
            return
          }
        }
      } catch {
        // Permission was denied or error occurred
        return
      }
    }
    setEnableLocation(!enableLocation)
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="h2" style={styles.title}>
        Transaction Location
      </Text>
      <Text variant="p" style={styles.description}>
        Configure transaction location settings.
      </Text>

      {/* Enable Location Toggle */}
      <View native style={styles.section}>
        <View native style={styles.toggleRow}>
          <View native style={styles.toggleInfo}>
            <Text variant="p" style={styles.toggleLabel}>
              Enable Location
            </Text>
            <Text variant="small" style={styles.toggleDescription}>
              Allow app to access your location for transaction tagging
            </Text>
          </View>
          <Switch
            value={enableLocation}
            onValueChange={requestLocationPermission}
          />
        </View>
      </View>

      {/* Auto Attach Toggle */}
      <View native style={styles.section}>
        <View native style={styles.toggleRow}>
          <View native style={styles.toggleInfo}>
            <Text variant="p" style={styles.toggleLabel}>
              Auto Attach
            </Text>
            <Text variant="small" style={styles.toggleDescription}>
              Automatically attach location to new transactions
            </Text>
          </View>
          <Switch value={autoAttach} onValueChange={setAutoAttach} />
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
    padding: 20,
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
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
    gap: 4,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  toggleDescription: {
    fontSize: 13,
    color: theme.colors.onSecondary,
    lineHeight: 18,
  },
}))
