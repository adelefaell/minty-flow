import { schemaMigrations } from "@nozbe/watermelondb/Schema/migrations"

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
  migrations: [],
})
