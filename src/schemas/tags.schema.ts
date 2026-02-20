import { z } from "zod"

const addTagsSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50),
  type: z.enum(["generic", "location", "contact"]),
  icon: z.string().optional(),
  colorSchemeName: z.string().optional(),
})

export { addTagsSchema }
export type AddTagsFormSchema = z.infer<typeof addTagsSchema>
export type UpdateTagsFormSchema = z.infer<typeof addTagsSchema>
