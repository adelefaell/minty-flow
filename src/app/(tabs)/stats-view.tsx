import { useState } from "react"
import { StyleSheet } from "react-native-unistyles"

import { ReorderableListV2 } from "~/components/reorderable-list-v2"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

interface StatItem {
  id: string
  label: string
  value: string
}

export default function StatsScreen() {
  const [stats, setStats] = useState<StatItem[]>([
    { id: "1", label: "Total Income", value: "$5,000" },
    { id: "2", label: "Total Expenses", value: "$3,200" },
    { id: "3", label: "Net Savings", value: "$1,800" },
    { id: "4", label: "Monthly Budget", value: "$4,000" },
    { id: "5", label: "Remaining Budget", value: "$800" },
    { id: "6", label: "Transactions", value: "42" },
  ])

  return (
    <View style={styles.container}>
      <Text variant="h1" style={styles.title}>
        Stats
      </Text>
      <Text variant="muted" style={styles.subtitle}>
        Use arrows to reorder
      </Text>
      <ReorderableListV2
        data={stats}
        onReorder={setStats}
        renderItem={({ item }) => (
          <View style={styles.statItem}>
            <Text variant="p" style={styles.statLabel}>
              {item.label}
            </Text>
            <Text variant="h3" style={styles.statValue}>
              {item.value}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  title: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  subtitle: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  statItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 80,
    justifyContent: "center",
  },
  statLabel: {
    marginBottom: 4,
  },
  statValue: {
    color: theme.colors.primary,
  },
}))
