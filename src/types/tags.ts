/**
 * Tag type definitions
 *
 * Pure domain types with no database dependencies.
 * These represent the business logic and UI contracts.
 * The WatermelonDB model implements these types, not the other way around.
 */

/**
 * Tag domain type for UI/API usage.
 *
 * This is the single source of truth for the Tag shape.
 * The WatermelonDB model implements this interface, ensuring
 * the persistence layer conforms to the domain model.
 *
 * Icon can be:
 * - MaterialCommunityIcons name
 * - Single emoji
 * - Single letter
 * - (Future) Image URL or path
 */
export interface Tag {
  id: string
  name: string
  color?: string
  icon?: string
  usageCount: number
  isArchived?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TagFormData {
  name: string
  color?: string
  icon?: string
}
