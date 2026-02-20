import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import {
  TransferLayoutEnum,
  useTransfersPreferencesStore,
} from "~/stores/transfers-preferences.store"

function LayoutOption({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      style={styles.radioRow}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </Pressable>
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
      showsVerticalScrollIndicator={false}
    >
      {/* Layout section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Layout</Text>
        <View style={styles.layoutPreview}>
          <IconSymbol
            name="swap-horizontal"
            size={24}
            color={styles.layoutIconColor.color}
          />
          <View style={styles.slidersPreview}>
            {layout === TransferLayoutEnum.COMBINE ? (
              <View style={[styles.sliderBar, styles.sliderBarCombined]} />
            ) : (
              <>
                <View style={[styles.sliderBar, styles.sliderBarGreen]} />
                <View style={[styles.sliderBar, styles.sliderBarRed]} />
              </>
            )}
          </View>
        </View>
        <LayoutOption
          label="Combine"
          selected={layout === TransferLayoutEnum.COMBINE}
          onPress={() => setLayout(TransferLayoutEnum.COMBINE)}
        />
        <LayoutOption
          label="Separate"
          selected={layout === TransferLayoutEnum.SEPARATE}
          onPress={() => setLayout(TransferLayoutEnum.SEPARATE)}
        />
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
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  layoutPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    paddingVertical: 8,
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
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
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
    marginTop: 8,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    gap: 16,
  },
  excludeLabel: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.onSurface,
    lineHeight: 20,
  },
}))
