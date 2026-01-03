import * as Haptics from "expo-haptics"
import React, {
  createContext,
  useCallback,
  useContext,
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
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { StyleSheet } from "react-native-unistyles"
import { scheduleOnUI } from "react-native-worklets"

import { logger } from "~/utils/logger"

import { Text } from "./text"

type ExitPositionType = "top" | "bottom"

type TooltipData = {
  text: string
  x: number
  y: number
  width: number
  height: number
  position?: ExitPositionType
}

type TooltipContextType = {
  showTooltip: (data: TooltipData) => void
  hideTooltip: () => void
}

const TooltipContext = createContext<TooltipContextType | null>(null)

const TOOLTIP_BOTTOM_SPACING = 30
const TOOLTIP_TOP_SPACING = 10
const SCREEN_EDGE_PADDING = 12

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [tooltipWidth, setTooltipWidth] = useState(0)

  // Track the position for exit animation - only updates when tooltip is visible
  const exitPositionRef = useRef<ExitPositionType>("top")
  const exitPosition = useSharedValue<ExitPositionType>("top")

  // Compute exit position using useMemo and update shared value via scheduleOnUI
  useMemo(() => {
    const currentPosition = tooltip?.position || "top"
    if (tooltip && currentPosition !== exitPositionRef.current) {
      exitPositionRef.current = currentPosition
      // Update shared value on UI thread to avoid render-time write warning
      scheduleOnUI(() => {
        "worklet"
        exitPosition.value = currentPosition
      })
    }
    return exitPositionRef.current
  }, [tooltip, exitPosition])

  // Memoize position calculation
  const position = useMemo(() => {
    if (!tooltip || tooltipWidth === 0)
      return { top: 0, left: 0, translateX: 0 }

    const screenWidth = Dimensions.get("window").width
    const targetCenterX = tooltip.x + tooltip.width / 2
    const tooltipPosition = tooltip.position || "top"

    const left = targetCenterX
    let tooltipTranslateX = -tooltipWidth / 2

    if (left + tooltipTranslateX < SCREEN_EDGE_PADDING) {
      tooltipTranslateX = SCREEN_EDGE_PADDING - left
    }

    if (
      left + tooltipTranslateX + tooltipWidth >
      screenWidth - SCREEN_EDGE_PADDING
    ) {
      tooltipTranslateX =
        screenWidth - SCREEN_EDGE_PADDING - tooltipWidth - left
    }

    const top =
      tooltipPosition === "bottom"
        ? tooltip.y + tooltip.height + TOOLTIP_BOTTOM_SPACING
        : tooltip.y - TOOLTIP_TOP_SPACING

    return {
      top,
      left,
      translateX: tooltipTranslateX,
    }
  }, [tooltip, tooltipWidth])

  // Extract tooltip position for use in worklets
  const tooltipPosition = tooltip?.position || "top"

  // Derive animated values based on tooltip state
  const isVisible = useDerivedValue(() => {
    return tooltip !== null && tooltipWidth > 0
  }, [tooltip, tooltipWidth])

  const animatedOpacity = useDerivedValue(() => {
    return withTiming(isVisible.value ? 1 : 0, { duration: 150 })
  }, [isVisible])

  const animatedTranslateY = useDerivedValue(() => {
    // Use current position when visible, stored exit position when hidden
    const position = isVisible.value ? tooltipPosition : exitPosition.value

    if (!isVisible.value) {
      // Exit animation
      const exitOffset =
        position === "bottom" ? -TOOLTIP_BOTTOM_SPACING : TOOLTIP_TOP_SPACING
      return withTiming(exitOffset, { duration: 150 })
    }
    // Enter animation: from offset to 0
    return withTiming(0, { duration: 150 })
  }, [isVisible, tooltipPosition, exitPosition])

  const animatedTranslateX = useDerivedValue(() => {
    return position.translateX
  }, [position.translateX])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animatedOpacity.value,
    transform: [
      { translateX: animatedTranslateX.value },
      { translateY: animatedTranslateY.value },
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
      backgroundColor: t.colors.secondary,
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
      color: t.colors.onSecondary,
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
  position?: ExitPositionType
}

type PressEvent = Parameters<NonNullable<PressableProps["onLongPress"]>>[0]

export function Tooltip({
  text,
  children,
  delayLongPress = 350,
  hapticFeedback = true,
  position = "top",
}: TooltipProps) {
  const context = useContext(TooltipContext)
  const pressableRef = useRef<RNView>(null)

  const handleLongPress = useCallback(() => {
    if (!pressableRef.current || !context) return

    pressableRef.current.measureInWindow((x, y, width, height) => {
      context.showTooltip({ text, x, y, width, height, position })

      if (hapticFeedback && Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
    })
  }, [text, context, hapticFeedback, position])

  const handlePressOut = useCallback(() => {
    if (!context) return
    context.hideTooltip()
  }, [context])

  if (!context) {
    logger.warn("Tooltip must be used within TooltipProvider")
    return children
  }

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
