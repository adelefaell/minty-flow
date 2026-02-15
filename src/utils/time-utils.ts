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

export const WEEK_STARTS_ON = 1 // Monday
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export type DateRangePresetId =
  | "last30"
  | "thisWeek"
  | "thisMonth"
  | "thisYear"
  | "allTime"
  | "byMonth"
  | "byYear"
  | "custom"

type DateInput = Date | string | undefined | null

/** All date-fns format pattern keys used in the app — single source of truth */
const FORMAT = {
  DAY_NAME: "EEEE",
  ORDINAL_DAY: "do",
  MONTH_DAY: "MMMM d",
  DATE_KEY: "yyyy-MM-dd",
  DATE_TITLE: "EEEE, MMM d",
  HOUR_KEY: "yyyy-MM-dd-HH",
  HOUR_TITLE: "MMM d, yyyy h a",
  WEEK_KEY: "RRRR-'W'II",
  WEEK_TITLE_SHORT: "MMM d",
  MONTH_KEY: "yyyy-MM",
  MONTH_TITLE: "MMMM yyyy",
  YEAR: "yyyy",
  FRIENDLY_FALLBACK: "MM/dd/yyyy",
  CREATED_AT: "MMM d yyyy hh:mm a",
  READABLE_TIME: "p",
} as const

function toDate(date: DateInput): Date | null {
  if (date == null) return null
  const dateObj = date instanceof Date ? date : new Date(date)
  return isValid(dateObj) ? dateObj : null
}

function formatWithPattern(date: DateInput, pattern: string): string {
  const dateObj = toDate(date)
  if (!dateObj) return ""
  return format(dateObj, pattern)
}

/**
 * Formats a date as relative time (e.g., "2 minutes ago", "in 3 hours").
 *
 * @param date - Date to format (Date, string, or null/undefined)
 * @returns Formatted relative time string or "Unknown" if invalid
 */
export function formatRelativeTime(date: DateInput): string {
  const dateObj = toDate(date)
  if (!dateObj) return "Unknown"
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Formats an expiry date with days until expiration.
 *
 * @param date - Expiry date to format
 * @returns Formatted expiry string (e.g., "Expires in 5 days", "Expired")
 */
export function formatExpiryDate(date: DateInput): string {
  const dateObj = toDate(date)
  if (!dateObj) return "Unknown"
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
export function formatReadableTime(date: DateInput): string {
  const dateObj = toDate(date)
  if (!dateObj) return "Unknown"
  return format(dateObj, FORMAT.READABLE_TIME)
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
export function formatFriendlyDate(date: DateInput): string {
  const dateObj = toDate(date)
  if (!dateObj) return "Unknown"

  if (isToday(dateObj)) return "Today"
  if (isYesterday(dateObj)) return "Yesterday"
  if (isTomorrow(dateObj)) return "Tomorrow"

  const now = new Date()

  if (isThisWeek(dateObj, { weekStartsOn: 1 })) {
    return `This ${format(dateObj, FORMAT.DAY_NAME)}`
  }

  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
  if (isSameWeek(dateObj, lastWeekStart, { weekStartsOn: 1 })) {
    return `Last ${format(dateObj, FORMAT.DAY_NAME)}`
  }

  const nextWeekStart = startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 })
  if (isSameWeek(dateObj, nextWeekStart, { weekStartsOn: 1 })) {
    return `Next ${format(dateObj, FORMAT.DAY_NAME)}`
  }

  return format(dateObj, FORMAT.FRIENDLY_FALLBACK)
}

/**
 * Formats a date as "MM/dd/yyyy".
 *
 * @param date - Date to format
 * @returns Formatted date string or "Unknown" if invalid
 */
export function formatDate(date: DateInput): string {
  const dateObj = toDate(date)
  if (!dateObj) return "Unknown"
  return format(dateObj, FORMAT.FRIENDLY_FALLBACK)
}

/**
 * Formats a date as "yyyy-MM-dd" for stable grouping/sorting keys.
 *
 * @param date - Date to format
 * @returns Formatted date string or empty string if invalid
 */
export function formatDateKey(date: DateInput): string {
  return formatWithPattern(date, FORMAT.DATE_KEY)
}

/** Day name (e.g. "Wednesday") — for recurrence labels. */
export function formatDayName(date: DateInput): string {
  return formatWithPattern(date, FORMAT.DAY_NAME)
}

/** Ordinal day (e.g. "15th") — for recurrence labels. */
export function formatOrdinalDay(date: DateInput): string {
  return formatWithPattern(date, FORMAT.ORDINAL_DAY)
}

/** Month and day (e.g. "January 15") — for recurrence labels. */
export function formatMonthDay(date: DateInput): string {
  return formatWithPattern(date, FORMAT.MONTH_DAY)
}

/** Hour-grouping key (e.g. "2025-02-15-14"). */
export function formatHourKey(date: DateInput): string {
  return formatWithPattern(date, FORMAT.HOUR_KEY)
}

/** Hour-grouping title (e.g. "Feb 15, 2025 2 PM"). */
export function formatHourTitle(date: DateInput): string {
  return formatWithPattern(date, FORMAT.HOUR_TITLE)
}

/** ISO week key (e.g. "2025-W07"). Pass week start date. */
export function formatWeekKey(weekStart: DateInput): string {
  return formatWithPattern(weekStart, FORMAT.WEEK_KEY)
}

/** Week title (e.g. "Week of Feb 15"). Pass week start date. */
export function formatWeekTitle(weekStart: DateInput): string {
  return `Week of ${formatWithPattern(weekStart, FORMAT.WEEK_TITLE_SHORT)}`
}

/** Month-grouping key (e.g. "2025-02"). */
export function formatMonthKey(date: DateInput): string {
  return formatWithPattern(date, FORMAT.MONTH_KEY)
}

/** Month-grouping title (e.g. "February 2025"). */
export function formatMonthTitle(date: DateInput): string {
  return formatWithPattern(date, FORMAT.MONTH_TITLE)
}

/** Year key/title (e.g. "2025"). */
export function formatYear(date: DateInput): string {
  return formatWithPattern(date, FORMAT.YEAR)
}

/**
 * Section header title for a transaction date: "Today", "Yesterday", "This Wednesday", or "EEEE, MMM d".
 *
 * @param date - Date to format
 * @returns Friendly section title or "Unknown" if invalid
 */
export function formatSectionDateTitle(date: DateInput): string {
  const dateObj = toDate(date)
  if (!dateObj) return "Unknown"
  const today = new Date()
  const dateKey = format(dateObj, FORMAT.DATE_KEY)
  const todayKey = format(today, FORMAT.DATE_KEY)
  if (dateKey === todayKey) return "Today"
  return format(dateObj, FORMAT.DATE_TITLE)
}

/**
 * Formats a creation date with time (e.g., "Nov 7 2025 09:10 AM").
 *
 * @param date - Date to format
 * @returns Formatted date with time or "Unknown" if invalid
 */
export function formatCreatedAt(date: DateInput): string {
  const dateObj = toDate(date)
  if (!dateObj) return "Unknown"
  return format(dateObj, FORMAT.CREATED_AT)
}

/**
 * Formats a loan date consistently across the app.
 *
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string or empty string if invalid
 */
export function formatLoanDate(
  date: DateInput,
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateObj = toDate(date)
  if (!dateObj) return ""

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }

  return new Intl.DateTimeFormat("en-US", defaultOptions).format(dateObj)
}

/**
 * Calculates days until a due date.
 *
 * @param dueDate - Due date as Date or string
 * @returns Object with days until due, isOverdue flag, and isDueToday flag, or null if invalid
 */
export function calculateDaysUntilDue(
  dueDate: Date | string | null | undefined,
): { days: number; isOverdue: boolean; isDueToday: boolean } | null {
  const due = toDate(dueDate)
  if (!due) return null

  const now = new Date()
  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const diffTime = dueMidnight.getTime() - nowMidnight.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return {
    days: diffDays,
    isOverdue: diffDays < 0,
    isDueToday: diffDays === 0,
  }
}
