import * as React from "react"
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

// Context for passing view variant to child Text components
const ViewTextContext = React.createContext<{
  variant?: ViewVariant
}>({})

export const useViewTextContext = () => React.useContext(ViewTextContext)

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
  const contextValue = React.useMemo(() => ({ variant }), [variant])

  if (native) return <RNView style={style} {...props} />

  return (
    <ViewTextContext.Provider value={contextValue}>
      <RNView style={[viewStyles[variant], style]} {...props} />
    </ViewTextContext.Provider>
  )
}

const viewStyles = StyleSheet.create((theme) => ({
  default: {
    backgroundColor: theme.colors.surface,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    padding: 16,
    _web: {
      boxShadow: theme.colors.boxShadow,
    },
    _ios: {
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    _android: {
      elevation: 2,
    },
  },
  container: {
    backgroundColor: theme.colors.surface,
    padding: 16,
  },
  bordered: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius,
  },
  muted: {
    backgroundColor: theme.colors.secondary,
  },
  elevated: {
    backgroundColor: theme.colors.surface,
    _web: {
      boxShadow: theme.colors.boxShadow,
    },
    _ios: {
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    _android: {
      elevation: 4,
    },
  },
  section: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
}))
