/**
 * Date range picker modal with presets and collapsible By month, By year, Custom range.
 * Uses @react-native-community/datetimepicker for custom start/end dates.
 */

import { Modal } from "react-native"

import { DateRangePresetModalContent } from "./date-range-preset-modal-content"
import type { DateRangePresetModalProps } from "./types"

export function DateRangePresetModal({
  visible,
  initialStart,
  initialEnd,
  onSave,
  onRequestClose,
}: DateRangePresetModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onRequestClose}
    >
      {visible ? (
        <DateRangePresetModalContent
          key={`${initialStart?.getTime() ?? 0}-${initialEnd?.getTime() ?? 0}`}
          initialStart={initialStart}
          initialEnd={initialEnd}
          onSave={onSave}
          onRequestClose={onRequestClose}
        />
      ) : null}
    </Modal>
  )
}
