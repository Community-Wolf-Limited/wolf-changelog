import { Suspense } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { WolfIcon } from "@/components/wolf-icon"
import { ChangelogTabs } from "@/components/changelog-tabs"
import { ChangelogMediaGallery } from "@/components/changelog-media-gallery"
import {
  discoverProducts,
  getChangelogsByProduct,
} from "@/lib/changelog"
import { formatDate } from "@/lib/utils"

interface PageProps {
  searchParams: Promise<{ product?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const { product } = await searchParams
  const products = discoverProducts()
  const changelogs = getChangelogsByProduct(product || null)

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="max-w-5xl mx-auto relative">
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href="https://www.communitywolf.com"
                aria-label="Community Wolf home"
                className="hover:opacity-80 transition-opacity"
              >
                <WolfIcon size={28} className="text-primary" />
              </Link>
              <h1 className="text-xl font-semibold tracking-tight">Changelog</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Timeline with Tabs */}
      <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-10">
        <Suspense fallback={null}>
          <ChangelogTabs products={products} />
        </Suspense>

        {/* Product description */}
        {product && products.find((p) => p.slug === product)?.description && (
          <p className="text-muted-foreground text-sm mb-8 max-w-2xl">
            {products.find((p) => p.slug === product)?.description}
          </p>
        )}

        <div className="relative">
          {changelogs.map((changelog) => {
            const MDX = changelog.data.body
            const date = new Date(changelog.data.date)
            const formattedDate = formatDate(date)
            const productInfo = products.find((p) => p.slug === changelog.product)

            return (
              <div key={changelog.url} className="relative">
                <div className="flex flex-col md:flex-row gap-y-6">
                  <div className="md:w-48 flex-shrink-0">
                    <div className="md:sticky md:top-8 pb-10">
                      <time className="text-sm font-medium text-muted-foreground block mb-3">
                        {formattedDate}
                      </time>

                      {changelog.data.version && (
                        <div className="inline-flex relative z-10 items-center justify-center w-10 h-10 text-foreground border border-border rounded-lg text-sm font-bold">
                          {changelog.data.version}
                        </div>
                      )}

                      {/* Product badge when viewing "All" */}
                      {!product && products.length > 1 && productInfo && (
                        <div className="mt-2">
                          <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-lg">
                            {productInfo.displayName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - Content */}
                  <div className="flex-1 md:pl-8 relative pb-10">
                    {/* Vertical timeline line */}
                    <div className="hidden md:block absolute top-2 left-0 w-px h-full bg-border">
                      {/* Timeline dot */}
                      <div className="hidden md:block absolute -translate-x-1/2 size-3 bg-primary rounded-full z-10" />
                    </div>

                    <div className="space-y-6">
                      <div className="relative z-10 flex flex-col gap-2">
                        <h2 className="text-2xl font-semibold tracking-tight text-balance">
                          {changelog.data.title}
                        </h2>

                        {/* Tags */}
                        {changelog.data.tags && changelog.data.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {changelog.data.tags.map((tag: string) => (
                              <span
                                key={tag}
                                className="h-6 w-fit px-2 text-xs font-medium bg-muted text-muted-foreground rounded-lg border flex items-center justify-center"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Description */}
                        {changelog.data.description && (
                          <p className="text-base text-muted-foreground mt-1">{changelog.data.description}</p>
                        )}
                      </div>

                      {/* Images/videos from frontmatter (rendered as a slideshow + lightbox when multiple exist) */}
                      {changelog.data.images && changelog.data.images.length > 0 && (
                        <ChangelogMediaGallery
                          title={changelog.data.title}
                          productSlug={changelog.product}
                          fileNames={changelog.data.images}
                        />
                      )}

                      <div className="prose prose-sm dark:prose-invert max-w-none prose-h2:text-base prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-sm prose-headings:scroll-mt-8 prose-headings:font-semibold prose-a:no-underline prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance">
                        <MDX />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {changelogs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No changelog entries found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
