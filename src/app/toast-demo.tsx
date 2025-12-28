import { useState } from "react"
import { Pressable, ScrollView, Switch } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { logger } from "~/utils/logger"
import { Toast } from "~/utils/toast"

export default function ToastDemoScreen() {
  const { theme } = useUnistyles()
  const [showProgressBar, setShowProgressBar] = useState(true)
  const [showCloseIcon, setShowCloseIcon] = useState(true)
  const [position, setPosition] = useState<"top" | "bottom">("top")

  const togglePosition = () => {
    setPosition((prev) => (prev === "top" ? "bottom" : "top"))
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="lead" style={styles.version}>
            Version 1.0.0
          </Text>
        </View>

        {/* Settings Card */}
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show Progress Bar</Text>
            <Switch
              value={showProgressBar}
              onValueChange={setShowProgressBar}
              trackColor={{
                false: theme.colors.secondary,
                true: theme.customColors.info,
              }}
              thumbColor={
                showProgressBar
                  ? theme.colors.onPrimary
                  : theme.colors.onSecondary
              }
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show Close Icon</Text>
            <Switch
              value={showCloseIcon}
              onValueChange={setShowCloseIcon}
              trackColor={{
                false: theme.colors.secondary,
                true: theme.customColors.info,
              }}
              thumbColor={
                showCloseIcon
                  ? theme.colors.onPrimary
                  : theme.colors.onSecondary
              }
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Position: {position}</Text>
            <Pressable
              style={[
                styles.toggleButton,
                { backgroundColor: theme.customColors.info },
              ]}
              onPress={togglePosition}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  { color: theme.colors.onPrimary },
                ]}
              >
                TOGGLE
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Basic Toasts */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            Basic Toasts
          </Text>
          <View style={styles.buttonGrid}>
            <Button
              variant="default"
              style={[
                styles.gridButton,
                { backgroundColor: theme.customColors.success },
              ]}
              onPress={() =>
                Toast.success({
                  title: "Success message!",
                  position,
                  showProgressBar,
                  showCloseIcon,
                })
              }
            >
              <Text style={{ color: theme.colors.onPrimary }}>SUCCESS</Text>
            </Button>

            <Button
              variant="destructive"
              style={styles.gridButton}
              onPress={() =>
                Toast.error({
                  title: "Error message!",
                  position,
                  showProgressBar,
                  showCloseIcon,
                })
              }
            >
              <Text style={{ color: theme.colors.onPrimary }}>ERROR</Text>
            </Button>

            <Button
              variant="secondary"
              style={[
                styles.gridButton,
                { backgroundColor: theme.customColors.info },
              ]}
              onPress={() =>
                Toast.info({
                  title: "Info message!",
                  position,
                  showProgressBar,
                  showCloseIcon,
                })
              }
            >
              <Text style={{ color: theme.colors.onPrimary }}>INFO</Text>
            </Button>

            <Button
              variant="outline"
              style={[
                styles.gridButton,
                { backgroundColor: theme.customColors.warning },
              ]}
              onPress={() =>
                Toast.warn({
                  title: "Warning message!",
                  position,
                  showProgressBar,
                  showCloseIcon,
                })
              }
            >
              <Text style={{ color: theme.colors.onSurface }}>WARNING</Text>
            </Button>
          </View>
        </View>

        {/* Advanced Features */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            Advanced Features
          </Text>
          <View style={styles.buttonColumn}>
            <Button
              variant="default"
              style={[
                styles.fullButton,
                { backgroundColor: theme.customColors.info },
              ]}
              onPress={() =>
                Toast.show({
                  type: "success",
                  title: "Payment Successful",
                  description: "Your transaction has been processed",
                  position,
                  showProgressBar,
                  showCloseIcon,
                })
              }
            >
              <Text style={{ color: theme.colors.onPrimary }}>
                WITH SECONDARY TEXT
              </Text>
            </Button>

            <Button
              variant="default"
              style={[
                styles.fullButton,
                { backgroundColor: theme.customColors.success },
              ]}
              onPress={() =>
                Toast.show({
                  type: "info",
                  title: "Custom Colors",
                  description: "Using theme colors for consistency",
                  position,
                  showProgressBar,
                  showCloseIcon,
                })
              }
            >
              <Text style={{ color: theme.colors.onPrimary }}>
                CUSTOM COLORS
              </Text>
            </Button>

            <Button
              variant="default"
              style={[
                styles.fullButton,
                { backgroundColor: theme.customColors.warning },
              ]}
              onPress={() =>
                Toast.show({
                  type: "warn",
                  title: "Long Duration Toast",
                  description: "This toast will stay for 8 seconds",
                  position,
                  showProgressBar,
                  showCloseIcon,
                  visibilityTime: 8000,
                })
              }
            >
              <Text style={{ color: theme.colors.onSurface }}>
                LONG DURATION (8S)
              </Text>
            </Button>

            <Button
              variant="outline"
              style={styles.fullButton}
              onPress={() => {
                const id = Toast.show({
                  type: "info",
                  title: "No Auto Hide",
                  description: "This toast won't auto-hide",
                  position,
                  showProgressBar: false,
                  showCloseIcon: true,
                  autoHide: false,
                })
                logger.info("Toast ID:", { id })
              }}
            >
              <Text>NO AUTO HIDE</Text>
            </Button>

            <Button
              variant="default"
              style={[
                styles.fullButton,
                { backgroundColor: theme.colors.error },
              ]}
              onPress={() =>
                Toast.show({
                  type: "success",
                  title: "With Callbacks",
                  description: "Check console for logs",
                  position,
                  showProgressBar,
                  showCloseIcon,
                  onShow: () => logger.info("Toast shown!"),
                  onHide: () => logger.info("Toast hidden!"),
                  onPress: () => logger.info("Toast pressed!"),
                })
              }
            >
              <Text style={{ color: theme.colors.onPrimary }}>
                WITH CALLBACKS
              </Text>
            </Button>
          </View>
        </View>

        {/* Additional Options */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            More Options
          </Text>
          <View style={styles.buttonColumn}>
            <Button
              variant="default"
              style={[
                styles.fullButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => {
                Toast.show({
                  type: "success",
                  title: "First toast",
                  position,
                  showProgressBar,
                  showCloseIcon,
                })
                setTimeout(() => {
                  Toast.show({
                    type: "info",
                    title: "Second toast",
                    position,
                    showProgressBar,
                    showCloseIcon,
                  })
                }, 500)
                setTimeout(() => {
                  Toast.show({
                    type: "warn",
                    title: "Third toast",
                    position,
                    showProgressBar,
                    showCloseIcon,
                  })
                }, 1000)
              }}
            >
              <Text style={{ color: theme.colors.onPrimary }}>
                MULTIPLE TOASTS
              </Text>
            </Button>

            <Button
              variant="destructive"
              onPress={() => Toast.hideAll()}
              style={styles.fullButton}
            >
              <Text style={{ color: theme.colors.onPrimary }}>
                HIDE ALL TOASTS
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  version: {
    color: theme.colors.onSecondary,
  },
  settingsCard: {
    marginBottom: 24,
    gap: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  toggleButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: theme.radius,
  },
  toggleButtonText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 22,
    fontWeight: "bold",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridButton: {
    flex: 1,
    minWidth: "45%",
  },
  buttonColumn: {
    gap: 12,
  },
  fullButton: {
    width: "100%",
  },
}))
