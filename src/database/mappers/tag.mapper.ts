import { getThemeStrict } from "~/styles/theme/registry"
import type { Tag, TagKindType } from "~/types/tags"

import type { RowTag } from "../types/rows"

export function mapTag(row: RowTag): Tag {
  return {
    id: row.id,
    name: row.name,
    type: row.type as TagKindType,
    icon: row.icon,
    colorSchemeName: row.color_scheme_name,
    colorScheme: getThemeStrict(row.color_scheme_name),
    transactionCount: row.transaction_count,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}
