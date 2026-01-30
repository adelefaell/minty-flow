import * as Localization from "expo-localization"

import { currencyRegistryService } from "~/services/currency-registry"

const DEFAULT_LOCALE = "en-US"

// ------------------------
// Calculator Configuration
// ------------------------
export const CALCULATOR_CONFIG = {
  MAX_DIGITS: 14,
  MAX_DECIMALS: 2,
  DEFAULT_DISPLAY: "0",
} as const

// ------------------------
// Locale Resolution (cached)
// ------------------------
let cachedLocale: string | null = null

export const getDefaultLocale = (): string => {
  if (cachedLocale) return cachedLocale
  cachedLocale = Localization.getLocales()[0]?.languageTag ?? DEFAULT_LOCALE
  return cachedLocale
}

// ------------------------
// Internal helpers
// ------------------------
const getCurrencyLabel = (
  currency: string,
  currencyDisplay: Intl.NumberFormatOptions["currencyDisplay"] = "symbol",
): string => {
  if (currencyDisplay === "code") return currency
  if (currencyDisplay === "name") {
    return currencyRegistryService.getCurrencyName(currency)
  }
  return currencyRegistryService.getCurrencySymbol(currency)
}

const getSignPrefix = (
  signDisplay: Intl.NumberFormatOptions["signDisplay"],
  value: number,
): string => {
  if (signDisplay === "never") return ""
  if (value === 0 && signDisplay === "exceptZero") return ""
  if (value < 0) return "-"
  if (signDisplay === "always" || signDisplay === "exceptZero") return "+"
  return ""
}

const formatDecimal = (
  value: number,
  locale: string,
  options: Intl.NumberFormatOptions,
): string => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    notation = "standard",
    signDisplay = "auto",
  } = options

  const sign = getSignPrefix(signDisplay, value)

  const formatted = new Intl.NumberFormat(locale, {
    style: "decimal",
    minimumFractionDigits,
    maximumFractionDigits,
    notation,
  }).format(Math.abs(value))

  return `${sign}${formatted}`
}

interface NumberFormatterOptions
  extends Omit<Intl.NumberFormatOptions, "style" | "currencySign"> {
  showCurrency?: boolean
}

const numberFormatter = (
  value: number,
  options: NumberFormatterOptions,
  locale: string,
): string => {
  const {
    currency,
    currencyDisplay,
    showCurrency = true,
    signDisplay = "auto",
    ...decimalOptions
  } = options

  const base = formatDecimal(value, locale, {
    ...decimalOptions,
    signDisplay,
  })

  if (!currency || !showCurrency) return base

  const label = getCurrencyLabel(currency, currencyDisplay)
  const sign = base.startsWith("-") || base.startsWith("+") ? base[0] : ""
  const number = base.replace(/^[+-]/, "")

  return `${sign}${label}${number}`
}

// ------------------------
// Formatter memoization
// ------------------------
type CacheKey = string
const cache = new Map<CacheKey, string>()

const getCachedFormatted = (
  value: number,
  locale: string,
  options: NumberFormatterOptions,
): string => {
  const key = `${locale}|${value}|${options.currency ?? ""}|${options.minimumFractionDigits}|${options.maximumFractionDigits}|${options.signDisplay}`

  const cached = cache.get(key)
  if (cached) return cached

  const formatted = numberFormatter(value, options, locale)
  cache.set(key, formatted)
  return formatted
}

// ------------------------
// Public formatter (single source of truth)
// ------------------------
export const formatDisplayValue = (
  raw: string,
  currency?: string,
  currencyDisplay?: Intl.NumberFormatOptions["currencyDisplay"],
  locale?: string,
): string => {
  const resolvedLocale = locale ?? getDefaultLocale()

  // Allow "." or "123."
  if (raw.endsWith(".")) {
    const base = raw.slice(0, -1)
    const num = base === "" ? 0 : Number(base)
    if (Number.isNaN(num)) return "0."

    const formatted = getCachedFormatted(num, resolvedLocale, {
      currency,
      currencyDisplay,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      signDisplay: "negative",
    })

    return `${formatted}.`
  }

  const num = Number(raw)
  if (Number.isNaN(num)) {
    if (raw === ".") return "0."
    return CALCULATOR_CONFIG.DEFAULT_DISPLAY
  }

  let minDecimals = 0
  if (raw.includes(".")) {
    const decimals = raw.split(".")[1]?.length ?? 0
    minDecimals = Math.min(decimals, CALCULATOR_CONFIG.MAX_DECIMALS)
  }

  return getCachedFormatted(num, resolvedLocale, {
    currency,
    currencyDisplay,
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: CALCULATOR_CONFIG.MAX_DECIMALS,
    signDisplay: "negative",
  })
}

// ------------------------
// Numeric utilities (non-display)
// ------------------------
export const roundToDecimals = (num: number, decimals: number): number => {
  if (decimals < 0) {
    throw new Error("decimals must be non-negative")
  }
  if (!Number.isFinite(num)) return num

  const factor = 10 ** decimals
  const rounded = Math.round((num + Number.EPSILON) * factor) / factor
  return Number(rounded.toFixed(decimals))
}
