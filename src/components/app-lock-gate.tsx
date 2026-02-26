import { BlurView } from "expo-blur"
import { useEffect, useState } from "react"
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { StyleSheet } from "react-native-unistyles"

import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { useAppLockStore } from "~/stores/app-lock.store"

export function AppLockGate() {
  const lockAppEnabled = useAppLockStore((s) => s.lockAppEnabled)
  const isLocked = useAppLockStore((s) => s.isLocked)
  const isAuthenticating = useAppLockStore((s) => s.isAuthenticating)
  const attemptUnlock = useAppLockStore((s) => s.attemptUnlock)

  const opacity = useSharedValue(0)
  const [visible, setVisible] = useState(isLocked)

  useEffect(() => {
    if (isLocked) {
      setVisible(true)
      opacity.value = withTiming(1, { duration: 300 })
    } else {
      opacity.value = withTiming(0, { duration: 400 }, (finished) => {
        if (finished) runOnJS(setVisible)(false)
      })
    }
  }, [isLocked, opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  if (!lockAppEnabled || !visible) return null

  return (
    <Animated.View style={[styles.overlay, animatedStyle]}>
      <BlurView intensity={80} tint="regular" style={styles.fill}>
        <Pressable
          onPress={attemptUnlock}
          disabled={isAuthenticating}
          style={styles.lockButton}
        >
          <IconSymbol
            name={isAuthenticating ? "lock" : "lock-open"}
            size={40}
          />
        </Pressable>
      </BlurView>
    </Animated.View>
  )
}

const styles = StyleSheet.create((theme) => ({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  fill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lockButton: {
    padding: 24,
    borderRadius: 999,
    backgroundColor: `${theme.colors.surface}55`,
  },
}))
