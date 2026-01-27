import * as Localization from "expo-localization"

import { currencyRegistryService } from "~/services/currency-registry"

const DEFAULT_LOCALE = "en-US"

// ------------------------
// Calculator Configuration
// ------------------------
/**
 * Configuration constants for calculator display limits.
 */
export const CALCULATOR_CONFIG = {
  MAX_DIGITS: 14,
  MAX_DECIMALS: 2,
  DEFAULT_DISPLAY: "0",
} as const

/**
 * Gets the default locale for number formatting.
 *
 * @returns The browser's locale if available, otherwise "en-US"
 *
 * @remarks
 * Uses navigator.language in browser environments, falls back to DEFAULT_LOCALE on server.
 */
export const getDefaultLocale = (): string => {
  return Localization.getLocales()[0].languageTag ?? DEFAULT_LOCALE
}

const ZERO_WIDTH_SPACE = ""
// const ZERO_WIDTH_SPACE = "\u200B"

/**
 * Gets the currency label (symbol, code, or name) based on display preference.
 *
 * @param currency - The currency code (e.g., "USD", "EUR")
 * @param currencyDisplay - How to display the currency (symbol, code, or name)
 * @returns The currency label string
 * @internal
 */
const getCurrencyLabel = (
  currency: string,
  currencyDisplay: Intl.NumberFormatOptions["currencyDisplay"] = "symbol",
): string => {
  if (currencyDisplay === "code") {
    return currency
  }

  if (currencyDisplay === "name") {
    return currencyRegistryService.getCurrencyName(currency)
  }

  return currencyRegistryService.getCurrencySymbol(currency)
}

/**
 * Gets the sign prefix (+ or -) based on value and display options.
 *
 * @param signDisplay - How to display the sign (auto, always, never, exceptZero)
 * @param value - The numeric value
 * @returns The sign prefix string ("+", "-", or "")
 * @internal
 */
const getSignPrefix = (
  signDisplay: Intl.NumberFormatOptions["signDisplay"],
  value: number,
): string => {
  const isNegative = value < 0

  if (signDisplay === "never") {
    return ""
  }

  if (value === 0 && signDisplay === "exceptZero") {
    return ""
  }

  if (!isNegative && signDisplay !== "always" && signDisplay !== "exceptZero") {
    return ""
  }

  if (isNegative) {
    return "-"
  }

  return "+"
}

/**
 * Formats a number as a decimal with sign prefix.
 *
 * @param value - The number to format
 * @param resolvedLocale - The locale to use for formatting
 * @param options - Number formatting options
 * @returns Formatted decimal string with sign prefix
 * @internal
 */
const formatDecimal = (
  value: number,
  resolvedLocale: string,
  options: Intl.NumberFormatOptions,
): string => {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    notation = "standard",
    signDisplay = "auto",
  } = options

  const signPrefix = getSignPrefix(signDisplay, value)
  const formatted = new Intl.NumberFormat(resolvedLocale, {
    style: "decimal",
    minimumFractionDigits,
    maximumFractionDigits,
    notation,
  }).format(Math.abs(value))

  return `${signPrefix}${formatted}`
}

/**
 * Options for number formatting with currency support.
 * @internal
 */
interface NumberFormatterOptions
  extends Omit<Intl.NumberFormatOptions, "style" | "currencySign"> {
  /**
   * When false, currency labels are omitted even if a currency is provided.
   * Useful when hiding symbols in UI while still formatting decimal digits.
   */
  showCurrency?: boolean
}

/**
 * Formats a number with optional currency display.
 * @internal
 *
 * @param value - The number to format
 * @param options - Formatting options including currency settings
 * @param locale - Optional locale override (defaults to browser locale)
 * @returns Formatted number string with optional currency symbol
 *
 * @example
 * ```ts
 * numberFormatter(1234.56, { currency: "USD" }) // "$1,234.56"
 * numberFormatter(1234.56, { currency: "USD", showCurrency: false }) // "1,234.56"
 * ```
 */
const numberFormatter = (
  value: number,
  options: NumberFormatterOptions = {},
  locale?: string,
): string => {
  const {
    currency,
    currencyDisplay,
    showCurrency = true,
    signDisplay = "auto",
    ...decimalOptions
  } = options
  const resolvedLocale = locale ?? getDefaultLocale()
  const formattedNumber = formatDecimal(value, resolvedLocale, {
    ...decimalOptions,
    signDisplay,
  })

  if (!currency || !showCurrency) {
    return formattedNumber
  }

  const currencyLabel = getCurrencyLabel(currency, currencyDisplay)
  const currencyPosition: "prefix" | "suffix" = "prefix"

  // Extract sign prefix from formatted number if present
  const signMatch = formattedNumber.match(/^([+-]?)/)
  const signPrefix = signMatch?.[1] ?? ""
  const numberWithoutSign = formattedNumber.replace(/^[+-]/, "")

  if (currencyPosition === "prefix") {
    return `${signPrefix}${currencyLabel}${ZERO_WIDTH_SPACE}${numberWithoutSign}`
  }

  return `${signPrefix}${numberWithoutSign}${ZERO_WIDTH_SPACE}${currencyLabel}`
}

/**
 * Rounds a number to a specified number of decimal places.
 * Uses a more precise method to avoid floating point errors.
 *
 * @param num - The number to round
 * @param decimals - The number of decimal places (must be non-negative)
 * @returns The rounded number
 *
 * @example
 * ```ts
 * roundToDecimals(3.14159, 2) // Returns 3.14
 * roundToDecimals(3.14159, 0) // Returns 3
 * roundToDecimals(3.14159, 4) // Returns 3.1416
 * roundToDecimals(0.1 + 0.2, 2) // Returns 0.3 (not 0.30000000000000004)
 * ```
 */
export const roundToDecimals = (num: number, decimals: number): number => {
  if (decimals < 0) {
    throw new Error("decimals must be non-negative")
  }
  if (!Number.isFinite(num)) {
    return num
  }
  // Use toFixed and parseFloat for more precise rounding
  // This avoids floating point arithmetic errors
  const factor = 10 ** decimals
  // Round to avoid floating point errors in multiplication
  const rounded = Math.round((num + Number.EPSILON) * factor) / factor
  // Use toFixed to ensure exact decimal places, then parse back
  return parseFloat(rounded.toFixed(decimals))
}

// ------------------------
// Display Normalization
// ------------------------
/**
 * Normalizes a calculator display string by removing leading zeros.
 *
 * @param display - The display string to normalize
 * @returns Normalized display string (preserves decimal point and trailing zeros)
 *
 * @example
 * ```ts
 * normalizeDisplay("000123") // Returns "123"
 * normalizeDisplay("000.45") // Returns "0.45"
 * normalizeDisplay("0") // Returns "0"
 * ```
 */
export const normalizeDisplay = (display: string): string => {
  if (display.includes(".")) {
    const [integerPart, decimalPart] = display.split(".")
    const normalizedInteger = integerPart.replace(/^0+/, "") || "0"
    return `${normalizedInteger}.${decimalPart}`
  }
  return display.replace(/^0+/, "") || "0"
}

/**
 * Validates a calculator display string against configuration limits.
 *
 * @param display - The display string to validate
 * @returns True if the display is valid (within decimal places and total digits limits)
 *
 * @remarks
 * Checks:
 * - Maximum decimal places (from CALCULATOR_CONFIG.MAX_DECIMALS)
 * - Maximum total digits (from CALCULATOR_CONFIG.MAX_DIGITS)
 */
export const isValidDisplay = (display: string): boolean => {
  // Check decimal places limit
  if (display.includes(".")) {
    const decimalParts = display.split(".")
    if (
      decimalParts[1] &&
      decimalParts[1].length > CALCULATOR_CONFIG.MAX_DECIMALS
    ) {
      return false
    }
  }

  // Check total digits limit
  if (display.replace(/\./g, "").length > CALCULATOR_CONFIG.MAX_DIGITS) {
    return false
  }

  return true
}

// ------------------------
// Formatter Memoization
// ------------------------
type FormatterKey = string
const formatterCache = new Map<FormatterKey, string>()

const getCachedFormatted = (
  value: number,
  locale: string | undefined,
  options: Parameters<typeof numberFormatter>[1],
): string => {
  const resolvedLocale = locale ?? getDefaultLocale()
  const key = JSON.stringify({ locale: resolvedLocale, options, value })
  const cached = formatterCache.get(key)
  if (cached) return cached
  const formatted = numberFormatter(value, options, resolvedLocale)
  formatterCache.set(key, formatted)
  return formatted
}

// ------------------------
// Calculator Display Formatting
// ------------------------
/**
 * Pure, testable formatter for calculator displays.
 * - `currencyLook` is intentionally optional so callers can pass formatting
 *   preferences from UI-level stores and avoid cross-store calls in hot paths.
 */
export const formatDisplayValue = (
  value: string,
  currency?: string,
  currencyLook?: Intl.NumberFormatOptions["currencyDisplay"],
  locale?: string,
): string => {
  const resolvedLocale = locale ?? getDefaultLocale()

  const baseOptions: Intl.NumberFormatOptions = {
    notation: "standard",
    signDisplay: "negative",
    minimumFractionDigits: 0,
    maximumFractionDigits: CALCULATOR_CONFIG.MAX_DECIMALS,
  }

  // Special handling when user types a trailing decimal point ("123.")
  if (value.endsWith(".")) {
    const numStr = value.slice(0, -1)
    // allow "." -> "0."
    const num = numStr === "" ? 0 : parseFloat(numStr)
    if (Number.isNaN(num)) return "0."

    if (currency) {
      const formatted = getCachedFormatted(num, resolvedLocale, {
        currency,
        currencyDisplay: currencyLook,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: baseOptions.notation,
        signDisplay: baseOptions.signDisplay,
      })
      return `${formatted}.`
    }

    const formatted = getCachedFormatted(num, resolvedLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: baseOptions.notation,
      signDisplay: baseOptions.signDisplay,
    })
    return `${formatted}.`
  }

  // Normal numeric parsing
  const num = parseFloat(value)
  if (Number.isNaN(num)) {
    // allow ".5" typed by the user to become "0.5"
    if (value === ".") return "0."
    return CALCULATOR_CONFIG.DEFAULT_DISPLAY
  }

  // Currency formatting (preferred path)
  if (currency) {
    // Preserve trailing zeros by counting decimal places in original value
    let minDecimals = 0

    if (value.includes(".")) {
      const decimalPart = value.split(".")[1]
      if (decimalPart !== undefined) {
        minDecimals = Math.min(
          decimalPart.length,
          CALCULATOR_CONFIG.MAX_DECIMALS,
        )
      }
    }

    return getCachedFormatted(num, resolvedLocale, {
      currency,
      currencyDisplay: currencyLook,
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: CALCULATOR_CONFIG.MAX_DECIMALS,
      notation: baseOptions.notation,
      signDisplay: baseOptions.signDisplay,
    })
  }

  // Non-currency: preserve trailing zeros and decimal point
  if (value.includes(".")) {
    const [integerPart, decimalPart] = value.split(".")
    if (
      decimalPart !== undefined && // Has decimal part (even if empty like "8.")
      integerPart !== "" &&
      !Number.isNaN(parseFloat(integerPart))
    ) {
      const formattedInteger = getCachedFormatted(
        parseFloat(integerPart),
        resolvedLocale,
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          notation: baseOptions.notation,
          signDisplay: baseOptions.signDisplay,
        },
      )
      return `${formattedInteger}.${decimalPart}`
    }
  }

  return getCachedFormatted(num, resolvedLocale, {
    minimumFractionDigits: baseOptions.minimumFractionDigits,
    maximumFractionDigits: baseOptions.maximumFractionDigits,
    notation: baseOptions.notation,
    signDisplay: baseOptions.signDisplay,
  })
}
