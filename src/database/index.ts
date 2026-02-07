import { Database } from "@nozbe/watermelondb"
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite"

import AccountModel from "./models/Account"
import BudgetModel from "./models/Budget"
import CategoryModel from "./models/Category"
import GoalModel from "./models/Goal"
import LoanModel from "./models/Loan"
import TagModel from "./models/Tag"
import TransactionModel from "./models/Transaction"
import TransactionTagModel from "./models/TransactionTag"
import { schema } from "./schema"

/**
 * SQLite adapter configuration for WatermelonDB.
 *
 * Uses JSI (JavaScript Interface) for better performance on React Native.
 * JSI enables synchronous database operations without the bridge overhead.
 */
const adapter = new SQLiteAdapter({
  schema,
  // migrations,
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
    TagModel,
    TransactionModel,
    TransactionTagModel,
  ],
})

export type { default as AccountModel } from "./models/Account"
export type { default as BudgetModel } from "./models/Budget"
export type { default as CategoryModel } from "./models/Category"
export type { default as GoalModel } from "./models/Goal"
export type { default as LoanModel } from "./models/Loan"
export type { default as TagModel } from "./models/Tag"
export type { default as TransactionModel } from "./models/Transaction"
export type { default as TransactionTagModel } from "./models/TransactionTag"
