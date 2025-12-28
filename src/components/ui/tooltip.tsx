import * as Haptics from "expo-haptics"
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  Dimensions,
  Platform,
  type PressableProps,
  View as RNView,
} from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { StyleSheet } from "react-native-unistyles"

import { logger } from "~/utils/logger"

import { Text } from "./text"

type TooltipData = {
  text: string
  x: number
  y: number
  width: number
  height: number
}

type TooltipContextType = {
  showTooltip: (data: TooltipData) => void
  hideTooltip: () => void
}

const TooltipContext = createContext<TooltipContextType | null>(null)

const TOOLTIP_SPACING = 10
const SCREEN_EDGE_PADDING = 12

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [tooltipWidth, setTooltipWidth] = useState(0)

  const opacity = useSharedValue(0)
  const translateY = useSharedValue(8) // Start from below
  const translateX = useSharedValue(0)

  // Memoize position calculation to avoid recalculating on every render
  const position = useMemo(() => {
    if (!tooltip || tooltipWidth === 0)
      return { top: 0, left: 0, translateX: 0 }

    const screenWidth = Dimensions.get("window").width
    const targetCenterX = tooltip.x + tooltip.width / 2

    // Calculate desired left position (centered on target)
    const left = targetCenterX

    // Calculate translateX to center the tooltip
    let tooltipTranslateX = -tooltipWidth / 2

    // Check if tooltip would go off the left edge
    if (left + tooltipTranslateX < SCREEN_EDGE_PADDING) {
      tooltipTranslateX = SCREEN_EDGE_PADDING - left
    }

    // Check if tooltip would go off the right edge
    if (
      left + tooltipTranslateX + tooltipWidth >
      screenWidth - SCREEN_EDGE_PADDING
    ) {
      tooltipTranslateX =
        screenWidth - SCREEN_EDGE_PADDING - tooltipWidth - left
    }

    return {
      top: tooltip.y - TOOLTIP_SPACING,
      left: left,
      translateX: tooltipTranslateX,
    }
  }, [tooltip, tooltipWidth])

  // Update translateX immediately when position changes (no animation)
  useEffect(() => {
    if (tooltip && tooltipWidth > 0) {
      translateX.value = position.translateX
    } else {
      translateX.value = 0
    }
  }, [tooltip, tooltipWidth, position.translateX, translateX])

  // Animate tooltip appearance/disappearance (from bottom to up)
  useEffect(() => {
    if (tooltip) {
      // Set initial position (below, invisible) then animate up
      translateY.value = 8
      opacity.value = 0
      // Animate to final position (up, visible)
      translateY.value = withTiming(0, { duration: 150 })
      opacity.value = withTiming(1, { duration: 150 })
    } else {
      // Animate down and fade out
      translateY.value = withTiming(8, { duration: 150 })
      opacity.value = withTiming(0, { duration: 150 })
      setTooltipWidth(0)
    }
  }, [tooltip, opacity, translateY])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setTooltip(null)
    }
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }))

  const showTooltip = useCallback((data: TooltipData) => {
    setTooltip(data)
  }, [])

  const hideTooltip = useCallback(() => {
    setTooltip(null)
  }, [])

  const styles = StyleSheet.create((t) => ({
    tooltip: {
      position: "absolute",
      backgroundColor: t.colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: t.radius,
      shadowColor: t.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      maxWidth: 200,
      zIndex: 10000,
    },
    tooltipText: {
      color: t.colors.onSurface,
      fontSize: 12,
      textAlign: "center",
    },
  }))

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
      {tooltip && (
        <RNView
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 9999,
          }}
          collapsable={false}
          accessible={false}
        >
          <Animated.View
            onLayout={(e) => {
              const { width } = e.nativeEvent.layout
              if (width > 0 && width !== tooltipWidth) {
                setTooltipWidth(width)
              }
            }}
            style={[
              styles.tooltip,
              {
                top: position.top,
                left: position.left,
              },
              animatedStyle,
            ]}
            pointerEvents="none"
          >
            <Text style={styles.tooltipText}>{tooltip.text}</Text>
          </Animated.View>
        </RNView>
      )}
    </TooltipContext.Provider>
  )
}

export interface TooltipProps {
  text: string
  children: React.ReactElement<PressableProps>
  delayLongPress?: number
  hapticFeedback?: boolean
}

type PressEvent = Parameters<NonNullable<PressableProps["onLongPress"]>>[0]

export function Tooltip({
  text,
  children,
  delayLongPress = 350,
  hapticFeedback = true,
}: TooltipProps) {
  const context = useContext(TooltipContext)
  const pressableRef = useRef<RNView>(null)

  // All hooks must be called before any early returns
  const handleLongPress = useCallback(() => {
    if (!pressableRef.current || !context) return

    pressableRef.current.measureInWindow((x, y, width, height) => {
      context.showTooltip({ text, x, y, width, height })

      if (hapticFeedback && Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
    })
  }, [text, context, hapticFeedback])

  const handlePressOut = useCallback(() => {
    if (!context) return
    context.hideTooltip()
  }, [context])

  if (!context) {
    logger.warn("Tooltip must be used within TooltipProvider")
    return children
  }

  // Get the child's ref if it exists
  const childRef = (children as { ref?: React.Ref<RNView> })?.ref

  const childWithHandlers = React.cloneElement(children, {
    ...children.props,
    onLongPress: (e: PressEvent) => {
      handleLongPress()
      children.props.onLongPress?.(e)
    },
    onPressOut: (e: PressEvent) => {
      handlePressOut()
      children.props.onPressOut?.(e)
    },
    delayLongPress,
    // Handle ref using a callback ref pattern
    ref: (node: RNView | null) => {
      pressableRef.current = node
      if (childRef) {
        if (typeof childRef === "function") {
          childRef(node)
        } else if (
          childRef &&
          typeof childRef === "object" &&
          "current" in childRef
        ) {
          ;(childRef as { current: RNView | null }).current = node
        }
      }
    },
  } as Partial<PressableProps>)

  return childWithHandlers
}
