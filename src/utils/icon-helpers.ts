/**
 * Icon helper utilities for validating and working with MaterialCommunityIcons
 */

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"

/**
 * Check if an icon name exists in MaterialCommunityIcons
 */
export function isValidIconName(iconName: string): boolean {
  return iconName in MaterialCommunityIcons.glyphMap
}

/**
 * Get a fallback icon name if the provided one is invalid
 */
export function getIconNameOrFallback(
  iconName?: string | null,
  fallback: string = "help-circle-outline",
): string {
  if (!iconName) return fallback
  return isValidIconName(iconName) ? iconName : fallback
}

/**
 * Check if a string is likely an emoji
 */
export function isEmoji(str: string): boolean {
  // Basic emoji detection - checks for common emoji ranges
  const emojiRegex = /[\p{Emoji}]/u
  return emojiRegex.test(str) && str.length <= 4
}

/**
 * Check if a string is a single character (letter/number)
 */
export function isSingleCharacter(str: string): boolean {
  return str.length === 1 && !isEmoji(str)
}

/**
 * Determine the icon type from a string value
 */
export function getIconType(
  icon?: string | null,
): "icon" | "emoji" | "character" | "unknown" {
  if (!icon) return "unknown"

  // Check if it's a valid MaterialCommunityIcon name
  if (isValidIconName(icon)) return "icon"

  // Check if it's an emoji
  if (isEmoji(icon)) return "emoji"

  // Check if it's a single character
  if (isSingleCharacter(icon)) return "character"

  return "unknown"
}

/**
 * Get all available MaterialCommunityIcons names
 * Warning: This returns 6000+ icon names, use sparingly
 */
export function getAllMaterialIconNames(): string[] {
  return Object.keys(MaterialCommunityIcons.glyphMap)
}

/**
 * Search MaterialCommunityIcons by name pattern
 * More efficient than getting all names
 */
export function searchMaterialIcons(pattern: string, limit = 50): string[] {
  const searchTerm = pattern.toLowerCase()
  const results: string[] = []

  for (const iconName in MaterialCommunityIcons.glyphMap) {
    if (iconName.toLowerCase().includes(searchTerm)) {
      results.push(iconName)
      if (results.length >= limit) break
    }
  }

  return results
}

/**
 * Get icon name with sanitization
 * Removes special characters and ensures valid format
 */
export function sanitizeIconName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

/**
 * Extract keywords from icon name
 * Useful for building search indices
 */
export function extractKeywordsFromIconName(iconName: string): string[] {
  // Split by hyphen and filter out common words
  const commonWords = new Set(["outline", "variant", "alt", "off", "on"])
  const parts = iconName.toLowerCase().split("-")

  return parts.filter((part) => part.length > 2 && !commonWords.has(part))
}
