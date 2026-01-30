export const NewEnum = {
  NEW: "new",
} as const

export type NewType = (typeof NewEnum)[keyof typeof NewEnum]
