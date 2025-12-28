import { type ToastOptions, useToastStore } from "~/stores/toast.store"
import { useToastAppearanceStore } from "~/stores/toast-appearance.store"

type ToastOptionsWithoutType = Omit<ToastOptions, "type">

/**
 * Toast API for showing notifications.
 *
 * This API provides a simple interface for displaying toast notifications
 * throughout the application. It's similar to toastify-react-native but
 * implemented directly in the codebase.
 *
 * Global defaults for position, progress bar, and close icon are applied
 * from the toast appearance store unless explicitly overridden.
 *
 * @example
 * ```tsx
 * import { Toast } from '~/utils/toast'
 *
 * // Show a success toast (uses global defaults)
 * Toast.success({ title: 'Success!', description: 'Operation completed' })
 *
 * // Show an error toast with custom position
 * Toast.error({ title: 'Error', description: 'Something went wrong', position: 'bottom' })
 *
 * // Show a custom toast
 * Toast.show({
 *   type: 'info',
 *   title: 'Info',
 *   description: 'This is an info message',
 *   position: 'bottom',
 *   visibilityTime: 5000,
 * })
 * ```
 */
class ToastAPI {
  private getStore() {
    // We need to access the store directly since this is a utility class
    // In React components, use useToastStore hook instead
    return useToastStore.getState()
  }

  private getAppearanceDefaults() {
    // Get global default appearance settings
    return useToastAppearanceStore.getState()
  }

  /**
   * Apply global defaults to toast options.
   * Explicit options override the defaults.
   */
  private applyDefaults(options: ToastOptions): ToastOptions {
    const defaults = this.getAppearanceDefaults()
    return {
      position: defaults.position,
      showProgressBar: defaults.showProgressBar,
      showCloseIcon: defaults.showCloseIcon,
      ...options, // Explicit options override defaults
    }
  }

  /**
   * Show a toast notification with custom options.
   */
  show(options: ToastOptions): string {
    const optionsWithDefaults = this.applyDefaults(options)
    return this.getStore().show(optionsWithDefaults)
  }

  /**
   * Show a success toast.
   */
  success(options: ToastOptionsWithoutType): string {
    const optionsWithDefaults = this.applyDefaults({
      type: "success",
      ...options,
    })
    return this.getStore().show(optionsWithDefaults)
  }

  /**
   * Show an error toast.
   */
  error(options: ToastOptionsWithoutType): string {
    const optionsWithDefaults = this.applyDefaults({
      type: "error",
      ...options,
    })
    return this.getStore().show(optionsWithDefaults)
  }

  /**
   * Show an info toast.
   */
  info(options: ToastOptionsWithoutType): string {
    const optionsWithDefaults = this.applyDefaults({
      type: "info",
      ...options,
    })
    return this.getStore().show(optionsWithDefaults)
  }

  /**
   * Show a warning toast.
   */
  warn(options: Omit<ToastOptions, "type">): string {
    const optionsWithDefaults = this.applyDefaults({
      type: "warn",
      ...options,
    })
    return this.getStore().show(optionsWithDefaults)
  }

  /**
   * Hide a specific toast by ID.
   */
  hide(id?: string): void {
    this.getStore().hide(id)
  }

  /**
   * Hide all toasts.
   */
  hideAll(): void {
    this.getStore().hideAll()
  }
}

export const Toast = new ToastAPI()
