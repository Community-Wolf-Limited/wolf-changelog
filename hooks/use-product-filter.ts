"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback, useTransition } from "react"

export function useProductFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const currentProduct = searchParams.get("product")

  const setProduct = useCallback(
    (product: string | null) => {
      const params = new URLSearchParams(searchParams.toString())

      if (product === null) {
        params.delete("product")
      } else {
        params.set("product", product)
      }

      const queryString = params.toString()
      const url = queryString ? `${pathname}?${queryString}` : pathname

      startTransition(() => {
        router.replace(url, { scroll: false })
        router.refresh()
      })
    },
    [searchParams, router, pathname]
  )

  return { currentProduct, setProduct }
}
