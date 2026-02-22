import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

import { themeScreenStyles } from "./theme.styles"

interface ThemeHeaderProps {
  currentThemeDisplayName: string
}

export function ThemeHeader({ currentThemeDisplayName }: ThemeHeaderProps) {
  return (
    <View style={themeScreenStyles.header}>
      <Text style={themeScreenStyles.headerLabel}>Current theme</Text>
      <Text style={themeScreenStyles.headerTheme}>
        {currentThemeDisplayName}
      </Text>
    </View>
  )
}
