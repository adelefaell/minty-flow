import { emit } from "~/database/events"
import { query } from "~/database/sql"
import { runInTransaction } from "~/database/transaction"
import { generateId } from "~/database/utils/generate-id"
import type { AddTagsFormSchema } from "~/schemas/tags.schema"

export async function createTag(data: AddTagsFormSchema): Promise<string> {
  const id = generateId()
  const now = new Date().toISOString()

  await runInTransaction("tag.create", async (db) => {
    await db.runAsync(
      `INSERT INTO tags (id, name, type, icon, color_scheme_name, transaction_count, created_at, updated_at)
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

  emit("tags:dirty", undefined)
  return id
}

export async function updateTagById(
  id: string,
  data: Partial<AddTagsFormSchema>,
): Promise<void> {
  const now = new Date().toISOString()

  await runInTransaction("tag.update", async (db) => {
    await db.runAsync(
      `UPDATE tags SET
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

  emit("tags:dirty", undefined)
}

export async function deleteTagById(id: string): Promise<void> {
  await runInTransaction("tag.delete", async (db) => {
    await db.runAsync(`DELETE FROM transaction_tags WHERE tag_id = ?`, [id])
    await db.runAsync(`DELETE FROM tags WHERE id = ?`, [id])
  })

  emit("tags:dirty", undefined)
  emit("transactions:dirty", {})
}

export async function getTagTransactionCount(id: string): Promise<number> {
  const rows = await query<{ count: number }>(
    `SELECT COUNT(*) as count FROM transaction_tags WHERE tag_id = ?`,
    [id],
  )
  return rows[0]?.count ?? 0
}
