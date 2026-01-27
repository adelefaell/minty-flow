import { appSchema, tableSchema } from "@nozbe/watermelondb"

/**
 * Database schema definition for WatermelonDB.
 *
 * This schema defines all tables and their columns for the application.
 * Each table represents a collection of models that can be queried and manipulated.
 */
export const schema = appSchema({
  version: 5, // Incremented version to make category_id optional for uncategorized transactions
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
        { name: "type", type: "string" }, // e.g., "checking", "savings", "credit"
        { name: "balance", type: "number" },
        { name: "currency_code", type: "string" },
        { name: "icon", type: "string", isOptional: true },
        { name: "color", type: "string", isOptional: true },
        { name: "is_archived", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // Transactions table - stores financial transactions
    tableSchema({
      name: "transactions",
      columns: [
        { name: "amount", type: "number" },
        { name: "currency_code", type: "string" },
        { name: "type", type: "string" }, // "expense" | "income" | "transfer"
        { name: "description", type: "string", isOptional: true },
        { name: "date", type: "number" },
        {
          name: "category_id",
          type: "string",
          isIndexed: true,
          isOptional: true,
        },
        { name: "account_id", type: "string", isIndexed: true },
        { name: "tags", type: "string", isOptional: true }, // JSON array of tags
        { name: "location", type: "string", isOptional: true }, // JSON object
        { name: "is_pending", type: "boolean" },
        { name: "is_deleted", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // Tags table - stores tags for categorizing transactions
    tableSchema({
      name: "tags",
      columns: [
        { name: "name", type: "string" },
        { name: "color", type: "string", isOptional: true },
        { name: "icon", type: "string", isOptional: true },
        { name: "usage_count", type: "number" }, // Track how many times tag is used
        { name: "is_archived", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
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
        { name: "color", type: "string", isOptional: true },
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
