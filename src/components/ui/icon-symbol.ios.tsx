// src/components/ui/icon-symbol.ios.tsx
import {
  SymbolView,
  type SymbolViewProps,
  type SymbolWeight,
} from "expo-symbols"
import type { StyleProp, ViewStyle } from "react-native"
import { useUnistyles } from "react-native-unistyles"

import type { IconSize } from "./icon-symbol"

/**
 * Props for the IconSymbol component on iOS.
 */
type IconSymbolProps = {
  /**
   * The name of the SF Symbol to display.
   * @see {@link https://developer.apple.com/sf-symbols/ | SF Symbols}
   */
  name: SymbolViewProps["name"]
  /**
   * The size of the icon in pixels.
   * @default 24
   */
  size?: IconSize
  /**
   * The color of the icon.
   */
  color?: string
  /**
   * Additional styles to apply to the icon container.
   */
  style?: StyleProp<ViewStyle>
  /**
   * The weight/thickness of the symbol.
   * @default "regular"
   */
  weight?: SymbolWeight
}

/**
 * An icon component that uses native SF Symbols on iOS.
 *
 * This component provides access to Apple's SF Symbols, which are optimized
 * vector icons that automatically adapt to system settings like font weight
 * and accessibility preferences.
 *
 * @example
 * ```tsx
 * <IconSymbol name="circle.dotted" size={32} color="#007AFF" weight="bold" />
 * ```
 *
 * @param props - The component props
 * @returns A React component that renders an SF Symbol
 *
 * @see {@link https://developer.apple.com/sf-symbols/ | SF Symbols Documentation}
 * @see {@link https://docs.expo.dev/versions/latest/sdk/symbols/ | Expo Symbols Documentation}
 */
export const IconSymbol = ({
  name,
  size = 24,
  color,
  style,
  weight = "regular",
}: IconSymbolProps) => {
  const { theme } = useUnistyles()
  return (
    <SymbolView
      weight={weight}
      tintColor={color ?? theme.colors.onSurface}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  )
}
