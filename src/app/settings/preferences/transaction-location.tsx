import * as Location from "expo-location"
import { Linking, ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { IconSymbol } from "~/components/ui/icon-symbol"
import { PermissionBanner } from "~/components/ui/permission-banner"
import { Pressable } from "~/components/ui/pressable"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { useLocationPermissionStatus } from "~/hooks/use-location-permission-status"
import { useTransactionLocationStore } from "~/stores/transaction-location.store"

export default function TransactionLocationScreen() {
  const { permissionStatus, refreshPermissionStatus } =
    useLocationPermissionStatus()
  const { isEnabled, autoAttach, setIsEnabled, setAutoAttach } =
    useTransactionLocationStore()

  const isGranted = permissionStatus === Location.PermissionStatus.GRANTED
  const showBanner = permissionStatus !== null && !isGranted

  const handleRequestPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    await refreshPermissionStatus()
    if (status !== Location.PermissionStatus.GRANTED) {
      await Linking.openSettings()
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {showBanner && (
        <PermissionBanner
          message="Location permission not granted"
          onPress={handleRequestPermission}
        />
      )}

      <Pressable
        style={styles.settingRow}
        onPress={() => setIsEnabled(!isEnabled)}
      >
        <View style={styles.labelContainer}>
          <Text variant="p" style={styles.settingLabel}>
            Enable
          </Text>
          <Text variant="small" style={styles.settingLabelDescription}>
            Auto-capture location on new transactions
          </Text>
        </View>
        <Switch value={isEnabled} onValueChange={setIsEnabled} />
      </Pressable>

      {isEnabled && (
        <Pressable
          style={styles.settingRow}
          onPress={() => setAutoAttach(!autoAttach)}
        >
          <View style={styles.labelContainer}>
            <Text variant="p" style={styles.settingLabel}>
              Auto-attach
            </Text>
            <Text variant="small" style={styles.settingLabelDescription}>
              Attach location without prompting
            </Text>
          </View>
          <Switch value={autoAttach} onValueChange={setAutoAttach} />
        </Pressable>
      )}

      <View style={styles.footer}>
        <IconSymbol name="information" size={24} style={styles.footerIcon} />
        <Text style={styles.footerText}>
          When enabled, your current location can be attached to new
          transactions. You can still add or remove it manually on each
          transaction.
        </Text>
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
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 16,
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
  footer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  footerIcon: {
    color: theme.colors.onSecondary,
    opacity: 0.7,
    marginTop: 2,
  },
  footerText: {
    fontSize: 13,
    color: theme.colors.onSecondary,
    opacity: 0.7,
    lineHeight: 18,
    flex: 1,
    fontStyle: "italic",
  },
}))
