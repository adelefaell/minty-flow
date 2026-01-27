import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs"
import { PlatformPressable } from "@react-navigation/elements"
import * as Haptics from "expo-haptics"

/**
 * HAPTIC TAB COMPONENT EXPLANATION
 *
 * The HapticTab component is a wrapper around React Navigation's PlatformPressable
 * that adds haptic feedback when tabs are pressed on iOS devices.
 *
 * What it does:
 * 1. Wraps the tab button with PlatformPressable (cross-platform pressable component)
 * 2. Intercepts the onPressIn event (when user starts pressing down)
 * 3. Triggers a light haptic feedback on iOS devices using expo-haptics
 * 4. Preserves all original props and functionality
 *
 * Use case:
 * - Provides tactile feedback when users interact with bottom tab navigation
 * - Enhances UX on iOS by giving physical feedback for button presses
 * - Only works on iOS (Android doesn't trigger haptics in this implementation)
 */
export const HapticTab = (props: BottomTabBarButtonProps) => {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === "ios") {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }
        props.onPressIn?.(ev)
      }}
    />
  )
}
