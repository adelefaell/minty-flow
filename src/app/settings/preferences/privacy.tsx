import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import type { IconSymbolName } from "~/components/ui/icon-symbol"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { useMoneyFormattingStore } from "~/stores/money-formatting.store"

interface PrivacySetting {
  id: string
  label: string
  icon: IconSymbolName
  value: boolean
  onValueChange: (value: boolean) => void
}

export default function PrivacyScreen() {
  const [lockApp, setLockApp] = useState(false)
  const [lockAfterClosing, setLockAfterClosing] = useState(false)

  const hideOnStartup = useMoneyFormattingStore((s) => s.hideOnStartup)
  const setHideOnStartup = useMoneyFormattingStore((s) => s.setHideOnStartup)

  const settings: PrivacySetting[] = [
    {
      id: "mask-number",
      label: "Mask money (⁕) at startup",
      icon: "asterisk",
      value: hideOnStartup,
      onValueChange: setHideOnStartup,
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

  const { t } = useTranslation()

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
                {t(`privacy_screen.settings_items.${setting.id}.label`)}
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
