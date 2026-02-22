import { View } from "react-native"

import { PENDING_OPTIONS } from "~/types/transaction-filters"

import { Chip } from "../Chip"
import { filterHeaderStyles } from "../filter-header.styles"
import { PanelDoneButton } from "../PanelDoneButton"
import { CHIPS_PER_ROW } from "../types"
import { chunk } from "../utils"

interface PendingPanelProps {
  value: "all" | "pending" | "notPending"
  onSelect: (v: "all" | "pending" | "notPending") => void
  onDone: () => void
}

export function PendingPanel({ value, onSelect, onDone }: PendingPanelProps) {
  return (
    <View>
      {chunk(PENDING_OPTIONS, CHIPS_PER_ROW).map((row) => (
        <View
          key={row.map((o) => o.id).join(",")}
          style={[
            filterHeaderStyles.chipScrollRow,
            filterHeaderStyles.categoryRow,
          ]}
        >
          {row.map((opt) => (
            <Chip
              key={opt.id}
              label={opt.label}
              selected={value === opt.id}
              onPress={() => onSelect(opt.id)}
            />
          ))}
        </View>
      ))}
      <View style={filterHeaderStyles.panelHeader}>
        <View />
        <View style={filterHeaderStyles.panelHeaderActions}>
          <PanelDoneButton onPress={onDone} />
        </View>
      </View>
    </View>
  )
}
