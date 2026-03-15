import { StyleSheet } from "react-native-unistyles"

import type { IconSvgName } from "~/components/ui/icon-svg"
import { IconSvg } from "~/components/ui/icon-svg"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

interface EmptyStateProps {
  icon: IconSvgName
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <IconSvg name={icon} size={48} style={styles.icon} />
      <Text variant="default" style={styles.title}>
        {title}
      </Text>
      {description ? (
        <Text variant="small" style={styles.description}>
          {description}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((t) => ({
  container: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.secondary,
    borderRadius: t.radius,
    marginTop: 8,
  },
  icon: {
    opacity: 0.5,
    marginBottom: 16,
    color: t.colors.onSecondary,
  },
  title: {
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
    color: t.colors.onSurface,
  },
  description: {
    color: t.colors.onSecondary,
    textAlign: "center",
  },
}))
