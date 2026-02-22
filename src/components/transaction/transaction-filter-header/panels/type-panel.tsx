import { View } from "react-native"

import { TYPE_OPTIONS } from "~/types/transaction-filters"
import type { TransactionType } from "~/types/transactions"

import { Chip } from "../chip"
import { filterHeaderStyles } from "../filter-header.styles"
import { PanelClearButton } from "../panel-clear-button"
import { PanelDoneButton } from "../panel-done-button"
import { CHIPS_PER_ROW } from "../types"
import { chunk } from "../utils"

interface TypePanelProps {
  value: TransactionType[]
  onToggle: (type: TransactionType) => void
  onClear: () => void
  onDone: () => void
}

export function TypePanel({
  value,
  onToggle,
  onClear,
  onDone,
}: TypePanelProps) {
  return (
    <View>
      {chunk(
        TYPE_OPTIONS.filter((o) => o.id !== "all"),
        CHIPS_PER_ROW,
      ).map((row) => (
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
              selected={value.includes(opt.id as TransactionType)}
              onPress={() => onToggle(opt.id as TransactionType)}
            />
          ))}
        </View>
      ))}
      <View style={filterHeaderStyles.panelHeader}>
        <View />
        <View style={filterHeaderStyles.panelHeaderActions}>
          <PanelClearButton onPress={onClear} disabled={value.length === 0} />
          <PanelDoneButton onPress={onDone} />
        </View>
      </View>
    </View>
  )
}
