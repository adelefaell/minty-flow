import { appSchema, tableSchema } from "@nozbe/watermelondb"

/**
 * Database schema definition for WatermelonDB.
 *
 * This schema defines all tables and their columns for the application.
 * Each table represents a collection of models that can be queried and manipulated.
 */
export const schema = appSchema({
  version: 6,
  tables: [
    // Categories table - stores transaction categories
    tableSchema({
      name: "categories",
      columns: [
        { name: "name", type: "string" },
        { name: "type", type: "string" }, // "expense" | "income" | "transfer"
        { name: "icon", type: "string", isOptional: true },
        { name: "color_scheme_name", type: "string", isOptional: true },
        { name: "transaction_count", type: "number" },
        { name: "is_archived", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // Accounts table - stores user accounts
    tableSchema({
      name: "accounts",
      columns: [
        { name: "name", type: "string" },
        { name: "type", type: "string" }, // e.g., "checking" "savings", "credit"
        { name: "balance", type: "number" },
        { name: "currency_code", type: "string" },
        { name: "icon", type: "string", isOptional: true },
        { name: "color_scheme_name", type: "string", isOptional: true },
        { name: "is_archived", type: "boolean" },
        { name: "is_primary", type: "boolean" },
        { name: "exclude_from_balance", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "sort_order", type: "number", isOptional: true },
      ],
    }),

    // Transactions table - stores financial transactions
    tableSchema({
      name: "transactions",
      columns: [
        { name: "transaction_date", type: "number" },
        { name: "is_deleted", type: "boolean" },
        { name: "deleted_at", type: "number", isOptional: true },
        { name: "title", type: "string", isOptional: true },
        { name: "description", type: "string", isOptional: true },
        { name: "amount", type: "number" },
        { name: "is_pending", type: "boolean" },
        // Currency comes from account (account_id); type explains meaning.
        { name: "type", type: "string" }, // "expense" | "income" | "transfer"
        { name: "subtype", type: "string", isOptional: true }, // "recurring" | "one-time" | "subscription" etc.
        { name: "extra", type: "string", isOptional: true }, // JSON for custom metadata
        // REMOVE extra_tags - use transaction_tags join table instead

        { name: "category_id", type: "string", isIndexed: true },
        { name: "account_id", type: "string", isIndexed: true },
        { name: "location", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // Tags table - stores tags for categorizing transactions
    tableSchema({
      name: "tags",
      columns: [
        { name: "name", type: "string" },
        { name: "type", type: "string" }, // "generic" | "location" | "contact"
        { name: "color_scheme_name", type: "string", isOptional: true },
        { name: "icon", type: "string", isOptional: true },
        { name: "transaction_count", type: "number" }, // Track how many times tag is used
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // Join table for Transactions and Tags
    tableSchema({
      name: "transaction_tags",
      columns: [
        { name: "transaction_id", type: "string", isIndexed: true },
        { name: "tag_id", type: "string", isIndexed: true },
      ],
    }),

    // Join table for Transactions and Attachments
    tableSchema({
      name: "transaction_attachments",
      columns: [
        { name: "transaction_id", type: "string", isIndexed: true },
        { name: "attachment_id", type: "string", isIndexed: true },
      ],
    }),

    // Goals table - stores financial goals
    tableSchema({
      name: "goals",
      columns: [
        { name: "name", type: "string" },
        { name: "description", type: "string", isOptional: true },
        { name: "target_amount", type: "number" },
        { name: "current_amount", type: "number" },
        { name: "currency_code", type: "string" },
        { name: "target_date", type: "number", isOptional: true },
        { name: "icon", type: "string", isOptional: true },
        { name: "color_scheme_name", type: "string", isOptional: true },
        { name: "is_completed", type: "boolean" },
        { name: "is_archived", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // Loans table - stores borrowed and lent money
    tableSchema({
      name: "loans",
      columns: [
        { name: "name", type: "string" },
        { name: "description", type: "string", isOptional: true },
        { name: "principal_amount", type: "number" },
        { name: "remaining_amount", type: "number" },
        { name: "interest_rate", type: "number", isOptional: true }, // As percentage
        { name: "currency_code", type: "string" },
        { name: "loan_type", type: "string" }, // "borrowed" | "lent"
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

    // Budgets table - stores budget limits
    tableSchema({
      name: "budgets",
      columns: [
        { name: "name", type: "string" },
        { name: "amount", type: "number" },
        { name: "spent_amount", type: "number" }, // Track current spending
        { name: "currency_code", type: "string" },
        { name: "period", type: "string" }, // "daily" | "weekly" | "monthly" | "yearly" | "custom"
        { name: "start_date", type: "number" },
        { name: "end_date", type: "number", isOptional: true },
        {
          name: "category_id",
          type: "string",
          isIndexed: true,
          isOptional: true,
        }, // Budget for specific category
        { name: "alert_threshold", type: "number", isOptional: true }, // Percentage (e.g., 80 for 80%)
        { name: "is_active", type: "boolean" },
        { name: "is_archived", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
  ],
})
