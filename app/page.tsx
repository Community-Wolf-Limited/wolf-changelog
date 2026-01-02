import { Suspense } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChangelogTabs } from "@/components/changelog-tabs"
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
            <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Timeline with Tabs */}
      <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-10">
        <Suspense fallback={null}>
          <ChangelogTabs products={products} />
        </Suspense>

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
                          <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
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
                                className="h-6 w-fit px-2 text-xs font-medium bg-muted text-muted-foreground rounded-full border flex items-center justify-center"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="prose dark:prose-invert max-w-none prose-headings:scroll-mt-8 prose-headings:font-semibold prose-a:no-underline prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance">
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
