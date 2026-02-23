import type { ReactNode } from "react"
import { useUnistyles } from "react-native-unistyles"

import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"

import { filterHeaderStyles } from "./filter-header.styles"

interface ChipProps {
  label: string
  selected: boolean
  onPress: () => void
  leading?: ReactNode
}

export function Chip({ label, selected, onPress, leading }: ChipProps) {
  const { theme } = useUnistyles()
  const borderColor = `${theme.colors.onSurface}30`
  const selectedBg = theme.colors.secondary ?? `${theme.colors.onSurface}15`

  return (
    <Pressable
      style={[
        filterHeaderStyles.chip,
        {
          backgroundColor: selected ? selectedBg : "transparent",
          borderColor: selected ? "transparent" : borderColor,
          borderWidth: 1,
        },
      ]}
      onPress={onPress}
    >
      {leading}
      <Text
        style={[
          filterHeaderStyles.chipLabel,
          {
            color: selected ? theme.colors.primary : theme.colors.onSurface,
            fontWeight: selected ? "600" : "400",
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {selected ? <IconSymbol name="check" size={14} /> : null}
    </Pressable>
  )
}
