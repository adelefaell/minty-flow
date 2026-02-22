import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"

import { filterHeaderStyles } from "./filter-header.styles"

interface PanelClearButtonProps {
  onPress: () => void
  disabled?: boolean
  /** Show close-circle icon (e.g. in Search panel). */
  hideIcon?: boolean
}

export function PanelClearButton({
  onPress,
  disabled = false,
  hideIcon = false,
}: PanelClearButtonProps) {
  return (
    <Button
      variant="ghost"
      onPress={onPress}
      disabled={disabled}
      style={filterHeaderStyles.clearHit}
    >
      {hideIcon ? null : <IconSymbol name="close-circle" size={18} />}
      <Text style={filterHeaderStyles.clearText}>Clear</Text>
    </Button>
  )
}
