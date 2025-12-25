import { View as RNView, type ViewProps as RNViewProps } from "react-native"
import { StyleSheet } from "react-native-unistyles"

type ViewVariant =
  | "default"
  | "card"
  | "container"
  | "bordered"
  | "muted"
  | "elevated"
  | "section"

export interface ViewProps extends RNViewProps {
  variant?: ViewVariant
  native?: boolean
}

export const View = ({
  variant = "default",
  style,
  native,
  ...props
}: ViewProps) => {
  if (native) return <RNView style={style} {...props} />
  return <RNView style={[viewStyles[variant], style]} {...props} />
}

const viewStyles = StyleSheet.create((theme) => ({
  default: {
    backgroundColor: theme.background,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    padding: 16,
    _web: {
      boxShadow: theme.boxShadow,
    },
    _ios: {
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    _android: {
      elevation: 2,
    },
  },
  container: {
    backgroundColor: theme.background,
    padding: 16,
  },
  bordered: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
  },
  muted: {
    backgroundColor: theme.muted,
  },
  elevated: {
    backgroundColor: theme.background,
    _web: {
      boxShadow: theme.boxShadow,
    },
    _ios: {
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    _android: {
      elevation: 4,
    },
  },
  section: {
    backgroundColor: theme.background,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
}))
