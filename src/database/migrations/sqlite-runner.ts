import type { SQLiteDatabase } from "expo-sqlite"

import { SQLITE_V1_SQL, SQLITE_V1_VERSION } from "./sqlite-v1"

/**
 * Ordered list of all schema migrations.
 *
 * Each entry carries a monotonically increasing integer `version` and the raw
 * SQL to execute when upgrading to that version. Add new migrations by
 * appending to this array — never reorder or mutate existing entries.
 *
 * @internal
 */
const migrations: { version: number; sql: string }[] = [
  { version: SQLITE_V1_VERSION, sql: SQLITE_V1_SQL },
]

/**
 * Apply any pending schema migrations **synchronously** at database open time.
 *
 * Uses SQLite's built-in `PRAGMA user_version` as the migration version
 * counter. For each migration whose `version` exceeds the current
 * `user_version`, the migration SQL is executed and `user_version` is bumped.
 * Migrations are applied in ascending version order.
 *
 * **Why synchronous:** `getDb()` is called in module initialization paths
 * (e.g. Zustand store hydration) where async is impractical. The first-open
 * migration cost is paid once per install or schema upgrade.
 *
 * @param db - An open `SQLiteDatabase` instance (must have `PRAGMA
 *   foreign_keys=ON` and `journal_mode=WAL` already set).
 */
export function runSqliteMigrationsSync(db: SQLiteDatabase): void {
  const row = db.getFirstSync<{ user_version: number }>("PRAGMA user_version")
  const currentVersion = row?.user_version ?? 0

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      db.execSync(migration.sql)
      db.execSync(`PRAGMA user_version = ${migration.version}`)
    }
  }
}
