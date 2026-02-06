"use client"

import { cn } from "@/lib/utils"
import type { Product } from "@/lib/products"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

interface ChangelogTabsProps {
  products: Product[]
}

export function ChangelogTabs({ products }: ChangelogTabsProps) {
  const searchParams = useSearchParams()
  const currentProduct = searchParams.get("product")

  if (products.length <= 1) {
    return null
  }

  return (
    <div className="mb-8 inline-flex flex-wrap gap-2" role="tablist">
      <Link
        href="/"
        role="tab"
        aria-selected={currentProduct === null}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-lg transition-all border",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          currentProduct === null
            ? "bg-foreground text-background border-foreground"
            : "text-muted-foreground border-border hover:text-foreground hover:border-foreground/50"
        )}
      >
        All
      </Link>

      {products.map((product) => (
        <Link
          key={product.slug}
          href={`/?product=${product.slug}`}
          role="tab"
          aria-selected={currentProduct === product.slug}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-lg transition-all border",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            currentProduct === product.slug
              ? "bg-foreground text-background border-foreground"
              : "text-muted-foreground border-border hover:text-foreground hover:border-foreground/50"
          )}
        >
          {product.displayName}
        </Link>
      ))}
    </div>
  )
}
