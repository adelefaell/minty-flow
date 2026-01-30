import { Image } from "expo-image"
import type { FC } from "react"
import { Text as RNText } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import {
  type IconSize,
  IconSymbol,
  type IconSymbolName,
} from "~/components/ui/icon-symbol"
import { View } from "~/components/ui/view"
import type { MintyColorScheme } from "~/styles/theme/types"
import { isImageUrl } from "~/utils/is-image-url"
import { isSingleEmojiOrLetter } from "~/utils/is-single-emoji-or-letter"

interface DynamicIconProps {
  icon?: string | null
  size?: IconSize
  colorScheme?: MintyColorScheme | null
  color?: string
}

export const DynamicIcon: FC<DynamicIconProps> = ({
  icon,
  size = 24,
  colorScheme,
  color: explicitColor,
}) => {
  // Extract color and background from colorScheme
  const color = explicitColor || colorScheme?.primary || undefined
  const bgColor = colorScheme?.secondary || undefined
  const containerSize = size * 2 // Make container 2x icon size for circular appearance

  // Case 1: image URL/URI
  if (icon && icon !== null && isImageUrl(icon)) {
    return (
      <View
        style={[
          styles.imageContainer,
          {
            width: containerSize,
            height: containerSize,
          },
          bgColor && {
            backgroundColor: bgColor,
          },
        ]}
      >
        <Image
          source={{ uri: icon }}
          style={styles.image}
          contentFit="contain"
        />
      </View>
    )
  }

  // Case 2: text/emoji
  if (icon && icon !== null && isSingleEmojiOrLetter(icon)) {
    return (
      <View
        style={[
          styles.emojiContainer,
          {
            width: containerSize,
            height: containerSize,
          },
          bgColor && {
            backgroundColor: bgColor,
          },
        ]}
      >
        <RNText
          style={[
            styles.emojiText,
            {
              fontSize: size,
              lineHeight: size * 1.2,
            },
            color && { color },
          ]}
        >
          {icon}
        </RNText>
      </View>
    )
  }

  // Case 3: fallback
  if (!icon || icon === null) {
    return (
      <View
        style={[
          styles.iconContainer,
          {
            width: containerSize,
            height: containerSize,
          },
          bgColor && {
            backgroundColor: bgColor,
          },
        ]}
      >
        <IconSymbol name="shape" size={size} color={color} outline />
      </View>
    )
  }

  // Case 4: icon (MaterialCommunityIcons or IconSymbol)
  return (
    <View
      style={[
        styles.iconContainer,
        { width: containerSize, height: containerSize },
        bgColor && { backgroundColor: bgColor },
      ]}
    >
      <IconSymbol name={icon as IconSymbolName} size={size} color={color} />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  emojiContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
  },
  emojiText: {
    fontWeight: "600",
    color: theme.colors.primary,
    // Don't set lineHeight - let React Native compute it automatically
    // Setting lineHeight to 1 causes emojis to be clipped and show as ❓
    textAlign: "center",
    // Don't set fontFamily - let the system use native emoji fonts
    // This ensures emojis render correctly on iOS (Apple Color Emoji) and Android (Noto Color Emoji)
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.secondary,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.colors.radius,
    overflow: "hidden",
    backgroundColor: theme.colors.secondary,
    padding: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: theme.colors.radius,
  },
}))
