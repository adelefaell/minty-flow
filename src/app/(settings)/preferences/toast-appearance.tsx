import { Alert, ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { Pressable } from "~/components/ui/pressable"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { ToastPosition } from "~/stores/toast.store"
import { useToastAppearanceStore } from "~/stores/toast-appearance.store"
import { Toast } from "~/utils/toast"

export default function ToastAppearanceScreen() {
  const {
    position,
    showProgressBar,
    showCloseIcon,
    setPosition,
    setShowProgressBar,
    setShowCloseIcon,
    resetToDefaults,
  } = useToastAppearanceStore()

  const handlePositionChange = (newPosition: ToastPosition) => {
    setPosition(newPosition)
  }

  const handleShowDemoToasts = () => {
    // Show all 4 toast types with current settings
    Toast.success({
      title: "Success",
      description: "This is a success message",
    })

    setTimeout(() => {
      Toast.error({
        title: "Error",
        description: "This is an error message",
      })
    }, 500)

    setTimeout(() => {
      Toast.info({
        title: "Info",
        description: "This is an info message",
      })
    }, 1000)

    setTimeout(() => {
      Toast.warn({
        title: "Warning",
        description: "This is a warning message",
      })
    }, 1500)
  }

  const handleResetToDefaults = () => {
    Alert.alert(
      "Reset to Defaults",
      "Are you sure you want to reset all toast appearance settings to their default values?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: resetToDefaults,
        },
      ],
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View native style={styles.section}>
        {/* Position */}
        <View native style={styles.settingRow}>
          <View native style={styles.settingInfo}>
            <Text variant="p" style={styles.settingLabel}>
              Position
            </Text>
            <Text variant="small" style={styles.settingDescription}>
              Where toasts appear on screen
            </Text>
            <View native style={styles.radioGroup}>
              <Pressable
                style={styles.radioOption}
                onPress={() => handlePositionChange("top")}
              >
                <View
                  native
                  style={[
                    styles.radioButton,
                    position === "top" && styles.radioButtonSelected,
                  ]}
                >
                  {position === "top" && (
                    <View native style={styles.radioButtonInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    position === "top" && styles.radioLabelSelected,
                  ]}
                >
                  Top
                </Text>
              </Pressable>
              <Pressable
                style={styles.radioOption}
                onPress={() => handlePositionChange("bottom")}
              >
                <View
                  native
                  style={[
                    styles.radioButton,
                    position === "bottom" && styles.radioButtonSelected,
                  ]}
                >
                  {position === "bottom" && (
                    <View native style={styles.radioButtonInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    position === "bottom" && styles.radioLabelSelected,
                  ]}
                >
                  Bottom
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <Pressable
          style={styles.settingRow}
          onPress={() => setShowProgressBar(!showProgressBar)}
        >
          <View native style={styles.settingInfo}>
            <Text variant="p" style={styles.settingLabel}>
              Progress Bar
            </Text>
            <Text variant="small" style={styles.settingDescription}>
              Visual countdown indicator
            </Text>
          </View>
          <Switch value={showProgressBar} onValueChange={setShowProgressBar} />
        </Pressable>

        {/* Close Icon */}
        <Pressable
          style={styles.settingRow}
          onPress={() => setShowCloseIcon(!showCloseIcon)}
        >
          <View native style={styles.settingInfo}>
            <Text variant="p" style={styles.settingLabel}>
              Close Icon
            </Text>
            <Text variant="small" style={styles.settingDescription}>
              Manual dismiss button
            </Text>
          </View>
          <Switch value={showCloseIcon} onValueChange={setShowCloseIcon} />
        </Pressable>
      </View>

      {/* Demo Section */}
      <View native style={styles.demoSection}>
        <Text variant="h3" style={styles.sectionTitle}>
          Preview
        </Text>
        <Text variant="small" style={styles.demoDescription}>
          Test your toast settings with demo notifications
        </Text>
        <View native style={styles.demoButtons}>
          <Button
            variant="default"
            style={styles.demoButton}
            onPress={handleShowDemoToasts}
          >
            <Text style={styles.demoButtonText}>Show Demo Toasts</Text>
          </Button>
          <Button
            variant="outline"
            style={styles.demoButton}
            onPress={() => Toast.hideAll()}
          >
            <Text style={styles.hideAllButtonText}>Hide All</Text>
          </Button>
        </View>
      </View>

      {/* Reset Section */}
      <View native style={styles.resetSection}>
        <Button
          variant="destructive"
          style={styles.resetButton}
          onPress={handleResetToDefaults}
        >
          <Text>Reset to Defaults</Text>
        </Button>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBlock: 16,
    paddingRight: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.onSurface,
    gap: 16,
  },
  settingInfo: {
    flex: 1,
    gap: 4,
    paddingInline: 20,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "bold",
  },
  settingDescription: {
    fontSize: 13,
  },
  radioGroup: {
    marginTop: 16,
    gap: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.onSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  radioLabelSelected: {
    color: theme.colors.onSurface,
  },
  demoSection: {
    marginBottom: 24,
    paddingInline: 20,
  },
  demoDescription: {
    fontSize: 13,
    marginBottom: 16,
  },
  demoButtons: {
    gap: 12,
  },
  demoButton: {
    flex: 1,
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  hideAllButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  resetSection: {
    paddingInline: 20,
    marginTop: 8,
  },
  resetButton: {
    width: "100%",
  },
}))
