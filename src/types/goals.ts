/**
 * Goal type definitions
 *
 * Pure domain types with no database dependencies.
 * These represent the business logic and UI contracts.
 * The WatermelonDB model implements these types, not the other way around.
 */

import type { MintyColorScheme } from "~/styles/theme/types"

/**
 * Goal domain type for UI/API usage.
 *
 * This is the single source of truth for the Goal shape.
 * The WatermelonDB model implements this interface, ensuring
 * the persistence layer conforms to the domain model.
 *
 * currentAmount is computed from linked account balances by the service
 * layer and stored for display purposes.
 *
 * accountIds is a derived field populated from the goal_accounts
 * join table by the service layer.
 *
 * Icon can be:
 * - MaterialCommunityIcons name
 * - Single emoji
 * - Single letter
 * - (Future) Image URL or path
 */
export interface Goal {
  id: string
  name: string
  description: string | null
  targetAmount: number
  currentAmount: number // Computed from linked account balances by service, stored for display
  currencyCode: string
  targetDate: Date | null
  icon: string | null
  colorSchemeName: string | null
  colorScheme: MintyColorScheme | null // Computed from colorSchemeName via registry
  isCompleted: boolean
  isArchived: boolean
  accountIds: string[] // Derived from goal_accounts join table by service
  createdAt: Date
  updatedAt: Date
}
