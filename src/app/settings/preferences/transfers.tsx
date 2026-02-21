import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import {
  TransferLayoutEnum,
  type TransferLayoutType,
  useTransfersPreferencesStore,
} from "~/stores/transfers-preferences.store"

const HORIZONTAL_PADDING = 20

function LayoutPreview({ variant }: { variant: TransferLayoutType }) {
  return (
    <View style={styles.layoutPreview}>
      <IconSymbol
        name="swap-horizontal"
        size={20}
        color={styles.layoutIconColor.color}
      />
      <View style={styles.slidersPreview}>
        {variant === TransferLayoutEnum.COMBINE ? (
          <View style={[styles.sliderBar, styles.sliderBarCombined]} />
        ) : (
          <>
            <View style={[styles.sliderBar, styles.sliderBarGreen]} />
            <View style={[styles.sliderBar, styles.sliderBarRed]} />
          </>
        )}
      </View>
    </View>
  )
}

function LayoutOption({
  label,
  selected,
  variant,
  onPress,
}: {
  label: string
  selected: boolean
  variant: TransferLayoutType
  onPress: () => void
}) {
  return (
    <View style={styles.optionBlock}>
      <Pressable
        style={styles.radioRow}
        onPress={onPress}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
      >
        <View style={styles.radioRowInner}>
          <View
            style={[styles.radioOuter, selected && styles.radioOuterSelected]}
          >
            {selected && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.radioLabel}>{label}</Text>
        </View>
      </Pressable>
      <LayoutPreview variant={variant} />
    </View>
  )
}

export default function TransfersPreferencesScreen() {
  const layout = useTransfersPreferencesStore((s) => s.layout)
  const setLayout = useTransfersPreferencesStore((s) => s.setLayout)
  const excludeFromTotals = useTransfersPreferencesStore(
    (s) => s.excludeFromTotals,
  )
  const setExcludeFromTotals = useTransfersPreferencesStore(
    (s) => s.setExcludeFromTotals,
  )

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      {/* Layout section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Layout</Text>
        <View style={styles.radioGroup}>
          <LayoutOption
            label="Combine"
            selected={layout === TransferLayoutEnum.COMBINE}
            variant={TransferLayoutEnum.COMBINE}
            onPress={() => setLayout(TransferLayoutEnum.COMBINE)}
          />
          <LayoutOption
            label="Separate"
            selected={layout === TransferLayoutEnum.SEPARATE}
            variant={TransferLayoutEnum.SEPARATE}
            onPress={() => setLayout(TransferLayoutEnum.SEPARATE)}
          />
        </View>
        <View style={styles.infoRow}>
          <IconSymbol
            name="information"
            size={16}
            color={styles.infoIconColor.color}
          />
          <Text style={styles.infoText}>
            Transfers will always be separated in some places.
          </Text>
        </View>
      </View>

      {/* Exclude from totals section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exclude from totals</Text>
        <Pressable
          style={styles.excludeRow}
          onPress={() => setExcludeFromTotals(!excludeFromTotals)}
        >
          <Text style={styles.excludeLabel}>
            Don&apos;t count towards total expense/income
          </Text>
          <Switch
            value={excludeFromTotals}
            onValueChange={setExcludeFromTotals}
          />
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    paddingBottom: 40,
  },
  section: {
    paddingTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: theme.colors.onSecondary,
    marginBottom: 12,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  optionBlock: {
    marginBottom: 16,
  },
  layoutPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingLeft: HORIZONTAL_PADDING + 22 + 12,
  },
  layoutIconColor: {
    color: theme.colors.customColors?.semi,
  },
  slidersPreview: {
    flex: 1,
    gap: 8,
  },
  sliderBar: {
    height: 8,
    borderRadius: 4,
    maxWidth: "80%",
  },
  sliderBarGreen: {
    backgroundColor: theme.colors.customColors?.success,
  },
  sliderBarRed: {
    backgroundColor: theme.colors.error,
  },
  sliderBarCombined: {
    backgroundColor: theme.colors.primary,
  },
  radioGroup: {
    width: "100%",
  },
  radioRow: {
    width: "100%",
    paddingVertical: 14,
  },
  radioRowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.customColors?.semi,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 4,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  infoIconColor: {
    color: theme.colors.customColors?.semi,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.customColors?.semi,
    lineHeight: 18,
  },
  excludeRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: HORIZONTAL_PADDING,
    minHeight: 56,
  },
  excludeLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.onSurface,
    lineHeight: 20,
    marginRight: 16,
  },
}))
