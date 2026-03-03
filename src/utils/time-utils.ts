import {
  addWeeks,
  type Day,
  differenceInCalendarDays,
  differenceInDays,
  format,
  formatDistanceToNow,
  isSameWeek,
  isThisWeek,
  isToday,
  isTomorrow,
  isValid,
  isYesterday,
  startOfDay,
  startOfWeek,
  subWeeks,
} from "date-fns"
import { ar, enUS } from "date-fns/locale"

import i18n from "~/i18n/config"
import { LangCodeEnum, type LangCodeType } from "~/i18n/language.constants"

// import { useLanguageStore } from "~/stores/language.store"

const { t } = i18n

export const DATE_FNS_LOCALES = {
  [LangCodeEnum.EN]: enUS,
  [LangCodeEnum.AR]: ar,
} as const

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

/** * Using localized date-fns tokens:
 * P = localized date (05/29/1453)
 * PP = localized medium date (May 29, 1453)
 * p = localized time (12:00 AM)
 * PPpp = localized date and time
 */
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
  SHORT_MONTH_DAY: "MMM d",
  MONTH_KEY: "yyyy-MM",
  MONTH_TITLE: "MMMM yyyy",
  YEAR: "yyyy",
  FRIENDLY_FALLBACK: "P",
  CREATED_AT: "PPpp",
  READABLE_TIME: "p",
  LOAN_DATE: "PP",
} as const

// Helper to get the current locale object from the store
function getCurrentLocale() {
  // const code = useLanguageStore.getState().languageCode
  const code = i18n.language as LangCodeType
  return (code && DATE_FNS_LOCALES[code]) || enUS
}

function toDate(date: DateInput): Date | null {
  if (date == null) return null
  const dateObj = date instanceof Date ? date : new Date(date)
  return isValid(dateObj) ? dateObj : null
}

function formatWithPattern(date: DateInput, pattern: string): string {
  const dateObj = toDate(date)
  if (!dateObj) return ""

  // Pass the locale here
  return format(dateObj, pattern, { locale: getCurrentLocale() })
}

/** RELATIVE TIME: "2 minutes ago" */
export function formatRelativeTime(date: DateInput): string {
  const dateObj = toDate(date)
  if (!dateObj) return t("dates.unknown")
  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: getCurrentLocale(),
  })
}

/** EXPIRY: "Expires in 5 days" */
export function formatExpiryDate(date: DateInput): string {
  const dateObj = toDate(date)
  if (!dateObj) return t("dates.unknown")

  // Normalize to start of day for accurate day counting
  const daysDiff = differenceInDays(startOfDay(dateObj), startOfDay(new Date()))

  if (daysDiff < 0) return t("dates.expired")
  if (daysDiff === 0) return t("dates.expiresToday")
  if (daysDiff === 1) return t("dates.expiresTomorrow")
  return t("dates.expiresInDays", { count: daysDiff })
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
  return format(dateObj, FORMAT.READABLE_TIME, { locale: getCurrentLocale() })
}

/** FRIENDLY: "Today", "Last Wednesday", etc. */
export function formatFriendlyDate(date: DateInput): string {
  const dateObj = toDate(date)
  if (!dateObj) return t("dates.unknown")

  const locale = getCurrentLocale()
  if (isToday(dateObj)) return t("dates.today")
  if (isYesterday(dateObj)) return t("dates.yesterday")
  if (isTomorrow(dateObj)) return t("dates.tomorrow")

  const now = new Date()
  const options = { weekStartsOn: WEEK_STARTS_ON as Day, locale }

  if (isThisWeek(dateObj, options)) {
    return t("dates.thisDay", {
      day: format(dateObj, FORMAT.DAY_NAME, { locale }),
    })
  }

  const lastWeekStart = startOfWeek(subWeeks(now, 1), options)
  if (isSameWeek(dateObj, lastWeekStart, options)) {
    return t("dates.lastDay", {
      day: format(dateObj, FORMAT.DAY_NAME, { locale }),
    })
  }

  const nextWeekStart = startOfWeek(addWeeks(now, 1), options)
  if (isSameWeek(dateObj, nextWeekStart, options)) {
    return t("dates.nextDay", {
      day: format(dateObj, FORMAT.DAY_NAME, { locale }),
    })
  }

  return format(dateObj, FORMAT.FRIENDLY_FALLBACK, { locale })
}

/**
 * Formats a date as "MM/dd/yyyy".
 *
 * @param date - Date to format
 * @returns Formatted date string or "Unknown" if invalid
 */
export function formatDate(date: DateInput): string {
  const dateObj = toDate(date)
  if (!dateObj) return t("dates.unknown")
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

/** WEEK TITLE: "Week of Feb 15" */
export function formatWeekTitle(weekStart: DateInput): string {
  const formatted = formatWithPattern(weekStart, FORMAT.WEEK_TITLE_SHORT)
  return formatted ? t("dates.weekOf", { date: formatted }) : ""
}

/** Short month and day (e.g. "Feb 15") — for range labels and compact headers. */
export function formatShortMonthDay(date: DateInput): string {
  return formatWithPattern(date, FORMAT.SHORT_MONTH_DAY)
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

export function formatSectionDateTitle(date: DateInput): string {
  const dateObj = toDate(date)
  if (!dateObj) return t("dates.unknown")
  if (isToday(dateObj)) return t("dates.today")
  return formatWithPattern(dateObj, FORMAT.DATE_TITLE)
}

/**
 * Formats a creation date with time (e.g., "Nov 7 2025 09:10 AM").
 *
 * @param date - Date to format
 * @returns Formatted date with time or "Unknown" if invalid
 */
export function formatCreatedAt(date: DateInput): string {
  const dateObj = toDate(date)
  if (!dateObj) return t("dates.unknown")
  return formatWithPattern(date, FORMAT.CREATED_AT)
}

/** LOAN DATE: Localized medium date (Feb 15, 2024) */
export function formatLoanDate(date: DateInput): string {
  return formatWithPattern(date, FORMAT.LOAN_DATE)
}

/**
 * Calculates days until a due date.
 *
 * @param dueDate - Due date as Date or string
 * @returns Object with days until due, isOverdue flag, and isDueToday flag, or null if invalid
 */
export function calculateDaysUntilDue(
  dueDate: Date | string | null | undefined,
) {
  const due = toDate(dueDate)
  if (!due) return null

  const days = differenceInCalendarDays(startOfDay(due), startOfDay(new Date()))

  return {
    days,
    isOverdue: days < 0,
    isDueToday: days === 0,
  }
}
