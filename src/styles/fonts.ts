import { Platform } from "react-native"

// Cross-platform font family + weights
export const Fonts = Platform.select({
  ios: {
    sans: {
      regular: "System", // 400
      medium: "System", // 500-ish
      semibold: "System", // 600-ish
      bold: "System", // 700
    },
    serif: {
      regular: "Times New Roman",
      medium: "Times New Roman",
      semibold: "Times New Roman",
      bold: "Times New Roman",
    },
    mono: {
      regular: "Menlo",
      medium: "Menlo",
      semibold: "Menlo",
      bold: "Menlo-Bold",
    },
  },
  default: {
    sans: {
      regular: "sans-serif",
      medium: "sans-serif-medium", // Android supports this variant
      semibold: "sans-serif-medium",
      bold: "sans-serif-bold",
    },
    serif: {
      regular: "serif",
      medium: "serif",
      semibold: "serif",
      bold: "serif",
    },
    mono: {
      regular: "monospace",
      medium: "monospace",
      semibold: "monospace",
      bold: "monospace",
    },
  },
  web: {
    sans: {
      regular:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      medium:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      semibold:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      bold: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    },
    serif: {
      regular: "Georgia, 'Times New Roman', serif",
      medium: "Georgia, 'Times New Roman', serif",
      semibold: "Georgia, 'Times New Roman', serif",
      bold: "Georgia, 'Times New Roman', serif",
    },
    mono: {
      regular:
        "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      medium:
        "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      semibold:
        "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      bold: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
  },
})
