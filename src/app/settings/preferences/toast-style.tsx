import { useState } from "react"
import { ScrollView } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { ConfirmModal } from "~/components/confirm-modal"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { ToastPosition } from "~/stores/toast.store"
import { useToastStyleStore } from "~/stores/toast-style.store"
import { Toast } from "~/utils/toast"

const positionOptions: Array<{
  value: ToastPosition
  label: string
  description: string
}> = [
  { value: "top", label: "Top", description: "Appears below the status bar" },
  {
    value: "bottom",
    label: "Bottom",
    description: "Appears above the home indicator",
  },
]

export default function ToastStyleScreen() {
  const { theme } = useUnistyles()
  const [resetModalVisible, setResetModalVisible] = useState(false)
  const {
    position,
    showProgressBar,
    showCloseIcon,
    setPosition,
    setShowProgressBar,
    setShowCloseIcon,
    resetToDefaults,
  } = useToastStyleStore()

  const handleShowDemoToasts = () => {
    Toast.success({
      title: "Success",
      description: "This is a success message",
    })
    setTimeout(
      () =>
        Toast.error({
          title: "Error",
          description: "This is an error message",
        }),
      500,
    )
    setTimeout(
      () =>
        Toast.info({ title: "Info", description: "This is an info message" }),
      1000,
    )
    setTimeout(
      () =>
        Toast.warn({
          title: "Warning",
          description: "This is a warning message",
        }),
      1500,
    )
  }

  const handleResetToDefaults = () => setResetModalVisible(true)
  const handleConfirmReset = () => resetToDefaults()

  return (
    <>
      <ConfirmModal
        visible={resetModalVisible}
        onRequestClose={() => setResetModalVisible(false)}
        onConfirm={handleConfirmReset}
        title="Reset to Defaults"
        description="Are you sure you want to reset all toast style settings to their default values?"
        confirmLabel="Reset"
        cancelLabel="Cancel"
        variant="destructive"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Position */}
        <View native style={[styles.sectionLabel, styles.sectionLabelFirst]}>
          <Text variant="small" style={styles.sectionLabelText}>
            Position
          </Text>
        </View>
        <View native style={styles.card}>
          {positionOptions.map((option, index) => {
            const isSelected = position === option.value
            const isLast = index === positionOptions.length - 1
            return (
              <View key={option.value} native>
                <Pressable
                  style={styles.row}
                  onPress={() => setPosition(option.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                >
                  <View native style={styles.rowContent}>
                    <Text style={styles.rowLabel}>{option.label}</Text>
                    <Text variant="small" style={styles.rowDescription}>
                      {option.description}
                    </Text>
                  </View>
                  {isSelected ? (
                    <IconSymbol
                      name="check"
                      size={20}
                      color={theme.colors.primary}
                    />
                  ) : null}
                </Pressable>
                {!isLast ? <View native style={styles.divider} /> : null}
              </View>
            )
          })}
        </View>

        {/* Options */}
        <View native style={styles.sectionLabel}>
          <Text variant="small" style={styles.sectionLabelText}>
            Options
          </Text>
        </View>
        <View native style={styles.toggleCard}>
          <Pressable
            style={styles.toggleRow}
            onPress={() => setShowProgressBar(!showProgressBar)}
          >
            <View native style={styles.toggleRowContent}>
              <Text style={styles.toggleLabel}>Progress bar</Text>
              <Text variant="small" style={styles.toggleDescription}>
                Visual countdown indicator
              </Text>
            </View>
            <Switch
              value={showProgressBar}
              onValueChange={setShowProgressBar}
            />
          </Pressable>
          <View native style={styles.divider} />
          <Pressable
            style={styles.toggleRow}
            onPress={() => setShowCloseIcon(!showCloseIcon)}
          >
            <View native style={styles.toggleRowContent}>
              <Text style={styles.toggleLabel}>Close icon</Text>
              <Text variant="small" style={styles.toggleDescription}>
                Manual dismiss button
              </Text>
            </View>
            <Switch value={showCloseIcon} onValueChange={setShowCloseIcon} />
          </Pressable>
        </View>

        {/* Preview */}
        <View native style={styles.sectionLabel}>
          <Text variant="small" style={styles.sectionLabelText}>
            Preview
          </Text>
          <Text variant="small" style={styles.previewDescription}>
            Test your current settings with live notifications
          </Text>
        </View>

        <View native style={styles.previewButtons}>
          <Button
            variant="default"
            style={styles.previewBtnPrimary}
            onPress={handleShowDemoToasts}
          >
            <Text style={styles.previewBtnPrimaryText}>Show demo</Text>
          </Button>
          <Button
            variant="outline"
            style={styles.previewBtnOutline}
            onPress={() => Toast.hideAll()}
          >
            <Text style={styles.previewBtnOutlineText}>Hide all</Text>
          </Button>
        </View>

        {/* Reset */}
        <View native style={styles.resetSection}>
          <Button
            variant="destructive"
            style={styles.resetButton}
            onPress={handleResetToDefaults}
          >
            <Text style={styles.resetButtonText}>Reset to defaults</Text>
          </Button>
        </View>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 48,
  },

  sectionLabel: {
    paddingHorizontal: 4,
    marginBottom: 8,
    marginTop: 24,
  },
  sectionLabelFirst: {
    marginTop: 8,
  },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    color: theme.colors.customColors?.semi,
  },

  card: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSecondary,
  },
  rowDescription: {
    fontSize: 13,
    color: theme.colors.onSecondary,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.customColors?.semi,
  },

  toggleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.colors.radius,
    borderWidth: 1,
    borderColor: theme.colors.customColors?.semi,
    overflow: "hidden",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  toggleRowContent: {
    flex: 1,
    gap: 2,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  toggleDescription: {
    fontSize: 13,
    color: theme.colors.customColors.semi,
  },

  previewDescription: {
    fontSize: 13,
    color: theme.colors.onSecondary,
    opacity: 0.7,
  },
  previewButtons: {
    flexDirection: "row",
    gap: 10,
  },
  previewBtnPrimary: {
    flex: 1,
  },
  previewBtnPrimaryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  previewBtnOutline: {
    flex: 1,
  },
  previewBtnOutlineText: {
    fontSize: 14,
    fontWeight: "600",
  },

  resetSection: {
    marginTop: 32,
  },
  resetButton: {
    borderRadius: theme.colors.radius,
    paddingVertical: 2,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
}))
