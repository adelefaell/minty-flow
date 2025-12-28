import { create } from "zustand"

export type ToastType = "success" | "error" | "info" | "warn" | "default"

export type ToastPosition = "top" | "bottom"

export interface ToastOptions {
  type?: ToastType
  title?: string
  description?: string
  position?: ToastPosition
  visibilityTime?: number
  autoHide?: boolean
  showProgressBar?: boolean
  showCloseIcon?: boolean
  onShow?: () => void
  onHide?: () => void
  onPress?: () => void
}

export interface Toast extends ToastOptions {
  id: string
  type: ToastType
  title?: string
  description?: string
  position: ToastPosition
  visibilityTime: number
  autoHide: boolean
  showProgressBar: boolean
  showCloseIcon: boolean
}

interface ToastStore {
  toasts: Toast[]
  show: (options: ToastOptions) => string
  hide: (id?: string) => void
  hideAll: () => void
}

/**
 * Zustand store for managing toast notifications.
 *
 * @example
 * ```tsx
 * const { show, hide } = useToastStore()
 *
 * // Show a success toast
 * show({ type: 'success', title: 'Success!', description: 'Operation completed' })
 *
 * // Show an error toast
 * show({ type: 'error', title: 'Error', description: 'Something went wrong' })
 * ```
 */
export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  show: (options) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const toast: Toast = {
      id,
      type: options.type ?? "default",
      title: options.title,
      description: options.description,
      position: options.position ?? "top",
      visibilityTime: options.visibilityTime ?? 3000,
      autoHide: options.autoHide ?? true,
      showProgressBar: options.showProgressBar ?? false,
      showCloseIcon: options.showCloseIcon ?? true,
      onShow: options.onShow,
      onHide: options.onHide,
      onPress: options.onPress,
    }

    set((state) => ({
      toasts: [...state.toasts, toast],
    }))

    options.onShow?.()

    // Note: Auto-hide is handled by the ToastItem component
    // to ensure proper exit animations. The component will call hide(id)
    // after the animation completes.
    // if (toast.autoHide) {
    //   setTimeout(() => {
    //     set((state) => ({
    //       toasts: state.toasts.filter((t) => t.id !== id),
    //     }))
    //     options.onHide?.()
    //   }, toast.visibilityTime)
    // }

    return id
  },

  hide: (id) => {
    set((state) => {
      const toast = state.toasts.find((t) => t.id === id)
      toast?.onHide?.()
      return {
        toasts: state.toasts.filter((t) => t.id !== id),
      }
    })
  },

  hideAll: () => {
    set((state) => {
      for (const toast of state.toasts) {
        toast.onHide?.()
      }
      return { toasts: [] }
    })
  },
}))
