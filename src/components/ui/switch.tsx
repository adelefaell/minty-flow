import {
  Switch as RNSwitch,
  type SwitchProps as RNSwitchProps,
} from "react-native"
import { useUnistyles } from "react-native-unistyles"

export interface SwitchProps extends RNSwitchProps {
  native?: boolean
}

export const Switch = ({
  native = false,
  value,
  onValueChange,
  trackColor,
  thumbColor,
  disabled,
  ...props
}: SwitchProps) => {
  const { theme } = useUnistyles()

  const finalThumbColor =
    thumbColor ?? (value ? theme.colors.secondary : theme.colors.primary)

  const finalTrackColor = {
    false: trackColor?.false ?? theme.colors.secondary,
    true: trackColor?.true ?? theme.colors.primary,
  }

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      trackColor={finalTrackColor}
      thumbColor={finalThumbColor}
      disabled={disabled}
      {...props}
    />
  )
}
