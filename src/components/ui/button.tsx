import * as React from "react"
import { Pressable, type PressableProps } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

// Text class context for passing variant styles to child Text components
const ButtonTextContext = React.createContext<{
  variant?: ButtonVariant
  size?: ButtonSize
}>({})

export const useButtonTextContext = () => React.useContext(ButtonTextContext)

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
type ButtonSize = "default" | "sm" | "lg" | "icon"

export interface ButtonProps extends PressableProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  variant = "default",
  size = "default",
  disabled,
  style,
  children,
  ...props
}: ButtonProps) {
  const { theme } = useUnistyles()
  const contextValue = React.useMemo(() => ({ variant, size }), [variant, size])

  return (
    <ButtonTextContext.Provider value={contextValue}>
      <Pressable
        role="button"
        android_ripple={{
          color: theme.rippleColor,
          foreground: true, // <-- KEY TO MAKE IT SHOW
        }}
        style={(state) => [
          styles.base,
          variantStyles[variant],
          sizeStyles[size],
          disabled && styles.disabled,
          // Native pressed state handling
          state.pressed && pressedStyles[variant],
          typeof style === "function" ? style(state) : style,
        ]}
        disabled={disabled}
        {...props}
      >
        {children}
      </Pressable>
    </ButtonTextContext.Provider>
  )
}

const styles = StyleSheet.create((theme) => ({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: theme.radius,
    gap: 8,
    flexShrink: 1,
    _web: {
      outlineStyle: "none",
      transitionProperty: "all",
      transitionDuration: "200ms",
      cursor: "pointer",
    },
  },
  disabled: {
    opacity: 0.5,
    _web: {
      pointerEvents: "none",
      cursor: "not-allowed",
    },
  },
}))

const variantStyles = StyleSheet.create((theme) => ({
  default: {
    backgroundColor: theme.primary,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  destructive: {
    backgroundColor: theme.destructive,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  outline: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  secondary: {
    backgroundColor: theme.secondary,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  ghost: {
    backgroundColor: "transparent",
    _web: {
      _hover: {
        backgroundColor: theme.muted,
      },
      _focusVisible: {
        backgroundColor: theme.muted,
        outlineWidth: 2,
        outlineStyle: "solid",
        outlineColor: theme.ring,
        outlineOffset: 2,
      },
      _active: {
        backgroundColor: theme.muted,
      },
    },
  },
  link: {
    backgroundColor: "transparent",
  },
}))

// Pressed state styles for native (non-web)
const pressedStyles = StyleSheet.create((theme) => ({
  default: {},
  destructive: {},
  outline: {
    backgroundColor: theme.muted,
  },
  secondary: {},
  ghost: {
    backgroundColor: theme.muted,
  },
  link: {},
}))

const sizeStyles = StyleSheet.create((theme) => ({
  default: {
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sm: {
    height: 36,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius,
    gap: 6,
  },
  lg: {
    height: 44,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: theme.radius,
  },
  icon: {
    height: 40,
    width: 40,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
}))

// Text styles for button variants
export const buttonTextStyles = StyleSheet.create((theme) => ({
  base: {
    fontSize: 14,
    fontWeight: "500",
    _web: {
      pointerEvents: "none",
      transitionProperty: "colors",
      transitionDuration: "200ms",
    },
  },
  default: {
    color: theme.primaryForeground,
  },
  destructive: {
    color: theme.destructiveForeground,
  },
  outline: {
    color: theme.foreground,
  },
  secondary: {
    color: theme.secondaryForeground,
  },
  ghost: {
    color: theme.foreground,
    _web: {
      _hover: {
        color: theme.primary,
      },
    },
  },
  link: {
    color: theme.primary,
    textDecorationLine: "underline",
    _web: {
      textDecorationLine: "underline",
    },
  },
}))

// Size-specific text styles
export const buttonTextSizeStyles = StyleSheet.create(() => ({
  default: {
    fontSize: 14,
  },
  sm: {
    fontSize: 13,
  },
  lg: {
    fontSize: 16,
  },
  icon: {
    fontSize: 14,
  },
}))
