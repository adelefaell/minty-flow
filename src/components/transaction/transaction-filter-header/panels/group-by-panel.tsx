import { View } from "react-native"

import type { GroupByOption } from "~/types/transaction-filters"
import { GROUP_BY_OPTIONS } from "~/types/transaction-filters"

import { Chip } from "../chip"
import { filterHeaderStyles } from "../filter-header.styles"
import { PanelDoneButton } from "../panel-done-button"
import { CHIPS_PER_ROW } from "../types"
import { chunk } from "../utils"

interface GroupByPanelProps {
  value: GroupByOption
  onSelect: (v: GroupByOption) => void
  onDone: () => void
}

export function GroupByPanel({ value, onSelect, onDone }: GroupByPanelProps) {
  return (
    <View>
      {chunk(GROUP_BY_OPTIONS, CHIPS_PER_ROW).map((row) => (
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
