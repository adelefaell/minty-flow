export type LogLevel = "debug" | "info" | "warn" | "error"

const ICONS: Record<LogLevel, string> = {
  debug: "🔍",
  info: "ℹ️",
  warn: "⚠️",
  error: "❌",
}

/**
 * Simplified logger that outputs JSON in production 
 * and readable, unformatted logs in development.
 */
const base = (level: LogLevel, msg: string, meta?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();

  if (process.env.NODE_ENV === "production") {
    // Stringify everything for production to avoid the TS error
    console[level === "debug" ? "log" : level](JSON.stringify({ level, msg, meta, timestamp }));
    return;
  }

  // Development: Use a comma, not a plus (+) sign.
  const label = `${ICONS[level]} [${level.toUpperCase()}] ${msg}`;

  if (meta) {
    // Pass them as separate arguments
    console[level === "debug" ? "log" : level](label, meta);
  } else {
    console[level === "debug" ? "log" : level](label);
  }
};

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => base("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => base("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => base("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => base("error", msg, meta),
}