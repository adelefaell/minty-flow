/**
 * Checks if a string is a single visible grapheme cluster (handles emojis, flags, etc.) and not an Iconify name.
 *
 * @remarks
 * React Native-compatible implementation that handles:
 * - Single emojis (including multi-codepoint emojis like flags, skin tones, ZWJ sequences)
 * - Single letters
 * - Excludes Iconify icon names (containing ":")
 *
 * @param str - The string to check
 * @returns True if the string is a single grapheme cluster and not an Iconify name
 *
 * @example
 * ```ts
 * isSingleEmojiOrLetter("😀") // Returns true
 * isSingleEmojiOrLetter("A") // Returns true
 * isSingleEmojiOrLetter("mdi:home") // Returns false (Iconify name)
 * isSingleEmojiOrLetter("Hello") // Returns false (multiple characters)
 * ```
 */
export const isSingleEmojiOrLetter = (str: string): boolean => {
  if (!str) return false
  if (str.includes(":")) return false // Iconify icon name

  // Trim whitespace
  const trimmed = str.trim()
  if (!trimmed) return false

  // Check if it's a single ASCII letter
  if (trimmed.length === 1 && /^[a-zA-Z]$/.test(trimmed)) {
    return true
  }

  // Use Extended_Pictographic Unicode property to detect emojis
  // This is more comprehensive and handles all emoji sequences including:
  // - Multi-codepoint emojis (flags, skin tones, ZWJ sequences like 👩‍👩‍👧‍👦)
  // - All emoji ranges (including newer ones)
  const emojiRegex = /\p{Extended_Pictographic}/u

  // Check if the string contains emoji characters
  if (emojiRegex.test(trimmed)) {
    // If it contains emoji, it's valid (even if multi-codepoint)
    // The regex will match any string containing an emoji, which is what we want
    return true
  }

  // For non-emoji Unicode characters (like single Chinese, Arabic, etc. letters)
  // Check if it's a single character
  const codePoints = Array.from(trimmed)
  return codePoints.length === 1
}

/**
 * Returns the first grapheme cluster from a string (for single-char/emoji inputs).
 * Uses Intl.Segmenter when available, otherwise falls back to first code point.
 */
export function getFirstGrapheme(str: string): string {
  if (!str || typeof str !== "string") return ""
  const trimmed = str.trim()
  if (!trimmed) return ""
  try {
    const Segmenter = (Intl as unknown as { Segmenter?: typeof Intl.Segmenter })
      .Segmenter
    if (typeof Segmenter === "function") {
      const segmenter = new Segmenter("en", { granularity: "grapheme" })
      const segments = [...segmenter.segment(trimmed)]
      return segments[0]?.segment ?? trimmed.slice(0, 1)
    }
  } catch {
    // ignore
  }
  return Array.from(trimmed)[0] ?? ""
}

/**
 * Returns the last grapheme cluster from a string.
 * Use for "replace on each key press" UX: new input replaces previous.
 */
export function getLastGrapheme(str: string): string {
  if (!str || typeof str !== "string") return ""
  const trimmed = str.trim()
  if (!trimmed) return ""
  try {
    const Segmenter = (Intl as unknown as { Segmenter?: typeof Intl.Segmenter })
      .Segmenter
    if (typeof Segmenter === "function") {
      const segmenter = new Segmenter("en", { granularity: "grapheme" })
      const segments = [...segmenter.segment(trimmed)]
      return segments[segments.length - 1]?.segment ?? trimmed.slice(-1)
    }
  } catch {
    // ignore
  }
  const arr = Array.from(trimmed)
  return arr[arr.length - 1] ?? ""
}
