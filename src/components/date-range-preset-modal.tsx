/**
 * Date range picker modal with presets and collapsible By month, By year, Custom range.
 * Uses @react-native-community/datetimepicker for custom start/end dates.
 */

import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker"
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from "date-fns"
import { useCallback, useEffect, useState } from "react"
import { Modal, Platform, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Input } from "~/components/ui/input"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"

const WEEK_STARTS_ON = 1 // Monday
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export type DateRangePresetId =
  | "last30"
  | "thisWeek"
  | "thisMonth"
  | "thisYear"
  | "allTime"
  | "byMonth"
  | "byYear"
  | "custom"

export interface DateRangePresetModalProps {
  visible: boolean
  initialStart?: Date
  initialEnd?: Date
  onSave: (start: Date, end: Date) => void
  onRequestClose: () => void
}

interface PresetOption {
  id: DateRangePresetId
  label: string
  getRange: () => { start: Date; end: Date }
}

function getPresetOptions(): PresetOption[] {
  const now = new Date()
  return [
    {
      id: "last30",
      label: "Last 30 days",
      getRange: () => ({
        start: startOfDay(subDays(now, 29)),
        end: endOfDay(now),
      }),
    },
    {
      id: "thisWeek",
      label: "This week",
      getRange: () => ({
        start: startOfWeek(now, { weekStartsOn: WEEK_STARTS_ON }),
        end: endOfWeek(now, { weekStartsOn: WEEK_STARTS_ON }),
      }),
    },
    {
      id: "thisMonth",
      label: "This month",
      getRange: () => ({
        start: startOfMonth(now),
        end: endOfMonth(now),
      }),
    },
    {
      id: "thisYear",
      label: "This year",
      getRange: () => ({
        start: startOfYear(now),
        end: endOfYear(now),
      }),
    },
    {
      id: "allTime",
      label: "All time",
      getRange: () => ({
        start: startOfYear(new Date(2000, 0, 1)),
        end: endOfDay(now),
      }),
    },
  ]
}

const PRESETS = getPresetOptions()

type ExpandedSection = "byMonth" | "byYear" | "custom" | null
type ActiveSource = "preset" | "byMonth" | "byYear" | "custom"

const styles = StyleSheet.create((theme) => {
  const muted = theme.colors.customColors?.semi ?? theme.colors.onSurface
  const primary = theme.colors.primary
  const radius = theme.colors.radius ?? 10
  const borderColor = `${muted}40`

  return {
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    header: {
      paddingHorizontal: 20,
    },
    headerTitle: {
      color: muted,
      marginTop: 10,
    },
    scrollContent: {
      paddingTop: 20,
      paddingBottom: 24,
    },
    sectionLabelCommonOptions: {
      color: muted,
      marginBottom: 8,
      marginHorizontal: 20,
    },
    sectionLabel: {
      color: muted,
    },
    presetsRow: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: 10,
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    presetButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: radius,
      borderWidth: 1,
      borderColor,
      backgroundColor: "transparent",
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 8,
      flexShrink: 0,
    },
    presetButtonSelected: {
      borderColor: primary,
      backgroundColor: `${primary}20`,
    },
    presetButtonText: {
      color: theme.colors.onSurface,
      fontWeight: "400" as const,
    },
    presetButtonTextSelected: {
      color: primary,
      fontWeight: "600" as const,
    },
    collapsibleSection: {
      marginBottom: 8,
    },
    rowBase: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
      paddingVertical: 14,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.surface,
    },
    rowText: {
      color: theme.colors.onSurface,
    },
    expandedContent: {
      padding: 20,
      paddingTop: 0,
      backgroundColor: theme.colors.surface,
      gap: 16,
    },
    expandedContentCompact: {
      gap: 0,
      paddingTop: 0,
      backgroundColor: theme.colors.surface,
    },
    monthYearRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
      marginBottom: 8,
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
    customRangeRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    customRangeValue: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 8,
    },
    customRangeValueText: {
      color: muted,
    },
    bottomBar: {
      flexDirection: "row" as const,
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      backgroundColor: theme.colors.surface,
    },
    iosPickerOverlay: {
      flex: 1,
      justifyContent: "flex-end" as const,
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    iosPickerSheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: 16,
    },
    iosPickerHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    iosPickerHeaderTitle: {
      color: theme.colors.onSurface,
      fontWeight: "600" as const,
    },
    mutedText: {
      color: muted,
    },
    iosPickerDone: {
      color: primary,
      fontWeight: "600" as const,
    },
    datePickerWrapper: {
      paddingHorizontal: 16,
    },
  }
})

export function DateRangePresetModal({
  visible,
  initialStart,
  initialEnd,
  onSave,
  onRequestClose,
}: DateRangePresetModalProps) {
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
  const [byMonthMonth, setByMonthMonth] = useState(() => now.getMonth())
  const [byYearInput, setByYearInput] = useState(() =>
    String(now.getFullYear()),
  )

  const [iosPickerTarget, setIosPickerTarget] = useState<
    "start" | "end" | null
  >(null)

  useEffect(() => {
    if (visible) {
      const initialNow = new Date()
      setCustomStart(initialStart ?? initialNow)
      setCustomEnd(initialEnd ?? initialNow)
      setByMonthYear(initialNow.getFullYear())
      setByMonthMonth(initialNow.getMonth())
      setByYearInput(String(initialNow.getFullYear()))
      setSelectedPresetId(null)
      setActiveSource("preset")
      setExpandedSection(null)
      setIosPickerTarget(null)
    }
  }, [visible, initialStart, initialEnd])

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
    setByMonthYear(now.getFullYear())
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
    <Modal
      visible={visible}
      animationType="slide"
      // ios only
      presentationStyle={"fullScreen"}
      onRequestClose={onRequestClose}
    >
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

          {/* By month - collapsible */}
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
                  expandedSection === "byMonth"
                    ? "chevron-down"
                    : "chevron-right"
                }
                size={20}
                color={mutedColor}
              />
            </Pressable>
            {expandedSection === "byMonth" && (
              <View style={styles.expandedContent}>
                <Text variant="small" style={styles.sectionLabel}>
                  Select a month
                </Text>
                <View style={styles.monthYearRow}>
                  <Button
                    variant="secondary"
                    onPress={() => setByMonthYear((y) => y - 1)}
                    size="icon"
                    hitSlop={8}
                  >
                    <IconSymbol name="chevron-left" size={24} color={fgColor} />
                  </Button>
                  <Text variant="large" style={styles.iosPickerHeaderTitle}>
                    {byMonthYear}
                  </Text>
                  <Button
                    variant="secondary"
                    onPress={() => setByMonthYear((y) => y + 1)}
                    hitSlop={8}
                    size="icon"
                  >
                    <IconSymbol
                      name="chevron-right"
                      size={24}
                      color={fgColor}
                    />
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

          {/* By year - collapsible */}
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
                  expandedSection === "byYear"
                    ? "chevron-down"
                    : "chevron-right"
                }
                size={20}
                color={mutedColor}
              />
            </Pressable>
            {expandedSection === "byYear" && (
              <View style={styles.expandedContent}>
                <Text variant="small" style={styles.sectionLabel}>
                  Select a year
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

          {/* Custom range - collapsible */}
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
                  expandedSection === "custom"
                    ? "chevron-down"
                    : "chevron-right"
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
                      {format(customStart, "MMM d, yyyy")}
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
                      {format(customEnd, "MMM d, yyyy")}
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

        {/* Bottom: Cancel and Save */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <Button
            variant="outline"
            onPress={onRequestClose}
            style={{ flex: 1 }}
          >
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
                    value={
                      iosPickerTarget === "start" ? customStart : customEnd
                    }
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
    </Modal>
  )
}
