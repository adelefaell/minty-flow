import {
  createTable,
  schemaMigrations,
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
      // Migration from version 1 to version 2
      // This migration creates the initial core tables: categories, accounts, transactions
      toVersion: 2,
      steps: [
        createTable({
          name: "categories",
          columns: [
            { name: "name", type: "string" },
            { name: "type", type: "string" },
            { name: "icon", type: "string", isOptional: true },
            { name: "color_name", type: "string", isOptional: true },
            { name: "color_bg_class", type: "string", isOptional: true },
            { name: "color_text_class", type: "string", isOptional: true },
            { name: "color_border_class", type: "string", isOptional: true },
            { name: "transaction_count", type: "number" },
            { name: "is_archived", type: "boolean" },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
        createTable({
          name: "accounts",
          columns: [
            { name: "name", type: "string" },
            { name: "type", type: "string" },
            { name: "balance", type: "number" },
            { name: "currency_code", type: "string" },
            { name: "icon", type: "string", isOptional: true },
            { name: "color", type: "string", isOptional: true },
            { name: "is_archived", type: "boolean" },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
        createTable({
          name: "transactions",
          columns: [
            { name: "amount", type: "number" },
            { name: "currency_code", type: "string" },
            { name: "type", type: "string" },
            { name: "description", type: "string", isOptional: true },
            { name: "date", type: "number" },
            { name: "category_id", type: "string", isIndexed: true },
            { name: "account_id", type: "string", isIndexed: true },
            { name: "tags", type: "string", isOptional: true },
            { name: "location", type: "string", isOptional: true },
            { name: "is_pending", type: "boolean" },
            { name: "is_deleted", type: "boolean" },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
      ],
    },
    {
      // Migration from version 2 to version 3
      // This migration adds the tags, goals, loans, and budgets tables
      toVersion: 3,
      steps: [
        createTable({
          name: "tags",
          columns: [
            { name: "name", type: "string" },
            { name: "color", type: "string", isOptional: true },
            { name: "icon", type: "string", isOptional: true },
            { name: "usage_count", type: "number" },
            { name: "is_archived", type: "boolean" },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
        createTable({
          name: "goals",
          columns: [
            { name: "name", type: "string" },
            { name: "description", type: "string", isOptional: true },
            { name: "target_amount", type: "number" },
            { name: "current_amount", type: "number" },
            { name: "currency_code", type: "string" },
            { name: "target_date", type: "number", isOptional: true },
            { name: "icon", type: "string", isOptional: true },
            { name: "color", type: "string", isOptional: true },
            { name: "is_completed", type: "boolean" },
            { name: "is_archived", type: "boolean" },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
        createTable({
          name: "loans",
          columns: [
            { name: "name", type: "string" },
            { name: "description", type: "string", isOptional: true },
            { name: "principal_amount", type: "number" },
            { name: "remaining_amount", type: "number" },
            { name: "interest_rate", type: "number", isOptional: true },
            { name: "currency_code", type: "string" },
            { name: "loan_type", type: "string" },
            { name: "contact_name", type: "string", isOptional: true },
            { name: "contact_phone", type: "string", isOptional: true },
            { name: "due_date", type: "number", isOptional: true },
            {
              name: "account_id",
              type: "string",
              isIndexed: true,
              isOptional: true,
            },
            { name: "is_paid", type: "boolean" },
            { name: "is_archived", type: "boolean" },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
        createTable({
          name: "budgets",
          columns: [
            { name: "name", type: "string" },
            { name: "amount", type: "number" },
            { name: "spent_amount", type: "number" },
            { name: "currency_code", type: "string" },
            { name: "period", type: "string" },
            { name: "start_date", type: "number" },
            { name: "end_date", type: "number", isOptional: true },
            {
              name: "category_id",
              type: "string",
              isIndexed: true,
              isOptional: true,
            },
            { name: "alert_threshold", type: "number", isOptional: true },
            { name: "is_active", type: "boolean" },
            { name: "is_archived", type: "boolean" },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
      ],
    },
    {
      // Migration from version 3 to version 4
      // This migration updates the categories table to use a single color_scheme_name
      // instead of multiple color class fields (color_name, color_bg_class, etc.)
      toVersion: 4,
      steps: [
        // Add the new color_scheme_name column to categories table
        {
          type: "add_columns",
          table: "categories",
          columns: [
            { name: "color_scheme_name", type: "string", isOptional: true },
          ],
        },
      ],
    },
    {
      // Migration from version 4 to version 5
      // This migration makes category_id optional to support uncategorized transactions
      // No data migration needed - existing transactions keep their categories
      toVersion: 5,
      steps: [
        // WatermelonDB doesn't support altering column nullability directly
        // The schema change is declarative - the database adapter handles it
        // Existing data remains unchanged; new transactions can have null category_id
      ],
    },
  ],
})
