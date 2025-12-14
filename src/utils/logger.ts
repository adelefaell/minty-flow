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
function base(level: LogLevel, msg: string, meta?: Record<string, unknown>) {
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
    const metaStr = JSON.stringify(meta, null, 2)
      .split("\n")
      .map((line, idx) =>
        idx === 0 ? line : `${COLORS.dim}  ${line}${COLORS.reset}`,
      )
      .join("\n")
    metaSection = `\n${COLORS.dim}└─${COLORS.reset} ${COLORS.gray}Meta:${COLORS.reset}\n${COLORS.dim}  ${metaStr}${COLORS.reset}`
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
