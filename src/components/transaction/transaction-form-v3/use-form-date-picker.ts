import { DateTimePickerAndroid } from "@react-native-community/datetimepicker"
import { useCallback, useReducer, useRef } from "react"
import type { UseFormSetValue, UseFormWatch } from "react-hook-form"
import { Platform } from "react-native"

import type { TransactionFormValues } from "~/schemas/transactions.schema"
import { startOfNextMinute } from "~/utils/pending-transactions"

import { mergeReducer } from "./form-utils"
import type { DatePickerState, DatePickerTarget, RecurringState } from "./types"

export function useFormDatePicker(
  recurring: RecurringState,
  setRecurring: (update: Partial<RecurringState>) => void,
  watch: UseFormWatch<TransactionFormValues>,
  setValue: UseFormSetValue<TransactionFormValues>,
) {
  const [datePicker, setDatePicker] = useReducer(
    mergeReducer<DatePickerState>,
    {
      visible: false,
      mode: "date" as const,
      tempDate: new Date(),
    },
  )
  const datePickerTargetRef = useRef<DatePickerTarget>("transaction")

  const openDatePicker = useCallback(
    (target: DatePickerTarget = "transaction") => {
      datePickerTargetRef.current = target
      const current =
        target === "recurringStart"
          ? recurring.startDate
          : target === "recurringEnd"
            ? (recurring.endDate ?? new Date())
            : watch("transactionDate")
      setDatePicker({ tempDate: current })
      if (Platform.OS === "android") {
        DateTimePickerAndroid.open({
          value: current,
          mode: "date",
          display: "calendar",
          onChange: (_evt, selectedDate) => {
            if (selectedDate && _evt.type === "set") {
              setDatePicker({ tempDate: selectedDate })
              DateTimePickerAndroid.open({
                value: selectedDate,
                mode: "time",
                display: "spinner",
                onChange: (evt, timeDate) => {
                  if (timeDate && evt.type === "set") {
                    const t = datePickerTargetRef.current
                    if (t === "recurringStart")
                      setRecurring({ startDate: timeDate })
                    else if (t === "recurringEnd")
                      setRecurring({ endDate: timeDate })
                    else {
                      setValue("transactionDate", timeDate, {
                        shouldDirty: true,
                      })
                      setValue(
                        "isPending",
                        timeDate.getTime() > startOfNextMinute().getTime(),
                        { shouldDirty: true },
                      )
                    }
                  }
                },
              })
            }
          },
        })
      } else {
        setDatePicker({ mode: "date", visible: true })
      }
    },
    [watch, setValue, recurring.startDate, recurring.endDate, setRecurring],
  )

  const confirmIosDate = useCallback(
    (date: Date) => {
      if (datePicker.mode === "time") {
        const tgt = datePickerTargetRef.current
        if (tgt === "recurringStart") setRecurring({ startDate: date })
        else if (tgt === "recurringEnd") setRecurring({ endDate: date })
        else {
          setValue("transactionDate", date, { shouldDirty: true })
          setValue(
            "isPending",
            date.getTime() > startOfNextMinute().getTime(),
            { shouldDirty: true },
          )
        }
        setDatePicker({ visible: false })
      } else {
        // Date confirmed — switch to time picker starting from the confirmed date
        setDatePicker({ mode: "time", tempDate: date })
      }
    },
    [datePicker.mode, setValue, setRecurring],
  )

  const handleSetNow = useCallback(() => {
    const now = new Date()
    setValue("transactionDate", now, { shouldDirty: true })
    setValue("isPending", now.getTime() > startOfNextMinute().getTime(), {
      shouldDirty: true,
    })
  }, [setValue])

  return {
    datePicker,
    setDatePicker,
    openDatePicker,
    confirmIosDate,
    handleSetNow,
  }
}
