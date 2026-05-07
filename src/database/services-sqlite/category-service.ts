import { emit } from "~/database/events"
import { runInTransaction } from "~/database/transaction"
import { generateId } from "~/database/utils/generate-id"
import type {
  AddCategoriesFormSchema,
  UpdateCategoriesFormSchema,
} from "~/schemas/categories.schema"

export async function createCategory(
  data: AddCategoriesFormSchema,
): Promise<string> {
  const id = generateId()
  const now = new Date().toISOString()

  await runInTransaction("category.create", async (db) => {
    await db.runAsync(
      `INSERT INTO categories (id, name, type, icon, color_scheme_name, transaction_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        id,
        data.name,
        data.type,
        data.icon ?? null,
        data.colorSchemeName ?? null,
        now,
        now,
      ],
    )
  })

  emit("categories:dirty", undefined)
  return id
}

export async function updateCategoryById(
  id: string,
  data: Partial<UpdateCategoriesFormSchema>,
): Promise<void> {
  const now = new Date().toISOString()

  await runInTransaction("category.update", async (db) => {
    await db.runAsync(
      `UPDATE categories SET
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        icon = CASE WHEN ? THEN ? ELSE icon END,
        color_scheme_name = CASE WHEN ? THEN ? ELSE color_scheme_name END,
        updated_at = ?
       WHERE id = ?`,
      [
        data.name ?? null,
        data.type ?? null,
        data.icon !== undefined ? 1 : 0,
        data.icon ?? null,
        data.colorSchemeName !== undefined ? 1 : 0,
        data.colorSchemeName ?? null,
        now,
        id,
      ],
    )
  })

  emit("categories:dirty", undefined)
}

export async function deleteCategoryById(id: string): Promise<void> {
  await runInTransaction("category.delete", async (db) => {
    await db.runAsync(
      `UPDATE transactions SET category_id = NULL, updated_at = ? WHERE category_id = ?`,
      [new Date().toISOString(), id],
    )
    await db.runAsync(`DELETE FROM categories WHERE id = ?`, [id])
  })

  emit("categories:dirty", undefined)
  emit("transactions:dirty", {})
}
