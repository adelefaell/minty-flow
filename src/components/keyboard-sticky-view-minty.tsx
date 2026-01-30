import type React from "react"
import { useMemo } from "react"
import { KeyboardStickyView } from "react-native-keyboard-controller"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export const KeyboardStickyViewMinty = ({
  children,
}: {
  children?: React.ReactNode | undefined
}) => {
  const insets = useSafeAreaInsets()

  const offset = useMemo(() => {
    // We use the negative value of the system inset.
    // This 'undoes' any padding being forced by a parent SafeAreaView.
    const dynamicPullDown = -insets.bottom

    return {
      closed: dynamicPullDown,
      opened: 0, // Keep 0 so it sticks perfectly to the keyboard top
    }
  }, [insets.bottom])

  return <KeyboardStickyView offset={offset}>{children}</KeyboardStickyView>
}
