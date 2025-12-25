import { useCallback, useState } from "react"
import {
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
} from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

export interface InputProps extends RNTextInputProps {
  error?: boolean
}

export function Input({
  error = false,
  editable = true,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const { theme } = useUnistyles()
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = useCallback(
    (e: Parameters<NonNullable<RNTextInputProps["onFocus"]>>[0]) => {
      setIsFocused(true)
      onFocus?.(e)
    },
    [onFocus],
  )

  const handleBlur = useCallback(
    (e: Parameters<NonNullable<RNTextInputProps["onBlur"]>>[0]) => {
      setIsFocused(false)
      onBlur?.(e)
    },
    [onBlur],
  )

  return (
    <RNTextInput
      style={[
        styles.base,
        isFocused && styles.focused,
        error && styles.error,
        !editable && styles.disabled,
        typeof style === "function" ? undefined : style,
      ]}
      placeholderTextColor={theme.mutedForeground}
      selectionColor={theme.primary}
      editable={editable}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  )
}

const styles = StyleSheet.create((theme) => ({
  base: {
    height: 36,
    width: "100%",
    minWidth: 0,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.input,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 16,
    color: theme.foreground,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    _web: {
      outlineStyle: "none",
      transitionProperty: "border-color, box-shadow",
      transitionDuration: "200ms",
      fontSize: 14,
    },
    _android: {
      paddingTop: 8,
      paddingBottom: 8,
    },
  },
  focused: {
    borderColor: theme.ring,
    shadowColor: theme.ring,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    _web: {
      borderColor: theme.ring,
      shadowColor: theme.ring,
      shadowOpacity: 0.5,
      shadowRadius: 3,
    },
  },
  error: {
    borderColor: theme.destructive,
    shadowColor: theme.destructive,
    shadowOpacity: 0.2,
    _web: {
      borderColor: theme.destructive,
      shadowColor: theme.destructive,
      shadowOpacity: 0.4,
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
