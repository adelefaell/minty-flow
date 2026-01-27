// src/components/ui/icon-symbol.tsx
// Icon component using MaterialCommunityIcons

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import type { ComponentProps } from "react"
import type { OpaqueColorValue, StyleProp, TextStyle } from "react-native"
import { useUnistyles } from "react-native-unistyles"

type MaterialName = ComponentProps<typeof MaterialCommunityIcons>["name"]

/**
 * Helper function to ensure all icon names are valid MaterialCommunityIcons names.
 * This provides type safety at compile time.
 */
export function defineValidIcons<T extends readonly MaterialName[]>(
  icons: T,
): T {
  return icons
}

/**
 * Valid MaterialCommunityIcons names that can be used in the app.
 * Add new icon names here as needed.
 *
 * TypeScript will ensure all names are valid MaterialCommunityIcons names.
 */
export const VALID_ICON_NAMES = defineValidIcons([
  // outline
  "circle-outline",
  "chevron-right",
  "backspace-outline",
  "chart-box-outline",
  "palette-swatch-outline",
  "bell-outline",
  "tag-outline",
  "trash-can-outline",
  "server-outline",
  "check-circle-outline",
  "alert-outline",
  "information-outline",
  "close",
  "camera-outline",
  "check",
  "arrow-left",
  // Calculator icons
  "plus",
  "minus",
  "percent",
  "division",
  "equal",
  "eraser",
  "plus-minus-variant",
  // Settings icons
  "target",
  "clock-outline",
  "format-page-split",
  "toaster",
  "wallet-bifold-outline",
  "credit-card-outline",
  "tag-multiple-outline",
  // Additional icons used in the app
  "arrow-up",
  "arrow-down",
  "swap-vertical",
  "shape-outline",
  "shape-plus-outline",
  // Additional icons for settings and preferences
  "handshake-outline",
  "chart-pie-outline",
  "dialpad",
  "chart-timeline-variant",
  "alert-circle-outline",
  "eye-off",
  "eye-outline",
  "eye-off-outline",
  "lock-outline",
  "lock-open-outline",
  "pound",
  "map-marker-outline",
  "image-outline",
  "palette-outline",
  "triangle-outline",
  "clipboard-outline",
  "image-multiple-outline",
  // Category preset icons
  "basket-outline",
  "car-outline",
  "heart-outline",
  "school-outline",
  "shopping-outline",
  "briefcase-outline",
  "trending-up",
  "office-building-outline",
  "gift-outline",
  "piggy-bank-outline",
  "chart-line",
  // filled
  "wallet",
  "cog",
  "puzzle-edit",
  "shape",
  "magnify",
  "anchor",
] as const)

/**
 * Type representing valid MaterialCommunityIcons names.
 * Only icons present in the VALID_ICON_NAMES array can be used.
 * The defineValidIcons function ensures all names are valid MaterialName types.
 */
export type IconSymbolName = (typeof VALID_ICON_NAMES)[number]

export type IconSize =
  | 12
  | 14
  | 16
  | 18
  | 20
  | 24
  | 28
  | 32
  | 36
  | 40
  | 48
  | 56
  | 64
  | 72
  | 80
  | 88
  | 96
  | 104
  | 112
  | 120
  | 128
  | 136
  | 144
  | 152
  | 160
  | 168
  | 176
  | 184
  | 192
  | 200
  | 208
  | 216
  | 224
  | 232
  | 240
  | 248
  | 256

/**
 * Props for the IconSymbol component.
 */
type IconSymbolProps = {
  /**
   * The name of the MaterialCommunityIcons icon to display.
   * Must be a valid icon name from VALID_ICON_NAMES.
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
}

/**
 * An icon component that uses MaterialCommunityIcons.
 *
 * **Important:** Only icons that have been added to the VALID_ICON_NAMES array can be used.
 * If you need a new icon, add it to the VALID_ICON_NAMES constant above.
 *
 * @example
 * ```tsx
 * <IconSymbol name="cog" size={32} color="#007AFF" />
 * ```
 *
 * @param props - The component props
 * @returns A React component that renders a MaterialCommunityIcon
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
      name={name || "anchor"}
      style={style}
    />
  )
}
