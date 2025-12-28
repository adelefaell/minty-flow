import { useCallback, useEffect } from "react"
import { Platform, Pressable, TouchableOpacity } from "react-native"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { type Toast, useToastStore } from "~/stores/toast.store"

import { IconSymbol, type IconSymbolName } from "./ui/icon-symbol"
import { Text } from "./ui/text"
import { View } from "./ui/view"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface ToastItemProps {
  toast: Toast
  onHide: (id: string) => void
}

function ToastItem({ toast, onHide }: ToastItemProps) {
  const { theme } = useUnistyles()

  // Animated values for custom animations with withSequence
  const translateY = useSharedValue(toast.position === "top" ? -100 : 100)
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.8)
  const progressWidth = useSharedValue(100)

  const handleHide = useCallback(() => {
    // Exit animation sequence: scale down slightly → fade and slide out
    scale.value = withTiming(0.95, { duration: 100 })
    opacity.value = withDelay(
      50,
      withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) }),
    )
    translateY.value = withDelay(
      50,
      withTiming(toast.position === "top" ? -100 : 100, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      }),
    )

    // Wait for animation to complete before hiding
    setTimeout(() => {
      onHide(toast.id)
    }, 300)
  }, [onHide, toast.id, toast.position, opacity, scale, translateY])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }))

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }))

  const handlePress = () => {
    if (toast.onPress) {
      toast.onPress()
    } else {
      handleHide()
    }
  }

  const getToastStyles = () => {
    const baseStyle = toastStyles.container
    switch (toast.type) {
      case "success":
        return [baseStyle, toastStyles.success]
      case "error":
        return [baseStyle, toastStyles.error]
      case "warn":
        return [baseStyle, toastStyles.warn]
      case "info":
        return [baseStyle, toastStyles.info]
      default:
        return [baseStyle, toastStyles.default]
    }
  }

  const getIconName = (): IconSymbolName => {
    switch (toast.type) {
      case "success":
        return "checkmark.circle"
      case "error":
        return "exclamationmark.triangle"
      case "warn":
        return "exclamationmark.triangle"
      case "info":
        return "info.circle"
      default:
        return "bell.fill"
    }
  }

  const getIconColor = () => {
    switch (toast.type) {
      case "success":
        return theme.customColors.success
      case "error":
        return theme.colors.error
      case "warn":
        return theme.customColors.warning
      case "info":
        return theme.customColors.info
      default:
        return theme.colors.onSurface
    }
  }

  const getProgressBarColor = () => {
    switch (toast.type) {
      case "success":
        return theme.customColors.success
      case "error":
        return theme.colors.error
      case "warn":
        return theme.customColors.warning
      case "info":
        return theme.customColors.info
      default:
        return theme.colors.primary
    }
  }

  useEffect(() => {
    // Enter animation sequence: slide in → small bounce → settle
    translateY.value = withSequence(
      withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }),
      // withSpring(toast.position === "top" ? -5 : 5, {
      //   damping: 8,
      //   stiffness: 100,
      // }),
      // withSpring(0, { damping: 10, stiffness: 100 }),
    )

    // Fade and scale in sequence
    opacity.value = withTiming(1, { duration: 300 })
    scale.value = withSequence(
      withTiming(1.05, { duration: 200, easing: Easing.out(Easing.ease) }),
      // withSpring(1, { damping: 8, stiffness: 100 }),
    )

    // Progress bar animation
    if (toast.showProgressBar && toast.autoHide) {
      progressWidth.value = withTiming(0, {
        duration: toast.visibilityTime,
        easing: Easing.linear,
      })
    }

    // Auto-hide with exit animation
    if (toast.autoHide) {
      const timer = setTimeout(() => {
        handleHide()
      }, toast.visibilityTime)

      return () => clearTimeout(timer)
    }
  }, [
    opacity,
    progressWidth,
    scale,
    toast.autoHide,
    toast.showProgressBar,
    toast.visibilityTime,
    translateY,
    handleHide,
  ])

  return (
    <AnimatedPressable
      style={[getToastStyles(), animatedStyle]}
      onPress={handlePress}
    >
      <View native style={toastStyles.content}>
        <IconSymbol name={getIconName()} size={24} color={getIconColor()} />
        <View native style={toastStyles.textContainer}>
          {toast.title && <Text style={toastStyles.text1}>{toast.title}</Text>}
          {toast.description && (
            <Text style={toastStyles.text2}>{toast.description}</Text>
          )}
        </View>
        {toast.showCloseIcon && (
          <TouchableOpacity
            onPress={handleHide}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={toastStyles.closeButton}
          >
            <IconSymbol name="xmark" size={20} color={theme.colors.onSurface} />
          </TouchableOpacity>
        )}
      </View>
      {toast.showProgressBar && (
        <View native style={toastStyles.progressBarContainer}>
          <Animated.View
            style={[
              toastStyles.progressBar,
              progressStyle,
              { backgroundColor: getProgressBarColor() },
            ]}
          />
        </View>
      )}
    </AnimatedPressable>
  )
}

export function ToastManager() {
  const { toasts, hide } = useToastStore()

  if (toasts.length === 0) {
    return null
  }

  const topToasts = toasts.filter((t) => t.position === "top")
  const bottomToasts = toasts.filter((t) => t.position === "bottom")

  return (
    <View native style={toastStyles.overlay} pointerEvents="box-none">
      {topToasts.length > 0 && (
        <View native style={toastStyles.topContainer} pointerEvents="box-none">
          {topToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onHide={hide} />
          ))}
        </View>
      )}
      {bottomToasts.length > 0 && (
        <View
          native
          style={toastStyles.bottomContainer}
          pointerEvents="box-none"
        >
          {bottomToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onHide={hide} />
          ))}
        </View>
      )}
    </View>
  )
}

const toastStyles = StyleSheet.create((theme) => ({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: "transparent",
  },
  topContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.select({ ios: 60, android: 50, web: 20, default: 50 }),
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
    zIndex: 9999,
    pointerEvents: "box-none",
    _android: {
      elevation: 9999,
    },
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.select({
      ios: 40,
      android: 50,
      web: 20,
      default: 50,
    }),
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
    zIndex: 9999,
    pointerEvents: "box-none",
    _android: {
      elevation: 9999,
    },
  },
  container: {
    width: "100%",
    maxWidth: 400,
    borderRadius: theme.radius,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 60,
    pointerEvents: "auto",
    _web: {
      boxShadow: theme.colors.boxShadow,
      cursor: "pointer",
    },
    _ios: {
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    _android: {
      elevation: 8,
    },
  },
  success: {
    backgroundColor: theme.colors.secondary,
    // borderLeftColor: theme.chart2,
    // borderLeftWidth: 4,
  },
  error: {
    backgroundColor: theme.colors.secondary,
    // borderLeftColor: theme.colors.error,
    // borderLeftWidth: 4,
  },
  warn: {
    backgroundColor: theme.colors.secondary,
    // borderLeftColor: theme.chart4,
    // borderLeftWidth: 4,
  },
  info: {
    backgroundColor: theme.colors.secondary,
    // borderLeftColor: theme.chart1,
    // borderLeftWidth: 4,
  },
  default: {
    backgroundColor: theme.colors.secondary,
    // borderLeftColor: theme.colors.primary,
    // borderLeftWidth: 4,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  text1: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  text2: {
    fontSize: 14,
    color: theme.colors.onSecondary,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderBottomLeftRadius: theme.radius,
    borderBottomRightRadius: theme.radius,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderBottomLeftRadius: theme.radius,
    borderBottomRightRadius: theme.radius,
  },
}))
