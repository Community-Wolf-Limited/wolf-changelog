"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps {
  tabs: { value: string; label: string }[]
  value: string | null
  onChange: (value: string | null) => void
  className?: string
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div
      className={cn("inline-flex flex-wrap gap-2", className)}
      role="tablist"
    >
      <button
        role="tab"
        aria-selected={value === null}
        onClick={() => onChange(null)}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-lg transition-all border",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          value === null
            ? "bg-foreground text-background border-foreground"
            : "text-muted-foreground border-border hover:text-foreground hover:border-foreground/50"
        )}
      >
        All
      </button>

      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-lg transition-all border",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === tab.value
              ? "bg-foreground text-background border-foreground"
              : "text-muted-foreground border-border hover:text-foreground hover:border-foreground/50"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
