import { docs, meta } from "@/.source"
import { loader } from "fumadocs-core/source"
import { createMDXSource } from "fumadocs-mdx"
import type { ComponentType } from "react"
import {
  slugToDisplayName,
  productMetaSchema,
  type Product,
  type ProductMeta,
} from "./products"
import fs from "fs"
import path from "path"

export interface ChangelogData {
  title: string
  description?: string
  date: string
  version?: string
  tags?: string[]
  images?: string[]
  body: ComponentType
}

export interface ChangelogPage {
  url: string
  slugs: string[]
  file: {
    path: string
    flattenedPath: string
  }
  data: ChangelogData
}

const mdxSource = createMDXSource(docs, meta)
const source = loader({
  baseUrl: "/docs",
  source: {
    // @ts-expect-error - fumadocs types don't match runtime
    files: mdxSource.files(),
  },
})

export function getProductFromPath(filePath: string): string {
  const segments = filePath.split("/")
  if (segments.length > 1) {
    return segments[0]
  }
  return "default"
}

export function getAllChangelogs(): (ChangelogPage & { product: string })[] {
  const pages = source.getPages() as unknown as ChangelogPage[]

  return pages.map((page) => ({
    ...page,
    product: getProductFromPath(page.file?.path || ""),
  }))
}

export function discoverProducts(): Product[] {
  const changelogs = getAllChangelogs()
  const productSlugs = new Set<string>()

  changelogs.forEach((changelog) => {
    if (changelog.product) {
      productSlugs.add(changelog.product)
    }
  })

  const products: Product[] = []

  productSlugs.forEach((slug) => {
    const metaPath = path.join(process.cwd(), "changelog", slug, "_meta.json")
    let productMeta: ProductMeta = {}

    try {
      if (fs.existsSync(metaPath)) {
        const raw = JSON.parse(fs.readFileSync(metaPath, "utf-8"))
        productMeta = productMetaSchema.parse(raw)
      }
    } catch {
      // No _meta.json or invalid, use defaults
    }

    products.push({
      slug,
      displayName: productMeta.displayName || slugToDisplayName(slug),
      order: productMeta.order ?? 999,
      description: productMeta.description,
    })
  })

  return products.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.displayName.localeCompare(b.displayName)
  })
}

export function getChangelogsByProduct(
  product: string | null
): (ChangelogPage & { product: string })[] {
  const all = getAllChangelogs()

  const filtered = product ? all.filter((c) => c.product === product) : all

  return filtered.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  )
}
