/**
 * Reusable confirm modal centered on the screen.
 * Use for delete confirmations or other destructive/important actions.
 */

import { useCallback } from "react"
import { Modal, Pressable, useWindowDimensions, View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { IconSymbol, type IconSymbolName } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"

export interface ConfirmModalProps {
  /** Whether the modal is visible. */
  visible: boolean
  /** Called when the user requests close (backdrop tap or cancel). */
  onRequestClose: () => void
  /** Called when the user confirms the action. */
  onConfirm: () => void
  /** Title shown in the modal (e.g. "Delete category?"). */
  title: string
  /** Description or warning message. */
  description: string
  /** Label for the confirm button (e.g. "Delete"). */
  confirmLabel?: string
  /** Label for the cancel button. Default "Cancel". */
  cancelLabel?: string
  /** "destructive" uses red/danger styling for the confirm button. */
  variant?: "destructive" | "default"
  /** Optional icon name shown above the title (e.g. "trash-can"). */
  icon?: IconSymbolName
}

export function ConfirmModal({
  visible,
  onRequestClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  icon,
}: ConfirmModalProps) {
  const { width } = useWindowDimensions()
  const maxCardWidth = Math.min(width - 48, 400)

  const handleConfirm = useCallback(() => {
    onRequestClose()
    onConfirm()
  }, [onRequestClose, onConfirm])

  // const iconColor = variant === "destructive" ? theme.colors.error : undefined

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <Pressable
        style={[styles.backdrop, { width }]}
        onPress={onRequestClose}
        accessibilityLabel="Close"
        accessibilityRole="button"
      >
        <Pressable
          style={[styles.card, { maxWidth: maxCardWidth }]}
          onPress={(e) => e.stopPropagation()}
        >
          {icon ? (
            <View style={styles.iconRow}>
              <IconSymbol
                name={icon}
                size={40}
                color={styles.iconColor(variant).color}
              />
            </View>
          ) : null}

          <Text variant="h3" style={styles.title}>
            {title}
          </Text>

          <Text variant="p" style={styles.description}>
            {description}
          </Text>

          <View style={styles.actions}>
            <Button
              variant="outline"
              onPress={onRequestClose}
              style={styles.actionButton}
            >
              <Text variant="default">{cancelLabel}</Text>
            </Button>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              onPress={handleConfirm}
              style={styles.actionButton}
            >
              <Text variant="default">{confirmLabel}</Text>
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.colors.radius ?? 16,
  },
  iconRow: {
    alignItems: "center",
    marginBottom: 4,
  },
  iconColor: (variant: "destructive" | "default") => ({
    color:
      variant === "destructive" ? theme.colors.error : theme.colors.onSurface,
  }),
  title: {
    textAlign: "center",
    fontWeight: "600",
  },
  description: {
    textAlign: "center",
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 10,
  },
  actionButton: {
    flex: 1,
  },
}))
