import { z } from "zod"

export const productMetaSchema = z.object({
  displayName: z.string().optional(),
  order: z.number().optional(),
  description: z.string().optional(),
})

export type ProductMeta = z.infer<typeof productMetaSchema>

export interface Product {
  slug: string
  displayName: string
  order: number
  description?: string
}

export function slugToDisplayName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
