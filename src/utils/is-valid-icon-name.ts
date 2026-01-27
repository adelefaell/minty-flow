import type { IconSymbolName } from "~/components/ui/icon-symbol"
import { VALID_ICON_NAMES } from "~/components/ui/icon-symbol"

/**
 * Type guard to check if a string is a valid IconSymbolName
 *
 * @param icon - The string to check
 * @returns True if the string is a valid IconSymbolName
 *
 * @example
 * ```ts
 * isValidIconName("cog") // Returns true if "cog" is in VALID_ICON_NAMES
 * isValidIconName("invalid-icon") // Returns false
 * ```
 */
export const isValidIconName = (icon: string): icon is IconSymbolName => {
  return VALID_ICON_NAMES.includes(icon as IconSymbolName)
}
