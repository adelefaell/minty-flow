import { Database } from "@nozbe/watermelondb"
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite"

import migrations from "./migrations"
import AccountModel from "./models/account"
import BudgetModel from "./models/budget"
import CategoryModel from "./models/category"
import GoalModel from "./models/goal"
import LoanModel from "./models/loan"
import RecurringTransactionModel from "./models/recurring-transaction"
import TagModel from "./models/tag"
import TransactionModel from "./models/transaction"
import TransactionTagModel from "./models/transaction-tag"
import TransferModel from "./models/transfer"
import { schema } from "./schema"

/**
 * SQLite adapter configuration for WatermelonDB.
 *
 * Uses JSI (JavaScript Interface) for better performance on React Native.
 * JSI enables synchronous database operations without the bridge overhead.
 */
const adapter = new SQLiteAdapter({
  schema,
  migrations,
  dbName: "minty_flow_db",
  jsi: true, // Use JSI for better performance (React Native only)
  // onSetUpError: (error) => {
  //   // Handle database setup errors
  //   console.error("Database setup error:", error)
  // },
})

/**
 * Database instance.
 *
 * This is the main database connection that should be used throughout the app.
 * All model classes must be registered here.
 *
 * WatermelonDB is ready to use immediately after creation - no initialization needed.
 * The database will be created automatically when first accessed.
 */
export const database = new Database({
  adapter,
  modelClasses: [
    AccountModel,
    BudgetModel,
    CategoryModel,
    GoalModel,
    LoanModel,
    RecurringTransactionModel,
    TagModel,
    TransactionModel,
    TransactionTagModel,
    TransferModel,
  ],
})

export type { default as AccountModel } from "./models/account"
export type { default as BudgetModel } from "./models/budget"
export type { default as CategoryModel } from "./models/category"
export type { default as GoalModel } from "./models/goal"
export type { default as LoanModel } from "./models/loan"
export type { default as RecurringTransactionModel } from "./models/recurring-transaction"
export type { default as TagModel } from "./models/tag"
export type { default as TransactionModel } from "./models/transaction"
export type { default as TransactionTagModel } from "./models/transaction-tag"
export type { default as TransferModel } from "./models/transfer"
