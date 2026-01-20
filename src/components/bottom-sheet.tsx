import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
import type { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { type ReactNode, useCallback, useMemo } from "react"
import { StyleSheet as UnistylesSheet } from "react-native-unistyles"
import { create } from "zustand"

// Unistyles for theme-aware styles
const sheetStyles = UnistylesSheet.create((theme) => ({
  background: {
    backgroundColor: theme.colors.surface,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  handleIndicator: {
    backgroundColor: theme.colors.onSurface,
  },
}))

/**
 * Zustand Store for Bottom Sheets
 */
interface BottomSheetStore {
  sheets: Map<string, React.RefObject<BottomSheetModalMethods | null>>
  registerSheet: (
    id: string,
    ref: React.RefObject<BottomSheetModalMethods | null>,
  ) => void
  unregisterSheet: (id: string) => void
  present: (id: string) => void
  dismiss: (id: string) => void
  snapToIndex: (id: string, index: number) => void
  collapse: (id: string) => void
}

const useBottomSheetStore = create<BottomSheetStore>((set, get) => ({
  sheets: new Map(),
  registerSheet: (id, ref) => {
    const { sheets } = get()
    sheets.set(id, ref)
    set({ sheets: new Map(sheets) })
  },
  unregisterSheet: (id) => {
    const { sheets } = get()
    sheets.delete(id)
    set({ sheets: new Map(sheets) })
  },
  present: (id) => {
    const { sheets } = get()
    sheets.get(id)?.current?.present()
  },
  dismiss: (id) => {
    const { sheets } = get()
    sheets.get(id)?.current?.dismiss()
  },
  snapToIndex: (id, index) => {
    const { sheets } = get()
    sheets.get(id)?.current?.snapToIndex(index)
  },
  collapse: (id) => {
    const { sheets } = get()
    sheets.get(id)?.current?.collapse()
  },
}))

/**
 * Hook to control bottom sheets
 */
export function useBottomSheet(id: string) {
  const present = useBottomSheetStore((state) => state.present)
  const dismiss = useBottomSheetStore((state) => state.dismiss)
  const snapToIndex = useBottomSheetStore((state) => state.snapToIndex)
  const collapse = useBottomSheetStore((state) => state.collapse)

  return {
    present: () => present(id),
    dismiss: () => dismiss(id),
    snapToIndex: (index: number) => snapToIndex(id, index),
    collapse: () => collapse(id),
  }
}

/**
 * Bottom Sheet Modal Component - Use this for multiple bottom sheets
 * Renders at the root level and overlays everything including tab bars
 */
export interface BottomSheetModalProps {
  /** Unique identifier for this bottom sheet */
  id: string
  /** Content to render inside the bottom sheet */
  children: ReactNode
  /** Snap points for the bottom sheet (e.g., ['25%', '50%', '90%'] or [100, 300, 500]) */
  snapPoints?: Array<string | number>
  /** Callback when sheet index changes */
  onChange?: (index: number) => void
  /** Callback when sheet is dismissed */
  onDismiss?: () => void
  /** Enable pan down to close */
  enablePanDownToClose?: boolean
  /** Background color for the sheet */
  backgroundColor?: string
  /** Backdrop component render function */
  backdropComponent?: (props: BottomSheetBackdropProps) => ReactNode
  /** Backdrop opacity (0-1) */
  backdropOpacity?: number
  /** Snap point index when backdrop appears */
  backdropAppearsOnIndex?: number
  /** Snap point index when backdrop disappears */
  backdropDisappearsOnIndex?: number
  /** Enable touch through backdrop */
  backdropEnableTouchThrough?: boolean
  /** Backdrop press behavior: 'none' | 'close' | 'collapse' | number */
  backdropPressBehavior?: "none" | "close" | "collapse" | number
  /** Enable dynamic sizing */
  enableDynamicSizing?: boolean
}

export function BottomSheetModalComponent({
  id,
  children,
  snapPoints = ["60%"],
  onChange,
  onDismiss,
  enablePanDownToClose = true,
  backgroundColor,
  backdropComponent,
  backdropOpacity = 0.5,
  backdropAppearsOnIndex = 0,
  backdropDisappearsOnIndex = -1,
  backdropEnableTouchThrough = false,
  backdropPressBehavior = "close",
  enableDynamicSizing = true,
}: BottomSheetModalProps) {
  const registerSheet = useBottomSheetStore((state) => state.registerSheet)
  const unregisterSheet = useBottomSheetStore((state) => state.unregisterSheet)

  // Use callback ref to register/unregister without useEffect
  const bottomSheetModalRef = useCallback(
    (node: BottomSheetModalMethods | null) => {
      if (node) {
        // Register when ref is set
        registerSheet(id, { current: node })
      } else {
        // Unregister when ref is cleared (component unmounting)
        unregisterSheet(id)
      }
    },
    [id, registerSheet, unregisterSheet],
  )

  // Memoize snap points
  const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints])

  // Handle sheet changes
  const handleSheetChanges = useCallback(
    (sheetIndex: number) => {
      onChange?.(sheetIndex)
    },
    [onChange],
  )

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => {
      if (backdropComponent) {
        return backdropComponent(props)
      }
      return (
        <BottomSheetBackdrop
          {...props}
          opacity={backdropOpacity}
          appearsOnIndex={backdropAppearsOnIndex}
          disappearsOnIndex={backdropDisappearsOnIndex}
          enableTouchThrough={backdropEnableTouchThrough}
          pressBehavior={backdropPressBehavior}
        />
      )
    },
    [
      backdropComponent,
      backdropOpacity,
      backdropAppearsOnIndex,
      backdropDisappearsOnIndex,
      backdropEnableTouchThrough,
      backdropPressBehavior,
    ],
  )

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={memoizedSnapPoints}
      enableDynamicSizing={enableDynamicSizing}
      onChange={handleSheetChanges}
      onDismiss={onDismiss}
      enablePanDownToClose={enablePanDownToClose}
      backgroundStyle={
        backgroundColor ? { backgroundColor } : sheetStyles.background
      }
      handleIndicatorStyle={sheetStyles.handleIndicator}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={sheetStyles.contentContainer}>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  )
}
