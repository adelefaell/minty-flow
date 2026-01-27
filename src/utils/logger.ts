/**
 * Log level types for the logger.
 */
export type LogLevel = "debug" | "info" | "warn" | "error"

const COLORS = {
  debug: "\x1b[36m", // cyan
  info: "\x1b[32m", // green
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  gray: "\x1b[90m",
}

/**
 * Maximum number of keys to display per object to prevent log explosion.
 */
const MAX_KEYS = 20

/**
 * Safely stringify a value with proper Date handling and depth limiting.
 * 
 * @param value - The value to stringify
 * @param depth - Maximum depth for nested objects (default: 3)
 * @returns Formatted string representation
 */
const pretty = (value: unknown, depth = 3): string => {
  return JSON.stringify(
    value,
    (_key, val) => {
      if (val instanceof Date) {
        return val.toISOString()
      }
      return val
    },
    2,
  )
}

/**
 * Indent a multi-line string by prepending spaces to each line.
 * 
 * @param str - The string to indent
 * @returns Indented string
 */
const indent = (str: string): string => {
  return str
    .split("\n")
    .map((l) => `  ${l}`)
    .join("\n")
}

/**
 * Pretty print an object as key-value pairs with proper formatting.
 * Handles Dates, nested objects, and prevents [Object] collapsing.
 * 
 * @param obj - The object to print
 * @param indentLevel - Number of spaces to indent (default: 2)
 * @returns Formatted string representation
 */
const printObject = (obj: Record<string, unknown>, indentLevel = 2): string => {
  const pad = " ".repeat(indentLevel)
  const entries = Object.entries(obj)
  const entriesToShow = entries.slice(0, MAX_KEYS)

  const lines = entriesToShow.map(([key, value]) => {
    let formatted: string

    if (value instanceof Date) {
      formatted = value.toISOString()
    } else if (typeof value === "object" && value !== null) {
      // Handle nested objects
      const nested = JSON.stringify(value, null, 2)
      formatted = nested
        .split("\n")
        .map((l, i) => (i === 0 ? l : `${pad}  ${l}`))
        .join("\n")
    } else {
      formatted = JSON.stringify(value)
    }

    return `${pad}${COLORS.dim}${key}:${COLORS.reset} ${formatted}`
  })

  // Add truncation notice if we hit the limit
  if (entries.length > MAX_KEYS) {
    lines.push(`${pad}${COLORS.dim}... (${entries.length - MAX_KEYS} more keys)${COLORS.reset}`)
  }

  return lines.join("\n")
}

/**
 * Format an array of items into a readable list.
 * For objects, shows a one-line summary followed by full object details.
 * 
 * @param label - The label for the array
 * @param arr - The array to format
 * @returns Formatted string representation
 */
const formatArray = (label: string, arr: unknown[]): string => {
  const header = `${COLORS.dim}${label} (${arr.length})${COLORS.reset}`

  const rows = arr.map((item, i) => {
    if (typeof item === "object" && item !== null) {
      const record = item as Record<string, unknown>

      // One-line identity summary
      const title = `${COLORS.gray}  ${i + 1}. ${COLORS.bold}${record.name ?? "—"}${COLORS.reset} ${COLORS.dim}(${record.type ?? "?"}) id=${record.id ?? "?"}${COLORS.reset}`

      // Full object details
      const details = printObject(record, 4)

      return `${title}\n${details}`
    }

    return `${COLORS.gray}  ${i + 1}. ${String(item)}${COLORS.reset}`
  })

  return [header, ...rows].join("\n")
}

/**
 * Format metadata object into a readable structure.
 * Special-cases arrays to use the array formatter for better readability.
 * 
 * @param meta - The metadata object to format
 * @returns Formatted string representation
 */
const formatMeta = (meta: Record<string, unknown>): string => {
  return Object.entries(meta)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return formatArray(key, value)
      }

      return `${COLORS.dim}${key}:${COLORS.reset}\n${indent(pretty(value))}`
    })
    .join("\n")
}

const ICONS = {
  debug: "🔍",
  info: "ℹ️",
  warn: "⚠️",
  error: "❌",
}

/**
 * Base logging function that handles both production (JSON) and development (pretty) formats.
 * 
 * @param level - The log level
 * @param msg - The log message
 * @param meta - Optional metadata object
 * @internal
 */
  const base = (level: LogLevel, msg: string, meta?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString()
  const log = { level, msg, meta, timestamp }

  if (process.env.NODE_ENV === "production") {
    // Machine food - strict JSON for production
    console[level === "debug" ? "log" : level](JSON.stringify(log))
    return
  }

  // Human dev-friendly mode - pretty formatted
  const color = COLORS[level]
  const icon = ICONS[level]
  const time = new Date(timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  })

  // Build the pretty log
  const levelBadge = `${color}${COLORS.bold}[${level.toUpperCase()}]${COLORS.reset}`
  const timeStr = `${COLORS.gray}${time}${COLORS.reset}`
  const iconStr = `${icon}`
  const messageStr = `${COLORS.bold}${msg}${COLORS.reset}`

  // Main log line
  const mainLine = `${iconStr} ${levelBadge} ${timeStr} ${messageStr}`

  // Metadata section (if present)
  let metaSection = ""
  if (meta && Object.keys(meta).length > 0) {
    const metaStr = formatMeta(meta)
    metaSection = `\n${COLORS.dim}└─ Meta${COLORS.reset}\n${metaStr}`
  }

  const output = `${mainLine}${metaSection}`

  console[level === "debug" ? "log" : level](output)
}

/**
 * Logger utility with different log levels.
 * 
 * @remarks
 * In production: outputs JSON format for machine parsing
 * In development: outputs pretty formatted, colorized logs with icons
 * 
 * @example
 * ```ts
 * logger.info("User logged in", { userId: "123" })
 * logger.error("Failed to fetch data", { error: err })
 * ```
 */
export const logger = {
  /**
   * Logs a debug message.
   * 
   * @param msg - The debug message
   * @param meta - Optional metadata object
   */
  debug: (msg: string, meta?: Record<string, unknown>) =>
    base("debug", msg, meta),
  /**
   * Logs an info message.
   * 
   * @param msg - The info message
   * @param meta - Optional metadata object
   */
  info: (msg: string, meta?: Record<string, unknown>) =>
    base("info", msg, meta),
  /**
   * Logs a warning message.
   * 
   * @param msg - The warning message
   * @param meta - Optional metadata object
   */
  warn: (msg: string, meta?: Record<string, unknown>) =>
    base("warn", msg, meta),
  /**
   * Logs an error message.
   * 
   * @param msg - The error message
   * @param meta - Optional metadata object
   */
  error: (msg: string, meta?: Record<string, unknown>) =>
    base("error", msg, meta),
}
