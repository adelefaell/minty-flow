import {
  addWeeks,
  differenceInDays,
  format,
  formatDistanceToNow,
  isSameWeek,
  isThisWeek,
  isToday,
  isTomorrow,
  isValid,
  isYesterday,
  startOfWeek,
  subWeeks,
} from "date-fns"
import { useCallback } from "react"

/**
 * Custom hook providing time and date formatting utilities.
 *
 * @returns Object with various date/time formatting functions
 *
 * @example
 * ```ts
 * const { formatRelativeTime, formatFriendlyDate } = useTimeUtils()
 * formatRelativeTime(new Date()) // "in 2 minutes"
 * formatFriendlyDate(new Date()) // "Today"
 * ```
 */
export const useTimeUtils = () => {
  /**
   * Formats a date as relative time (e.g., "2 minutes ago", "in 3 hours").
   *
   * @param date - Date to format (Date, string, or null/undefined)
   * @returns Formatted relative time string or "Unknown" if invalid
   */
  const formatRelativeTime = (
    date: Date | string | undefined | null,
  ): string => {
    if (!date) return "Unknown"
    const dateObj = date instanceof Date ? date : new Date(date)
    if (!isValid(dateObj)) return "Unknown"
    return formatDistanceToNow(dateObj, { addSuffix: true })
  }

  /**
   * Formats an expiry date with days until expiration.
   *
   * @param date - Expiry date to format
   * @returns Formatted expiry string (e.g., "Expires in 5 days", "Expired")
   */
  const formatExpiryDate = (date: Date | string | undefined | null): string => {
    if (!date) return "Unknown"
    const dateObj = date instanceof Date ? date : new Date(date)
    if (!isValid(dateObj)) return "Unknown"
    const daysDiff = differenceInDays(dateObj, new Date())
    if (daysDiff < 0) return "Expired"
    if (daysDiff === 0) return "Expires today"
    if (daysDiff === 1) return "Expires tomorrow"
    return `Expires in ${daysDiff} days`
  }

  /**
   * Formats time in a human-readable way (e.g., "3:42 PM").
   *
   * @param date - Date to format
   * @returns Formatted time string or "Unknown" if invalid
   */
  const formatReadableTime = (
    date: Date | string | undefined | null,
  ): string => {
    if (!date) return "Unknown"
    const dateObj = date instanceof Date ? date : new Date(date)
    if (!isValid(dateObj)) return "Unknown"
    return format(dateObj, "p") // "p" → localized time format (e.g. 3:42 PM)
  }

  /**
   * Formats a date in a friendly, human-readable format.
   *
   * @remarks
   * Returns:
   * - "Today", "Yesterday", "Tomorrow" for immediate days
   * - "This Wednesday", "Last Friday", "Next Tuesday" for week-based dates
   * - "MM/dd/yyyy" for other dates
   *
   * @param date - Date to format
   * @returns Friendly date string or "Unknown" if invalid
   */
  const formatFriendlyDate = (
    date: Date | string | null | undefined,
  ): string => {
    if (!date) return "Unknown"

    const dateObj = typeof date === "string" ? new Date(date) : date
    if (!isValid(dateObj)) return "Unknown"

    // --- Immediate days ---
    if (isToday(dateObj)) return "Today"
    if (isYesterday(dateObj)) return "Yesterday"
    if (isTomorrow(dateObj)) return "Tomorrow"

    // --- Week-based classification ---
    const now = new Date()

    // Current week (Mon–Sun)
    if (isThisWeek(dateObj, { weekStartsOn: 1 })) {
      return `This ${format(dateObj, "EEEE")}` // e.g. "This Wednesday"
    }

    // Last week
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
    if (isSameWeek(dateObj, lastWeekStart, { weekStartsOn: 1 })) {
      return `Last ${format(dateObj, "EEEE")}` // e.g. "Last Friday"
    }

    // Next week
    const nextWeekStart = startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 })
    if (isSameWeek(dateObj, nextWeekStart, { weekStartsOn: 1 })) {
      return `Next ${format(dateObj, "EEEE")}` // e.g. "Next Tuesday"
    }

    // --- Fallback ---
    return format(dateObj, "MM/dd/yyyy")
  }

  /**
   * Formats a date as "MM/dd/yyyy".
   *
   * @param date - Date to format
   * @returns Formatted date string or "Unknown" if invalid
   */
  const formatDate = (date: Date | string | undefined | null): string => {
    if (!date) return "Unknown"
    const dateObj = date instanceof Date ? date : new Date(date)
    if (!isValid(dateObj)) return "Unknown"
    return format(dateObj, "MM/dd/yyyy")
  }

  /**
   * Formats a date as "yyyy-MM-dd" for stable grouping/sorting keys.
   *
   * @param date - Date to format
   * @returns Formatted date string or empty string if invalid
   */
  const formatDateKey = useCallback(
    (date: Date | string | undefined | null): string => {
      if (!date) return ""
      const dateObj = date instanceof Date ? date : new Date(date)
      if (!isValid(dateObj)) return ""
      return format(dateObj, "yyyy-MM-dd")
    },
    [],
  )

  /**
   * Section header title for a transaction date: "Today", "Yesterday", "This Wednesday", or "EEEE, MMM d".
   *
   * @param date - Date to format
   * @returns Friendly section title or "Unknown" if invalid
   */
  const formatSectionDateTitle = useCallback(
    (date: Date | string | undefined | null): string => {
      if (!date) return "Unknown"
      const dateObj = date instanceof Date ? date : new Date(date)
      if (!isValid(dateObj)) return "Unknown"
      const today = new Date()
      const dateKey = format(dateObj, "yyyy-MM-dd")
      const todayKey = format(today, "yyyy-MM-dd")
      if (dateKey === todayKey) return "Today"
      return format(dateObj, "EEEE, MMM d")
    },
    [],
  )

  /**
   * Formats a creation date with time (e.g., "Nov 7 2025 09:10 AM").
   *
   * @param date - Date to format
   * @returns Formatted date with time or "Unknown" if invalid
   */
  const formatCreatedAt = (date: Date | string | undefined | null): string => {
    if (!date) return "Unknown"
    const dateObj = date instanceof Date ? date : new Date(date)
    if (!isValid(dateObj)) return "Unknown"
    return format(dateObj, "MMM d yyyy hh:mm a") // e.g. "Nov 7 2025 09:10 AM"
  }

  /**
   * Formats a loan date consistently across the app.
   *
   * @param date - Date to format
   * @param options - Intl.DateTimeFormatOptions for customization
   * @returns Formatted date string or empty string if invalid
   */
  const formatLoanDate = useCallback(
    (
      date: Date | string | null | undefined,
      options?: Intl.DateTimeFormatOptions,
    ): string => {
      if (!date) return ""

      const dateObj = typeof date === "string" ? new Date(date) : date
      if (!isValid(dateObj)) return ""

      const defaultOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        ...options,
      }

      return new Intl.DateTimeFormat("en-US", defaultOptions).format(dateObj)
    },
    [],
  )

  /**
   * Calculates days until a due date.
   *
   * @param dueDate - Due date as Date or string
   * @returns Object with days until due, isOverdue flag, and isDueToday flag, or null if invalid
   */
  const calculateDaysUntilDue = useCallback(
    (dueDate: Date | string | null | undefined) => {
      if (!dueDate) return null

      const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate
      if (!isValid(due)) return null

      const now = new Date()

      // Reset time to midnight for accurate day calculation
      const dueMidnight = new Date(
        due.getFullYear(),
        due.getMonth(),
        due.getDate(),
      )
      const nowMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      )

      const diffTime = dueMidnight.getTime() - nowMidnight.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return {
        days: diffDays,
        isOverdue: diffDays < 0,
        isDueToday: diffDays === 0,
      }
    },
    [],
  )

  return {
    formatRelativeTime,
    formatExpiryDate,
    formatReadableTime,
    formatFriendlyDate,
    formatDate,
    formatDateKey,
    formatSectionDateTitle,
    formatCreatedAt,
    formatLoanDate,
    calculateDaysUntilDue,
  }
}
