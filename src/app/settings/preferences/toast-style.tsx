import { useState } from "react"
import { useTranslation } from "react-i18next"
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

export default function ToastStyleScreen() {
  const { t } = useTranslation()
  const { theme } = useUnistyles()
  const positionOptions: Array<{
    value: ToastPosition
    label: string
    description: string
  }> = [
    {
      value: "top",
      label: t("preferences.appearance.toast.options.positionTop"),
      description: t(
        "preferences.appearance.toast.options.positionTopDescription",
      ),
    },
    {
      value: "bottom",
      label: t("preferences.appearance.toast.options.positionBottom"),
      description: t(
        "preferences.appearance.toast.options.positionBottomDescription",
      ),
    },
  ]
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
      title: t("preferences.appearance.toast.demo.successTitle"),
      description: t("preferences.appearance.toast.demo.successDescription"),
    })
    setTimeout(
      () =>
        Toast.error({
          title: t("preferences.appearance.toast.demo.errorTitle"),
          description: t("preferences.appearance.toast.demo.errorDescription"),
        }),
      500,
    )
    setTimeout(
      () =>
        Toast.info({
          title: t("preferences.appearance.toast.demo.infoTitle"),
          description: t("preferences.appearance.toast.demo.infoDescription"),
        }),
      1000,
    )
    setTimeout(
      () =>
        Toast.warn({
          title: t("preferences.appearance.toast.demo.warningTitle"),
          description: t(
            "preferences.appearance.toast.demo.warningDescription",
          ),
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
        title={t("preferences.appearance.toast.resetModal.title")}
        description={t("preferences.appearance.toast.resetModal.description")}
        confirmLabel={t("preferences.appearance.toast.resetModal.confirmLabel")}
        cancelLabel={t("preferences.appearance.toast.resetModal.cancelLabel")}
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
            {t("preferences.appearance.toast.options.position")}
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
            {t("preferences.appearance.toast.optionsLabel")}
          </Text>
        </View>
        <View native style={styles.toggleCard}>
          <Pressable
            style={styles.toggleRow}
            onPress={() => setShowProgressBar(!showProgressBar)}
          >
            <View native style={styles.toggleRowContent}>
              <Text style={styles.toggleLabel}>
                {t("preferences.appearance.toast.options.progressBar")}
              </Text>
              <Text variant="small" style={styles.toggleDescription}>
                {t(
                  "preferences.appearance.toast.options.progressBarDescription",
                )}
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
              <Text style={styles.toggleLabel}>
                {t("preferences.appearance.toast.options.closeIcon")}
              </Text>
              <Text variant="small" style={styles.toggleDescription}>
                {t("preferences.appearance.toast.options.closeIconDescription")}
              </Text>
            </View>
            <Switch value={showCloseIcon} onValueChange={setShowCloseIcon} />
          </Pressable>
        </View>

        {/* Preview */}
        <View native style={styles.sectionLabel}>
          <Text variant="small" style={styles.sectionLabelText}>
            {t("preferences.appearance.toast.preview.label")}
          </Text>
          <Text variant="small" style={styles.previewDescription}>
            {t("preferences.appearance.toast.preview.description")}
          </Text>
        </View>

        <View native style={styles.previewButtons}>
          <Button
            variant="default"
            style={styles.previewBtnPrimary}
            onPress={handleShowDemoToasts}
          >
            <Text style={styles.previewBtnPrimaryText}>
              {t("preferences.appearance.toast.preview.showDemo")}
            </Text>
          </Button>
          <Button
            variant="outline"
            style={styles.previewBtnOutline}
            onPress={() => Toast.hideAll()}
          >
            <Text style={styles.previewBtnOutlineText}>
              {t("preferences.appearance.toast.preview.hideAll")}
            </Text>
          </Button>
        </View>

        {/* Reset */}
        <View native style={styles.resetSection}>
          <Button
            variant="destructive"
            style={styles.resetButton}
            onPress={handleResetToDefaults}
          >
            <Text style={styles.resetButtonText}>
              {t("preferences.appearance.toast.resetButton")}
            </Text>
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
