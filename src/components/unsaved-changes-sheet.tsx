import { useCallback, useEffect, useState } from "react"
import { StyleSheet } from "react-native-unistyles"

import {
  BottomSheetModalComponent,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

type UnsavedChangesCallbacks = {
  onConfirm: () => void
  onCancel?: () => void
}

const UNSAVED_CHANGES_SHEET_ID = "unsaved-changes-warning"

// Global state to store callbacks
let globalCallbacks: UnsavedChangesCallbacks | null = null
const callbackUpdateListeners: Set<() => void> = new Set()

const notifyCallbacksUpdate = () => {
  for (const listener of callbackUpdateListeners) {
    listener()
  }
}

export const UnsavedChangesSheet = () => {
  const sheet = useBottomSheet(UNSAVED_CHANGES_SHEET_ID)
  const [callbacks, setCallbacks] = useState<UnsavedChangesCallbacks | null>(
    null,
  )

  // Listen for callback updates
  useEffect(() => {
    const updateCallbacks = () => {
      setCallbacks(globalCallbacks)
    }
    callbackUpdateListeners.add(updateCallbacks)
    return () => {
      callbackUpdateListeners.delete(updateCallbacks)
    }
  }, [])

  const handleConfirm = useCallback(() => {
    callbacks?.onConfirm()
    setCallbacks(null)
    globalCallbacks = null
    sheet.dismiss()
  }, [callbacks, sheet])

  const handleCancel = useCallback(() => {
    callbacks?.onCancel?.()
    setCallbacks(null)
    globalCallbacks = null
    sheet.dismiss()
  }, [callbacks, sheet])

  return (
    <BottomSheetModalComponent id={UNSAVED_CHANGES_SHEET_ID}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <IconSymbol name="alert" size={40} style={styles.icon} />
        </View>

        <Text variant="h3" style={styles.title}>
          Close without saving?
        </Text>

        <Text variant="p" style={styles.description}>
          All changes will be lost.
        </Text>

        <View style={styles.buttonContainer}>
          <Button variant="default" onPress={handleConfirm}>
            <Text variant="default">Confirm</Text>
          </Button>
          <Button variant="outline" onPress={handleCancel}>
            <Text variant="default">Cancel</Text>
          </Button>
        </View>
      </View>
    </BottomSheetModalComponent>
  )
}

/**
 * Hook to show unsaved changes warning
 */
export const useUnsavedChangesWarning = () => {
  const sheet = useBottomSheet(UNSAVED_CHANGES_SHEET_ID)

  return {
    show: (onConfirm: () => void, onCancel?: () => void) => {
      globalCallbacks = { onConfirm, onCancel }
      notifyCallbacksUpdate()
      sheet.present()
    },
    dismiss: () => {
      globalCallbacks = null
      notifyCallbacksUpdate()
      sheet.dismiss()
    },
  }
}

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: 20,
    gap: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    color: theme.colors.customColors?.warning || theme.colors.primary,
  },
  title: {
    textAlign: "center",
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  description: {
    textAlign: "center",
    color: theme.colors.onSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
    marginBlock: 8,
  },
}))
