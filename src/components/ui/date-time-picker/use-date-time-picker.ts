import { DateTimePickerAndroid } from "@react-native-community/datetimepicker"
import { useRef, useState } from "react"
import { Platform } from "react-native"

type UseDatePickerOptions = {
  mode?: "date" | "time"
  onConfirm: (date: Date) => void
}

/**
 * Manages a date/time picker across platforms.
 *
 * - Android: opens the native dialog imperatively via DateTimePickerAndroid —
 *   no JSX required in the render tree.
 * - iOS: tracks visibility + starting value and returns `modalProps` to spread
 *   onto a <DateTimePickerModal />.
 *
 * Usage:
 *   const picker = useDateTimePicker({ onConfirm: (date) => doSomething(date) })
 *   <Pressable onPress={() => picker.open(currentDate)} />
 *   <DateTimePickerModal {...picker.modalProps} />
 */
export function useDateTimePicker({
  mode = "date",
  onConfirm,
}: UseDatePickerOptions) {
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState(new Date())

  // Keep ref so Android's async callback always sees the latest onConfirm
  const onConfirmRef = useRef(onConfirm)
  onConfirmRef.current = onConfirm

  const open = (initialDate = new Date()) => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: initialDate,
        mode,
        display: "default",
        onChange: (_evt, date) => {
          if (date) onConfirmRef.current(date)
        },
      })
    } else {
      setValue(initialDate)
      setVisible(true)
    }
  }

  const close = () => setVisible(false)

  return {
    open,
    modalProps: {
      visible,
      mode,
      value,
      onClose: close,
      onConfirm: (date: Date) => {
        close()
        onConfirmRef.current(date)
      },
    },
  }
}
