import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

import type { ThemeVariant } from "../../utils/theme-utils"
import { themeScreenStyles } from "./theme.styles"

const VARIANTS: ThemeVariant[] = ["Light", "Dark", "OLED"]

interface ThemeVariantPillsProps {
  selectedVariant: ThemeVariant
  onVariantChange: (variant: ThemeVariant) => void
}

export function ThemeVariantPills({
  selectedVariant,
  onVariantChange,
}: ThemeVariantPillsProps) {
  return (
    <View style={themeScreenStyles.variantPills}>
      {VARIANTS.map((variant) => {
        const isSelected = selectedVariant === variant
        return (
          <Pressable
            key={variant}
            style={[
              themeScreenStyles.pill,
              isSelected && themeScreenStyles.pillSelected,
            ]}
            onPress={() => onVariantChange(variant)}
          >
            <Text
              style={[
                themeScreenStyles.pillText,
                isSelected && themeScreenStyles.pillTextSelected,
              ]}
            >
              {variant}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
