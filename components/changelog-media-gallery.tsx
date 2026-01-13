"use client"

import * as React from "react"

type ChangelogMediaType = "image" | "video"

interface ChangelogMediaItem {
  src: string
  type: ChangelogMediaType
  fileName: string
  alt: string
}

interface ChangelogMediaGalleryProps {
  title: string
  productSlug: string
  fileNames: string[]
}

/**
 * Determines whether a given changelog media filename should be treated as a video.
 *
 * @param fileName {string} The filename from changelog frontmatter (including extension).
 * @returns {boolean} True when the file extension indicates a video format we support.
 */
function isVideoFileName(fileName: string): boolean {
  const lower = fileName.toLowerCase()
  return lower.endsWith(".mp4") || lower.endsWith(".webm")
}

/**
 * Converts frontmatter file names into normalised media items with absolute public URLs.
 *
 * @param params {{ title: string; productSlug: string; fileNames: string[] }} The metadata required to build media URLs and alt text.
 * @returns {ChangelogMediaItem[]} A list of media items ready to render.
 */
function buildChangelogMediaItems(params: {
  title: string
  productSlug: string
  fileNames: string[]
}): ChangelogMediaItem[] {
  const { title, productSlug, fileNames } = params

  return fileNames
    .filter((name) => typeof name === "string" && name.trim().length > 0)
    .map((fileName, index) => {
      // Note: files are served from the changelog public folder per product slug.
      const src = `/changelog/${productSlug}/images/${fileName}`
      const type: ChangelogMediaType = isVideoFileName(fileName) ? "video" : "image"

      return {
        src,
        type,
        fileName,
        alt: `${title} - Media ${index + 1}`,
      }
    })
}

/**
 * Renders changelog media as a slideshow with thumbnail navigation and an optional lightbox.
 *
 * @param props {ChangelogMediaGalleryProps} The gallery metadata + filenames from frontmatter.
 * @returns {JSX.Element | null} A media gallery when media exists; otherwise null.
 */
export function ChangelogMediaGallery(props: ChangelogMediaGalleryProps) {
  const { title, productSlug, fileNames } = props

  const items = React.useMemo(
    () => buildChangelogMediaItems({ title, productSlug, fileNames }),
    [title, productSlug, fileNames]
  )

  const [activeIndex, setActiveIndex] = React.useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false)

  const activeItem = items[activeIndex]
  const hasMultiple = items.length > 1

  /**
   * Moves the active slide to the previous item (wrapping around).
   *
   * @returns {void} No return value.
   */
  function goPrev(): void {
    setActiveIndex((current) => (current - 1 + items.length) % items.length)
  }

  /**
   * Moves the active slide to the next item (wrapping around).
   *
   * @returns {void} No return value.
   */
  function goNext(): void {
    setActiveIndex((current) => (current + 1) % items.length)
  }

  /**
   * Opens the lightbox overlay for the currently active item.
   *
   * @returns {void} No return value.
   */
  function openLightbox(): void {
    setIsLightboxOpen(true)
  }

  /**
   * Closes the lightbox overlay.
   *
   * @returns {void} No return value.
   */
  function closeLightbox(): void {
    setIsLightboxOpen(false)
  }

  React.useEffect(() => {
    if (!isLightboxOpen) return

    // Prevent background scroll while the overlay is open.
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isLightboxOpen])

  React.useEffect(() => {
    if (!isLightboxOpen) return

    /**
     * Handles keyboard navigation within the lightbox overlay.
     *
     * @param event {KeyboardEvent} The keydown event from the browser.
     * @returns {void} No return value.
     */
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault()
        closeLightbox()
        return
      }

      if (!hasMultiple) return

      if (event.key === "ArrowLeft") {
        event.preventDefault()
        goPrev()
      }

      if (event.key === "ArrowRight") {
        event.preventDefault()
        goNext()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isLightboxOpen, hasMultiple, items.length])

  if (items.length === 0 || !activeItem) return null

  return (
    <div className="flex flex-col gap-3">
      {/* Main media area (clickable to open lightbox) */}
      <div className="relative">
        {activeItem.type === "video" ? (
          <video
            src={activeItem.src}
            controls
            className="w-full rounded-lg border border-border bg-black"
            // Note: video controls already provide a great UX; we still allow clicking the
            // container area for opening the lightbox on non-control clicks.
            onClick={() => openLightbox()}
          />
        ) : (
          <button
            type="button"
            onClick={() => openLightbox()}
            className="block w-full"
            aria-label="Open media in a larger view"
          >
            <img
              src={activeItem.src}
              alt={activeItem.alt}
              className="w-full rounded-lg border border-border"
              loading="lazy"
            />
          </button>
        )}

        {/* Prev/next buttons (only when multiple items exist) */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => goPrev()}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-border bg-background/80 backdrop-blur px-3 py-2 text-sm hover:bg-background"
              aria-label="Previous media"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goNext()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-border bg-background/80 backdrop-blur px-3 py-2 text-sm hover:bg-background"
              aria-label="Next media"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip (scrollable + clickable) */}
      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item, index) => {
            const isActive = index === activeIndex

            return (
              <button
                key={`${item.fileName}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={[
                  "shrink-0 rounded-md border transition-colors",
                  isActive ? "border-foreground" : "border-border hover:border-foreground/50",
                ].join(" ")}
                aria-label={`View media ${index + 1} of ${items.length}`}
                aria-current={isActive ? "true" : "false"}
              >
                {item.type === "video" ? (
                  <div className="h-14 w-24 grid place-items-center bg-muted text-muted-foreground rounded-md">
                    {/* Simple video indicator for thumbnails */}
                    <span className="text-xs">Video</span>
                  </div>
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="h-14 w-24 object-cover rounded-md"
                    loading="lazy"
                  />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Lightbox overlay */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Media viewer"
          onMouseDown={(event) => {
            // Close when clicking the backdrop, but not when clicking inside the content.
            if (event.target === event.currentTarget) closeLightbox()
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-5xl">
              <button
                type="button"
                onClick={() => closeLightbox()}
                className="absolute -top-10 right-0 rounded-md border border-white/20 bg-black/40 px-3 py-1.5 text-sm text-white hover:bg-black/60"
                aria-label="Close media viewer"
              >
                Close
              </button>

              {activeItem.type === "video" ? (
                <video
                  src={activeItem.src}
                  controls
                  className="w-full max-h-[80vh] rounded-lg border border-white/10 bg-black"
                  autoPlay
                />
              ) : (
                <img
                  src={activeItem.src}
                  alt={activeItem.alt}
                  className="w-full max-h-[80vh] object-contain rounded-lg border border-white/10 bg-black"
                />
              )}

              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={() => goPrev()}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-sm text-white hover:bg-black/60"
                    aria-label="Previous media"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => goNext()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-sm text-white hover:bg-black/60"
                    aria-label="Next media"
                  >
                    ›
                  </button>
                </>
              )}

              {/* Small counter helps users understand it is a slideshow */}
              {hasMultiple && (
                <div className="mt-3 text-center text-xs text-white/80">
                  {activeIndex + 1} / {items.length}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

