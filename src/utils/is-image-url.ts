/**
 * Checks if a string is an image URL or URI
 *
 * @param url - The string to check
 * @returns True if the string appears to be an image URL/URI
 *
 * @example
 * ```ts
 * isImageUrl("https://example.com/image.jpg") // Returns true
 * isImageUrl("file:///path/to/image.png") // Returns true
 * isImageUrl("https://imgur.com/abc123") // Returns true (imgur hostname)
 * isImageUrl("https://example.com/page") // Returns false (no image extension)
 * ```
 */
export const isImageUrl = (url: string): boolean => {
  if (!url) return false

  // Check if it's a local file URI
  if (url.startsWith("file://")) {
    return true
  }

  // Check if it's a valid image URL by extension or known image hostnames
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname.toLowerCase()
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]

    // Check if URL has image extension
    const hasImageExtension = imageExtensions.some((ext) =>
      pathname.endsWith(ext),
    )

    // Check if it's from known image hosting services
    const isKnownImageHost =
      urlObj.hostname.includes("imgur") ||
      urlObj.hostname.includes("unsplash") ||
      urlObj.hostname.includes("pexels")

    return hasImageExtension || isKnownImageHost
  } catch {
    // If it's not a valid URL, check if it looks like a local file path with image extension
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]
    return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext))
  }
}
