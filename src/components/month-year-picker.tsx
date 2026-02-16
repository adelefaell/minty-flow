/**
 * Inline month + year picker: "Select a month", year number input, 4×3 month grid.
 * Selection is applied only when the user presses Done. Now sets local selection to current month/year.
 */

import { useCallback, useEffect, useState } from "react"
import { Keyboard } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { MONTH_NAMES } from "~/utils/time-utils"

import { Input } from "./ui/input"

export interface MonthYearPickerProps {
  /** Current year (e.g. 2026). */
  year: number
  /** Current month 0–11. */
  month: number
  /** Called when user presses Done (commits the current selection). */
  onSelect: (year: number, month: number) => void
  /** Called when user taps "Now" (sets local selection to current month/year). */
  onNow?: () => void
  /** Called when user taps "Done" (after onSelect). */
  onDone?: () => void
}

const MIN_YEAR = 1970
const MAX_YEAR = 2100

function clampYear(y: number): number {
  return Math.min(MAX_YEAR, Math.max(MIN_YEAR, y))
}

export function MonthYearPicker({
  year,
  month,
  onSelect,
  onNow,
  onDone,
}: MonthYearPickerProps) {
  const [localYear, setLocalYear] = useState(year)
  const [localMonth, setLocalMonth] = useState(month)
  const [yearInputValue, setYearInputValue] = useState(String(year))

  useEffect(() => {
    setLocalYear(year)
    setLocalMonth(month)
    setYearInputValue(String(year))
  }, [year, month])

  const handleMonthPress = useCallback((monthIndex: number) => {
    setLocalMonth(monthIndex)
  }, [])

  const handleNow = useCallback(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    setLocalYear(y)
    setLocalMonth(m)
    setYearInputValue(String(y))
    onNow?.()
  }, [onNow])

  const handleDone = useCallback(() => {
    Keyboard.dismiss()
    const y = clampYear(parseInt(yearInputValue, 10) || localYear)
    setLocalYear(y)
    setYearInputValue(String(y))
    onSelect(y, localMonth)
    onDone?.()
  }, [yearInputValue, localYear, localMonth, onSelect, onDone])

  return (
    <View style={styles.expandedContent}>
      <View style={styles.monthYearRow}>
        <Input
          value={yearInputValue}
          onChangeText={(text) => {
            const digits = text.replace(/\D/g, "").slice(0, 4)
            setYearInputValue(digits)
            const num = parseInt(digits, 10)
            if (!Number.isNaN(num)) {
              setLocalYear(clampYear(num))
            }
          }}
          keyboardType="number-pad"
          maxLength={4}
          placeholder={String(year)}
          placeholderTextColor={styles.semiColor.color}
          style={styles.yearInput}
          textAlign="center"
        />
      </View>
      <View style={styles.monthGrid}>
        {MONTH_NAMES.map((name, idx) => {
          const isMonthSelected = localMonth === idx
          return (
            <Pressable
              key={name}
              onPress={() => handleMonthPress(idx)}
              style={[
                styles.monthCell,
                isMonthSelected && styles.monthCellSelected,
              ]}
            >
              <Text
                variant="default"
                style={[
                  styles.monthCellText,
                  isMonthSelected && styles.monthCellTextSelected,
                ]}
              >
                {name}
              </Text>
            </Pressable>
          )
        })}
      </View>
      <View style={styles.actionsRow}>
        <Button
          variant="secondary"
          onPress={handleNow}
          style={styles.nowButton}
        >
          <Text variant="default">Now</Text>
        </Button>
        <Button
          variant="secondary"
          onPress={handleDone}
          style={styles.doneButton}
        >
          <Text variant="default">Done</Text>
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => {
  const primary = theme.colors.primary
  const radius = theme.colors.radius
  return {
    expandedContent: {
      padding: 20,
      paddingTop: 0,
      backgroundColor: theme.colors.surface,
      gap: 16,
    },
    monthYearRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      marginBottom: 8,
    },
    yearInput: {
      fontSize: 18,
      fontWeight: "600" as const,
      minWidth: 72,
      borderRadius: radius,
      backgroundColor: theme.colors.secondary,
    },
    monthGrid: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: 8,
    },
    monthCell: {
      width: "30%",
      paddingVertical: 10,
      borderRadius: radius,
      backgroundColor: "transparent",
      alignItems: "center" as const,
    },
    monthCellSelected: {
      backgroundColor: `${primary}25`,
    },
    monthCellText: {
      color: theme.colors.onSurface,
      fontWeight: "400" as const,
    },
    monthCellTextSelected: {
      color: primary,
      fontWeight: "600" as const,
    },
    actionsRow: {
      flexDirection: "row" as const,
      justifyContent: "flex-end" as const,
      alignItems: "center" as const,
      gap: 12,
    },
    nowButton: {},
    doneButton: {},
    semiColor: {
      color: theme.colors.customColors.semi,
    },
  }
})
