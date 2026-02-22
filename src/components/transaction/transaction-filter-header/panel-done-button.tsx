import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"

import { filterHeaderStyles } from "./filter-header.styles"

interface PanelDoneButtonProps {
  onPress: () => void
  disabled?: boolean
  hideIcon?: boolean
}

export function PanelDoneButton({
  onPress,
  disabled,
  hideIcon,
}: PanelDoneButtonProps) {
  return (
    <Button
      variant="ghost"
      onPress={onPress}
      disabled={disabled}
      style={filterHeaderStyles.doneHit}
    >
      {hideIcon ? null : <IconSymbol name="check-circle" size={18} />}
      <Text style={filterHeaderStyles.doneText}>Done</Text>
    </Button>
  )
}
