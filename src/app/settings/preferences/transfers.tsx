import { useTranslation } from "react-i18next"
import { ScrollView } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

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

const layoutOptions: Array<{
  value: TransferLayoutType
  label: string
  description: string
}> = [
  {
    value: TransferLayoutEnum.COMBINE,
    label: "Combine",
    description: "Single net amount",
  },
  {
    value: TransferLayoutEnum.SEPARATE,
    label: "Separate",
    description: "Outgoing and incoming shown separately",
  },
]

function LayoutPreview({ variant }: { variant: TransferLayoutType }) {
  const { theme } = useUnistyles()
  const successColor =
    theme.colors.customColors?.success ?? theme.colors.primary
  return (
    <View native style={styles.previewRow}>
      <IconSymbol
        name="swap-horizontal"
        size={18}
        color={theme.colors.customColors?.semi}
      />
      <View native style={styles.slidersPreview}>
        {variant === TransferLayoutEnum.COMBINE ? (
          <View
            native
            style={[styles.sliderBar, { backgroundColor: successColor }]}
          />
        ) : (
          <>
            <View
              native
              style={[styles.sliderBar, { backgroundColor: successColor }]}
            />
            <View
              native
              style={[
                styles.sliderBar,
                { backgroundColor: theme.colors.error },
              ]}
            />
          </>
        )}
      </View>
    </View>
  )
}

export default function TransfersPreferencesScreen() {
  const { theme } = useUnistyles()
  const { t } = useTranslation()
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
      {/* Layout */}
      <View native style={[styles.sectionLabel, styles.sectionLabelFirst]}>
        <Text variant="small" style={styles.sectionLabelText}>
          {t("transfers.layout.subtitle")}
        </Text>
      </View>
      <View native style={styles.card}>
        {layoutOptions.map((option, index) => {
          const isSelected = layout === option.value
          const isLast = index === layoutOptions.length - 1
          return (
            <View key={option.value} native>
              <Pressable
                style={styles.row}
                onPress={() => setLayout(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
              >
                <View native style={styles.rowContent}>
                  <Text style={styles.rowLabel}>
                    {t(
                      `transfers.layout.options.${
                        option.value === TransferLayoutEnum.COMBINE
                          ? "combine"
                          : "separate"
                      }.label`,
                    )}
                  </Text>
                  <Text variant="small" style={styles.rowDescription}>
                    {t(
                      `transfers.layout.options.${
                        option.value === TransferLayoutEnum.COMBINE
                          ? "combine"
                          : "separate"
                      }.description`,
                    )}
                  </Text>
                  <LayoutPreview variant={option.value} />
                </View>
                {isSelected ? (
                  <IconSymbol
                    name="check"
                    size={20}
                    color={theme.colors.primary}
                  />
                ) : null}
              </Pressable>
              {!isLast ? <View native style={styles.divider} /> : null}
            </View>
          )
        })}
      </View>
      <View native style={styles.captionRow}>
        <IconSymbol
          name="information"
          size={14}
          color={theme.colors.customColors?.semi}
        />
        <Text variant="small" style={styles.captionText}>
          {t("transfers.layout.caption")}
        </Text>
      </View>

      {/* Exclude from totals */}
      <View native style={styles.sectionLabel}>
        <Text variant="small" style={styles.sectionLabelText}>
          {t("transfers.totals.subtitle")}
        </Text>
      </View>
      <View native style={styles.toggleCard}>
        <Pressable
          style={styles.toggleRow}
          onPress={() => setExcludeFromTotals(!excludeFromTotals)}
        >
          <View native style={styles.toggleRowContent}>
            <Text style={styles.toggleLabel}>
              {t("transfers.totals.excludeToggle.label")}
            </Text>
            <Text variant="small" style={styles.toggleDescription}>
              {t("transfers.totals.excludeToggle.description")}
            </Text>
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 48,
  },

  sectionLabel: {
    paddingHorizontal: 4,
    marginBottom: 8,
    marginTop: 24,
  },
  sectionLabelFirst: {
    marginTop: 8,
  },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    opacity: 0.5,
  },

  card: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSecondary,
  },
  rowDescription: {
    fontSize: 13,
    color: theme.colors.onSecondary,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.customColors?.semi,
  },

  toggleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.colors.radius,
    borderWidth: 1,
    borderColor: theme.colors.customColors?.semi,
    overflow: "hidden",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  toggleRowContent: {
    flex: 1,
    gap: 2,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  toggleDescription: {
    fontSize: 13,
    color: theme.colors.customColors.semi,
  },

  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  slidersPreview: {
    gap: 6,
  },
  sliderBar: {
    height: 6,
    borderRadius: 3,
    width: 200,
    backgroundColor: theme.colors.customColors?.semi,
  },

  captionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  captionText: {
    color: theme.colors.customColors?.semi,
    flex: 1,
    fontSize: 12,
  },
}))
