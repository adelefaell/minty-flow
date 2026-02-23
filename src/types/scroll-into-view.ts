import type { RefObject } from "react"
import type { ScrollView, View } from "react-native"

/** Optional: when provided by the parent, the inline component will scroll into view on expand. When omitted, behavior is unchanged (no scroll). */
export interface ScrollIntoViewProps {
  scrollRef?: RefObject<ScrollView | null>
  scrollContainerRef?: RefObject<View | null>
  scrollYRef?: RefObject<number>
}
