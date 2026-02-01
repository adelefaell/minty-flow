import {
  Platform,
  Text as RNText,
  type TextProps as RNTextProps,
  type Role,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Fonts } from "~/styles/fonts"

import {
  buttonTextSizeStyles,
  buttonTextStyles,
  useButtonTextContext,
} from "./button"

export type TextVariant =
  | "default"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "p"
  | "blockquote"
  | "code"
  | "lead"
  | "large"
  | "small"
  | "muted"
  | "link"

const ROLE: Partial<Record<TextVariant, Role>> = {
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  link: "link",
  blockquote: Platform.select({ web: "blockquote" as Role }),
  code: Platform.select({ web: "code" as Role }),
}

const ARIA_LEVEL: Partial<Record<TextVariant, number>> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
}

export interface TextProps extends RNTextProps {
  variant?: TextVariant
}

export const Text = ({ variant = "default", style, ...props }: TextProps) => {
  const buttonContext = useButtonTextContext()

  // If inside a button, use button text styles
  const textStyle = buttonContext.variant
    ? [
        buttonTextStyles.base,
        buttonTextStyles[buttonContext.variant],
        buttonContext.size && buttonTextSizeStyles[buttonContext.size],
      ]
    : [textStyles[variant]]

  return (
    <RNText
      style={[textStyle, style]}
      role={ROLE[variant]}
      aria-level={ARIA_LEVEL[variant]}
      {...props}
    />
  )
}

const textStyles = StyleSheet.create((theme) => ({
  default: {
    color: theme.colors.onSurface,
    backgroundColor: "transparent",
    fontSize: 16,
    lineHeight: 24,
    _web: {
      userSelect: "text",
    },
  },
  h1: {
    color: theme.colors.onSurface,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "600",
    letterSpacing: -0.5,
    fontFamily: Fonts.sans,
  },
  h2: {
    color: theme.colors.onSurface,
    paddingBottom: 8,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "600",
    letterSpacing: -0.5,
    fontFamily: Fonts.sans,
    _web: {
      scrollMarginTop: 80,
    },
  },
  h3: {
    color: theme.colors.onSurface,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600",
    letterSpacing: -0.5,
    fontFamily: Fonts.sans,
    _web: {
      scrollMarginTop: 80,
    },
  },
  h4: {
    color: theme.colors.onSurface,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    letterSpacing: -0.5,
    fontFamily: Fonts.sans,
    _web: {
      scrollMarginTop: 80,
    },
  },
  p: {
    fontFamily: Fonts.sans,
    color: theme.colors.onSurface,
    fontSize: 16,
    lineHeight: 28,
    marginVertical: 6,
  },
  blockquote: {
    color: theme.colors.onSurface,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.onSurface,
    paddingLeft: 12,
    marginVertical: 16,
    fontStyle: "italic",
    fontFamily: Fonts.sans,
  },
  code: {
    color: theme.colors.onSurface,
    backgroundColor: theme.colors.secondary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontFamily: Fonts.mono,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  lead: {
    color: theme.colors.onSecondary,
    fontFamily: Fonts.sans,
    fontSize: 20,
    lineHeight: 28,
  },
  large: {
    color: theme.colors.onSurface,
    fontFamily: Fonts.sans,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "600",
  },
  small: {
    color: theme.colors.onSurface,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  muted: {
    color: theme.colors.onSecondary,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    color: theme.colors.primary,
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    _web: {
      textDecorationLine: "underline",
      cursor: "pointer",
      _hover: {
        color: theme.colors.primary,
      },
    },
  },
}))
