// src/components/ui/icon-symbol.tsx
// Fallback for using MaterialIcons on Android and web.

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import type { SymbolViewProps, SymbolWeight } from "expo-symbols"
import type { ComponentProps } from "react"
import type { OpaqueColorValue, StyleProp, TextStyle } from "react-native"
import { useUnistyles } from "react-native-unistyles"

/**
 * Mapping type that associates SF Symbol names with Material Icon names.
 */

type SFName = SymbolViewProps["name"]
type MaterialName = ComponentProps<typeof MaterialCommunityIcons>["name"]

function defineIconMapping<T extends Partial<Record<SFName, MaterialName>>>(
  mapping: T,
) {
  return mapping
}

// const MAPPING: ValidateMapping<typeof RAW_MAPPING> = RAW_MAPPING
const MAPPING = defineIconMapping({
  "circle.line": "circle-outline",
  "chevron.right": "chevron-right",
  "delete.backward": "backspace",
  "gearshape.fill": "cog",
  "account.fill": "account",
  "chart.bar.fill": "chart-box",
  "wallet.bifold.fill": "wallet-bifold",
  "paintbrush.fill": "format-paint",
  "bell.fill": "bell",
  "info.square.fill": "information-slab-box-outline",
  "dollarsign.circle": "cash",
  "square.grid.2x2": "view-grid",
  tag: "tag-outline",
  trash: "trash-can-outline",
  "server.rack": "server",
  "checkmark.circle": "check-circle",
  "exclamationmark.triangle": "alert",
  "info.circle": "information",
  xmark: "close",
  "camera.fill": "camera",
  checkmark: "check",
  plus: "plus",
  minus: "minus",
  "sun.max.fill": "weather-sunny",
  "moon.fill": "weather-night",
  "desktopcomputer.and.iphone": "devices",
  leaf: "leaf",
  "cloud.fill": "cloud",
  "heart.fill": "heart",
  "crown.fill": "crown",
  "arrow-left": "arrow-left",
  // Calculator icons
  "c.circle": "alpha-c",
  plusminus: "plus-minus-variant",
  percent: "percent",
  divide: "division",
  equal: "equal",
  // Settings icons
  target: "target",
  "clock.fill": "clock-outline",
  "bell.badge.fill": "bell-badge",
  "format-page-split": "format-page-split",
  toaster: "toaster",
  wallet: "wallet",

  // Privacy icons
  "eye.slash": "eye-off",
  "lock.open": "lock-open",
  "lock.fill": "lock",
  dialpad: "dialpad",
  "location.fill": "map-marker",
  number: "pound",

  // Accounts icons
  "creditcard.fill": "credit-card",
  "banknote.fill": "piggy-bank",
  "reorder.horizontal": "reorder-horizontal",
  "arrow.down": "arrow-down",
  "arrow.up": "arrow-up",
  "arrow.down.circle.fill": "arrow-down-circle",
  "arrow.up.circle.fill": "arrow-up-circle",
  "chart.line.uptrend.xyaxis": "chart-timeline-variant",
} as const)

/**
 * Type representing valid icon names that have been mapped to Material Icons.
 * Only icons present in the MAPPING object can be used.
 *
 * This type is exported and used by both iOS and Android/web implementations
 * to ensure type safety - you can only use icons that have been added to MAPPING.
 */
export type IconSymbolName = keyof typeof MAPPING

/**
 * Mapping of SF Symbol names to Material Icon names for Android and web platforms.
 *
 * This mapping allows the component to use SF Symbol names (for consistency with iOS)
 * while rendering Material Icons on non-iOS platforms.
 *
 * To add new icons:
 * 1. Find the SF Symbol name you want to use
 * 2. Find the equivalent Material Icon name
 * 3. Add the mapping here
 *
 * @see {@link https://icons.expo.fyi | Material Icons Directory}
 * @see {@link https://developer.apple.com/sf-symbols/ | SF Symbols App}
 */

export type IconSize = 12 | 14 | 16 | 18 | 20 | 24 | 28 | 32 | 36 | 40 | 310

/**
 * Props for the IconSymbol component on Android and web.
 */
type IconSymbolProps = {
  /**
   * The name of the icon to display. Must be a key from the MAPPING object.
   * Uses SF Symbol naming convention for consistency with iOS.
   */
  name: IconSymbolName
  /**
   * The size of the icon in pixels.
   * @default 24
   */
  size?: IconSize
  /**
   * The color of the icon. Can be a string or an OpaqueColorValue.
   */
  color?: string | OpaqueColorValue
  /**
   * Additional styles to apply to the icon.
   */
  style?: StyleProp<TextStyle>
  /**
   * The weight of the symbol. Note: This prop is accepted but not used
   * on Android/web as Material Icons don't support weight variations.
   */
  weight?: SymbolWeight
}

/**
 * An icon component that uses Material Icons on Android and web platforms.
 *
 * This is the fallback implementation for non-iOS platforms. It uses Material Icons
 * from Expo's vector icons library, mapped from SF Symbol names to ensure API
 * consistency across platforms.
 *
 * **Important:** Only icons that have been added to the MAPPING object can be used.
 * If you need a new icon, add it to the MAPPING constant above.
 *
 * @example
 * ```tsx
 * <IconSymbol name="circle.dotted" size={32} color="#007AFF" />
 * ```
 *
 * @param props - The component props
 * @returns A React component that renders a Material Icon
 *
 * @see {@link https://icons.expo.fyi | Material Icons Directory}
 * @see {@link https://docs.expo.dev/versions/latest/sdk/vector-icons/ | Expo Vector Icons Documentation}
 */
export function IconSymbol({ name, size = 24, color, style }: IconSymbolProps) {
  const { theme } = useUnistyles()
  return (
    <MaterialCommunityIcons
      color={color ?? theme.colors.primary}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  )
}
