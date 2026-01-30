import { useState } from "react"
import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import type { IconSymbolName } from "~/components/ui/icon-symbol"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

interface PrivacySetting {
  id: string
  label: string
  icon: IconSymbolName
  value: boolean
  onValueChange: (value: boolean) => void
}

export default function PrivacyScreen() {
  const [maskNumberAtStartup, setMaskNumberAtStartup] = useState(false)
  const [lockApp, setLockApp] = useState(false)
  const [lockAfterClosing, setLockAfterClosing] = useState(false)

  const settings: PrivacySetting[] = [
    {
      id: "mask-number",
      label: "Mask numbers (*) at startup",
      icon: "eye-off",
      value: maskNumberAtStartup,
      onValueChange: setMaskNumberAtStartup,
    },
    {
      id: "lock-app",
      label: "Lock app",
      icon: "lock-open",
      value: lockApp,
      onValueChange: setLockApp,
    },
    {
      id: "lock-after-closing",
      label: "Lock after closing",
      icon: "lock",
      value: lockAfterClosing,
      onValueChange: setLockAfterClosing,
    },
  ]

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.content}
    >
      <View style={styles.container}>
        {settings.map((setting) => (
          <Pressable
            key={setting.id}
            style={styles.settingRow}
            onPress={() => setting.onValueChange(!setting.value)}
          >
            <View style={styles.iconContainer}>
              <IconSymbol name={setting.icon} size={24} />
            </View>
            <View style={styles.labelContainer}>
              <Text variant="p" style={styles.settingLabel}>
                {setting.label}
              </Text>
            </View>
            <Switch
              value={setting.value}
              onValueChange={setting.onValueChange}
            />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create((theme) => ({
  scrollContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    paddingBottom: 40,
  },
  container: {
    marginBlock: 10,
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
}))
