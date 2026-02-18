import {
  schemaMigrations,
  unsafeExecuteSql,
} from "@nozbe/watermelondb/Schema/migrations"

/**
 * Database migrations for WatermelonDB.
 *
 * Migrations allow the database schema to evolve over time without losing user data.
 * Each migration defines the changes between schema versions.
 *
 * IMPORTANT: Always follow the migration workflow:
 * 1. Add migration definition first
 * 2. Update schema file to match
 * 3. Bump schema version last
 */
export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        unsafeExecuteSql(
          "CREATE INDEX IF NOT EXISTS transactions_transaction_date_idx ON transactions(transaction_date);",
        ),
        unsafeExecuteSql(
          "CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions(type);",
        ),
        unsafeExecuteSql(
          "CREATE INDEX IF NOT EXISTS transactions_is_pending_idx ON transactions(is_pending);",
        ),
      ],
    },
    {
      toVersion: 3,
      steps: [
        unsafeExecuteSql(
          "ALTER TABLE transactions ADD COLUMN has_attachments INTEGER DEFAULT 0;",
        ),
        unsafeExecuteSql(
          "CREATE INDEX IF NOT EXISTS transactions_has_attachments_idx ON transactions(has_attachments);",
        ),
        unsafeExecuteSql(
          "UPDATE transactions SET has_attachments = 1 WHERE extra IS NOT NULL AND json_extract(extra, '$.attachments') IS NOT NULL AND length(trim(cast(json_extract(extra, '$.attachments') AS TEXT))) > 2;",
        ),
      ],
    },
    {
      toVersion: 4,
      steps: [
        unsafeExecuteSql(
          "ALTER TABLE transactions ADD COLUMN recurring_id TEXT;",
        ),
        unsafeExecuteSql(
          "CREATE INDEX IF NOT EXISTS transactions_recurring_id_idx ON transactions(recurring_id);",
        ),
        unsafeExecuteSql(
          "UPDATE transactions SET recurring_id = json_extract(extra, '$.recurringId') WHERE extra IS NOT NULL AND json_extract(extra, '$.recurringId') IS NOT NULL AND trim(cast(json_extract(extra, '$.recurringId') AS TEXT)) != '';",
        ),
      ],
    },
  ],
})
