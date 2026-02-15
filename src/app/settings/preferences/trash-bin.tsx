import { useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { ScrollView } from "react-native-gesture-handler"
import { StyleSheet } from "react-native-unistyles"

import { ConfirmModal } from "~/components/confirm-modal"
import { ChoiceChipsComponent } from "~/components/ui/choice-chips"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { destroyAllTransactionModel } from "~/database/services/transaction-service"
import { useTrashBinStore } from "~/stores/trash-bin.store"
import { Toast } from "~/utils/toast"

const RetentionPeriodEnum = {
  ONE_DAY: "1 day",
  SEVEN_DAYS: "7 days",
  FOURTEEN_DAYS: "14 days",
  THIRTY_DAYS: "30 days",
  NINETY_DAYS: "90 days",
  ONE_EIGHTY_DAYS: "180 days",
  THREE_SIXTY_FIVE_DAYS: "365 days",
  FOREVER: "forever",
} as const

export default function TrashBinScreen() {
  const router = useRouter()
  const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false)
  const retentionPeriod = useTrashBinStore((s) => s.retentionPeriod)
  const setRetentionPeriod = useTrashBinStore((s) => s.setRetentionPeriod)

  const handleView = useCallback(() => {
    router.push("/settings/trash")
  }, [router])

  const handleEmptyConfirmed = useCallback(() => {
    destroyAllTransactionModel()
      .then(() => {
        Toast.success({
          title: "Trash Emptied",
          description: "Your trash has been cleared.",
        })
      })
      .catch(() => {
        Toast.error({
          title: "Cleanup Failed",
          description: "An unexpected error occurred. Please try again.",
        })
      })
  }, [])

  return (
    <ScrollView style={styles.container}>
      {/* Retention Period Choices */}
      <ChoiceChipsComponent
        title="Retention Period"
        description="Automatically clear deleted items after a set period"
        style={{
          paddingHorizontal: 20,
        }}
        choices={Object.values(RetentionPeriodEnum)}
        selectedValue={retentionPeriod}
        onSelect={(choice) => setRetentionPeriod(choice)}
      />

      {/* View Removed List */}
      <Pressable style={styles.actionItem} onPress={handleView}>
        <View style={styles.actionItemLeft}>
          <View style={styles.actionItemContent}>
            <View style={styles.titleRow}>
              <Text variant="default" style={styles.actionItemTitle}>
                View removed list
              </Text>
            </View>
          </View>
        </View>
        <IconSymbol
          style={styles.actionItemIcon}
          name="chevron-right"
          size={18}
        />
      </Pressable>

      {/* Empty Trash Bin */}
      <Pressable
        style={styles.actionItem}
        onPress={() => {
          setConfirmModalVisible(true)
        }}
      >
        <View style={styles.actionItemLeft}>
          <View style={styles.actionItemContent}>
            <View style={styles.titleRow}>
              <Text variant="default" style={styles.actionTrashItemTitle}>
                Empty trash bin
              </Text>
            </View>
          </View>
        </View>
        <IconSymbol
          style={styles.actionTrashItemIcon}
          name="trash-can"
          size={18}
        />
      </Pressable>

      {/* Empty Trash Modal */}
      <ConfirmModal
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
        onConfirm={handleEmptyConfirmed}
        title="Empty Trash"
        description="All items in the trash will be permanently deleted. This action cannot be undone."
        confirmLabel="Empty Trash"
        cancelLabel="Cancel"
        variant="destructive"
        icon="trash-can"
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: theme.colors.onSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  placeholder: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
  },
  placeholderText: {
    fontSize: 14,
    color: theme.colors.onSecondary,
  },

  actionSection: {
    marginTop: 24,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  actionItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 15,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionItemContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  actionTrashItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.error,
  },
  actionItemIcon: {
    color: theme.colors.onSecondary,
  },
  actionTrashItemIcon: {
    color: theme.colors.error,
  },
  actionItemDescription: {
    fontSize: 13,
    color: theme.colors.onSecondary,
  },
  badge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.colors.radius,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.onSecondary,
  },

  sectionHeader: {
    marginTop: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.secondary,
    opacity: 0.5,
  },
  sectionTotalsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  totalsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  sectionTotal: {
    fontWeight: "700",
    color: theme.colors.onSecondary,
    fontSize: 12,
  },

  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  emptyState: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: theme.colors.onSecondary,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
}))
