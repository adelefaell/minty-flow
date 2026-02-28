import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker"
import {
  endOfDay,
  endOfMonth,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfYear,
} from "date-fns"
import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { Modal, Platform, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useUnistyles } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Input } from "~/components/ui/input"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import type { DateRangePresetId } from "~/utils/time-utils"
import { formatLoanDate, MONTH_NAMES } from "~/utils/time-utils"

import { dateRangePresetModalStyles as styles } from "./date-range-preset-modal.styles"
import { PRESETS } from "./presets"
import type {
  ActiveSource,
  DateRangePresetModalContentProps,
  ExpandedSection,
  PresetOption,
} from "./types"

export const DateRangePresetModalContent = ({
  initialStart,
  initialEnd,
  onSave,
  onRequestClose,
}: DateRangePresetModalContentProps) => {
  const { t } = useTranslation()
  const { theme } = useUnistyles()
  const insets = useSafeAreaInsets()
  const now = new Date()

  const [selectedPresetId, setSelectedPresetId] =
    useState<DateRangePresetId | null>(null)
  const [activeSource, setActiveSource] = useState<ActiveSource>("preset")
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null)

  const [customStart, setCustomStart] = useState<Date>(
    () => initialStart ?? now,
  )
  const [customEnd, setCustomEnd] = useState<Date>(() => initialEnd ?? now)
  const [byMonthYear, setByMonthYear] = useState(() => now.getFullYear())
  const [byMonthYearInput, setByMonthYearInput] = useState(() =>
    String(now.getFullYear()),
  )
  const [byMonthMonth, setByMonthMonth] = useState(() => now.getMonth())
  const [byYearInput, setByYearInput] = useState(() =>
    String(now.getFullYear()),
  )

  const [iosPickerTarget, setIosPickerTarget] = useState<
    "start" | "end" | null
  >(null)

  const toggleSection = useCallback((section: ExpandedSection) => {
    setExpandedSection((prev) => (prev === section ? null : section))
    if (section) {
      if (section === "byMonth") setActiveSource("byMonth")
      else if (section === "byYear") setActiveSource("byYear")
      else setActiveSource("custom")
    }
  }, [])

  const openNativePicker = useCallback(
    (target: "start" | "end") => {
      const value = target === "start" ? customStart : customEnd
      if (Platform.OS === "android") {
        DateTimePickerAndroid.open({
          value,
          mode: "date",
          display: "calendar",
          onChange: (_evt: DateTimePickerEvent, selectedDate?: Date) => {
            if (selectedDate && _evt.type === "set") {
              if (target === "start") {
                setCustomStart(selectedDate)
                if (selectedDate > customEnd) setCustomEnd(selectedDate)
              } else {
                setCustomEnd(selectedDate)
                if (selectedDate < customStart) setCustomStart(selectedDate)
              }
            }
          },
        })
      } else {
        setIosPickerTarget(target)
      }
    },
    [customStart, customEnd],
  )

  const handleIosDateChange = useCallback(
    (target: "start" | "end") =>
      (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === "set" && selectedDate) {
          if (target === "start") {
            setCustomStart(selectedDate)
            if (selectedDate > customEnd) setCustomEnd(selectedDate)
          } else {
            setCustomEnd(selectedDate)
            if (selectedDate < customStart) setCustomStart(selectedDate)
          }
        }
        setIosPickerTarget(null)
      },
    [customStart, customEnd],
  )

  const handlePresetSelect = useCallback((preset: PresetOption) => {
    setSelectedPresetId(preset.id)
    setActiveSource("preset")
    setExpandedSection(null)
  }, [])

  const handleByMonthSelect = useCallback((monthIndex: number) => {
    setByMonthMonth(monthIndex)
  }, [])

  const handleByYearNow = useCallback(() => {
    setByYearInput(String(now.getFullYear()))
  }, [now])

  const handleByMonthNow = useCallback(() => {
    const y = now.getFullYear()
    setByMonthYear(y)
    setByMonthYearInput(String(y))
    setByMonthMonth(now.getMonth())
  }, [now])

  const getSaveRange = useCallback((): { start: Date; end: Date } => {
    if (activeSource === "preset" && selectedPresetId) {
      const preset = PRESETS.find((p) => p.id === selectedPresetId)
      if (preset) return preset.getRange()
    }
    if (activeSource === "byMonth") {
      const d = new Date(byMonthYear, byMonthMonth, 1)
      return { start: startOfMonth(d), end: endOfMonth(d) }
    }
    if (activeSource === "byYear") {
      const y = Number.parseInt(byYearInput, 10)
      const year =
        Number.isFinite(y) && y >= 1970 && y <= 2100 ? y : now.getFullYear()
      const d = new Date(year, 0, 1)
      return { start: startOfYear(d), end: endOfYear(d) }
    }
    const start = customStart < customEnd ? customStart : customEnd
    const end = customStart < customEnd ? customEnd : customStart
    return { start: startOfDay(start), end: endOfDay(end) }
  }, [
    activeSource,
    selectedPresetId,
    byMonthYear,
    byMonthMonth,
    byYearInput,
    now,
    customStart,
    customEnd,
  ])

  const handleSave = useCallback(() => {
    const { start, end } = getSaveRange()
    onSave(start, end)
    onRequestClose()
  }, [getSaveRange, onSave, onRequestClose])

  const mutedColor = theme.colors.customColors?.semi ?? theme.colors.onSurface
  const fgColor = theme.colors.onSurface

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text variant="h3" style={styles.headerTitle}>
          Select range
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
      >
        <Text variant="small" style={styles.sectionLabelCommonOptions}>
          Common options
        </Text>
        <View style={styles.presetsRow}>
          {PRESETS.map((preset) => {
            const isSelected =
              activeSource === "preset" && selectedPresetId === preset.id
            return (
              <Pressable
                key={preset.id}
                onPress={() => handlePresetSelect(preset)}
                style={[
                  styles.presetButton,
                  isSelected && styles.presetButtonSelected,
                ]}
              >
                <Text
                  variant="default"
                  numberOfLines={1}
                  style={[
                    styles.presetButtonText,
                    isSelected && styles.presetButtonTextSelected,
                  ]}
                >
                  {preset.label}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <View style={styles.collapsibleSection}>
          <Pressable
            onPress={() => toggleSection("byMonth")}
            style={styles.rowBase}
          >
            <Text variant="default" style={styles.rowText}>
              By month
            </Text>
            <IconSymbol
              name={
                expandedSection === "byMonth" ? "chevron-down" : "chevron-right"
              }
              size={20}
              color={mutedColor}
            />
          </Pressable>
          {expandedSection === "byMonth" && (
            <View style={styles.expandedContent}>
              <View style={styles.monthYearRow}>
                <Button
                  variant="secondary"
                  onPress={() => {
                    const next = Math.max(1970, byMonthYear - 1)
                    setByMonthYear(next)
                    setByMonthYearInput(String(next))
                  }}
                  size="icon"
                  hitSlop={8}
                >
                  <IconSymbol name="chevron-left" size={24} color={fgColor} />
                </Button>
                <Input
                  value={byMonthYearInput}
                  onChangeText={(t) => {
                    const digits = t.replace(/\D/g, "").slice(0, 4)
                    setByMonthYearInput(digits)
                    const num = Number.parseInt(digits, 10)
                    if (!Number.isNaN(num)) {
                      setByMonthYear(Math.min(2100, Math.max(1970, num)))
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="Year"
                  style={styles.monthYearInput}
                />
                <Button
                  variant="secondary"
                  onPress={() => {
                    const next = Math.min(2100, byMonthYear + 1)
                    setByMonthYear(next)
                    setByMonthYearInput(String(next))
                  }}
                  hitSlop={8}
                  size="icon"
                >
                  <IconSymbol name="chevron-right" size={24} color={fgColor} />
                </Button>
              </View>
              <View style={styles.monthGrid}>
                {MONTH_NAMES.map((name, idx) => {
                  const isMonthSelected = byMonthMonth === idx
                  return (
                    <Pressable
                      key={name}
                      onPress={() => handleByMonthSelect(idx)}
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
              <Button
                variant="secondary"
                onPress={handleByMonthNow}
                style={{ alignSelf: "flex-end" }}
              >
                <Text variant="default">Now</Text>
              </Button>
            </View>
          )}
        </View>

        <View style={styles.collapsibleSection}>
          <Pressable
            onPress={() => toggleSection("byYear")}
            style={styles.rowBase}
          >
            <Text variant="default" style={styles.rowText}>
              By year
            </Text>
            <IconSymbol
              name={
                expandedSection === "byYear" ? "chevron-down" : "chevron-right"
              }
              size={20}
              color={mutedColor}
            />
          </Pressable>
          {expandedSection === "byYear" && (
            <View style={styles.expandedContent}>
              <Text variant="small" style={styles.sectionLabel}>
                {t("dateRange.yearPlaceholder")}
              </Text>
              <Input
                value={byYearInput}
                onChangeText={(t) => {
                  const digits = t.replace(/\D/g, "").slice(0, 4)
                  setByYearInput(digits)
                }}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="Year"
              />
              <Button
                variant="secondary"
                onPress={handleByYearNow}
                style={{ alignSelf: "flex-end" }}
              >
                <Text variant="default">Now</Text>
              </Button>
            </View>
          )}
        </View>

        <View style={styles.collapsibleSection}>
          <Pressable
            onPress={() => toggleSection("custom")}
            style={styles.rowBase}
          >
            <Text variant="default" style={styles.rowText}>
              Custom range
            </Text>
            <IconSymbol
              name={
                expandedSection === "custom" ? "chevron-down" : "chevron-right"
              }
              size={20}
              color={mutedColor}
            />
          </Pressable>
          {expandedSection === "custom" && (
            <View style={styles.expandedContentCompact}>
              <Pressable
                onPress={() => openNativePicker("start")}
                style={styles.customRangeRow}
              >
                <Text variant="default" style={styles.rowText}>
                  Start date
                </Text>
                <View style={styles.customRangeValue}>
                  <Text variant="default" style={styles.customRangeValueText}>
                    {formatLoanDate(customStart)}
                  </Text>
                  <IconSymbol
                    name="chevron-right"
                    size={18}
                    color={mutedColor}
                  />
                </View>
              </Pressable>
              <Pressable
                onPress={() => openNativePicker("end")}
                style={styles.customRangeRow}
              >
                <Text variant="default" style={styles.rowText}>
                  End date
                </Text>
                <View style={styles.customRangeValue}>
                  <Text variant="default" style={styles.customRangeValueText}>
                    {formatLoanDate(customEnd)}
                  </Text>
                  <IconSymbol
                    name="chevron-right"
                    size={18}
                    color={mutedColor}
                  />
                </View>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Button variant="outline" onPress={onRequestClose} style={{ flex: 1 }}>
          <Text variant="default">Cancel</Text>
        </Button>
        <Button variant="default" onPress={handleSave} style={{ flex: 1 }}>
          <Text variant="default">Save</Text>
        </Button>
      </View>

      {Platform.OS === "ios" && iosPickerTarget !== null && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => setIosPickerTarget(null)}
        >
          <Pressable
            style={styles.iosPickerOverlay}
            onPress={() => setIosPickerTarget(null)}
          >
            <Pressable
              style={[
                styles.iosPickerSheet,
                { paddingBottom: insets.bottom + 16 },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.iosPickerHeader}>
                <Pressable
                  onPress={() => setIosPickerTarget(null)}
                  hitSlop={12}
                >
                  <Text variant="default" style={styles.mutedText}>
                    Cancel
                  </Text>
                </Pressable>
                <Text variant="default" style={styles.iosPickerHeaderTitle}>
                  {iosPickerTarget === "start" ? "Start date" : "End date"}
                </Text>
                <Pressable
                  onPress={() => setIosPickerTarget(null)}
                  hitSlop={12}
                >
                  <Text variant="default" style={styles.iosPickerDone}>
                    Done
                  </Text>
                </Pressable>
              </View>
              <View style={styles.datePickerWrapper}>
                <DateTimePicker
                  value={iosPickerTarget === "start" ? customStart : customEnd}
                  mode="date"
                  display="spinner"
                  onChange={handleIosDateChange(iosPickerTarget)}
                  textColor={fgColor}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  )
}
