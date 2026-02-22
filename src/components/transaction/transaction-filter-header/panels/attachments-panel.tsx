import { View } from "react-native"

import {
  ATTACHMENT_OPTIONS,
  type AttachmentsOptionsType,
} from "~/types/transaction-filters"

import { Chip } from "../chip"
import { filterHeaderStyles } from "../filter-header.styles"
import { PanelDoneButton } from "../panel-done-button"

interface AttachmentsPanelProps {
  value: AttachmentsOptionsType
  onSelect: (v: AttachmentsOptionsType) => void
  onDone: () => void
}

export function AttachmentsPanel({
  value,
  onSelect,
  onDone,
}: AttachmentsPanelProps) {
  return (
    <View>
      <View
        style={[filterHeaderStyles.chipWrap, filterHeaderStyles.categoryRow]}
      >
        {ATTACHMENT_OPTIONS.map((opt) => (
          <Chip
            key={opt.id}
            label={opt.label}
            selected={value === opt.id}
            onPress={() => onSelect(opt.id)}
          />
        ))}
      </View>
      <View style={filterHeaderStyles.panelHeader}>
        <View />
        <View style={filterHeaderStyles.panelHeaderActions}>
          <PanelDoneButton onPress={onDone} />
        </View>
      </View>
    </View>
  )
}
