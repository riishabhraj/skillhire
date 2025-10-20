"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function FilterBar() {
  const router = useRouter()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get("q") ?? "")
  const [loc, setLoc] = useState(params.get("loc") ?? "")

  function apply() {
    const query = new URLSearchParams()
    if (q) query.set("q", q)
    if (loc) query.set("loc", loc)
    router.push(`/jobs?${query.toString()}`)
  }

  return (
    <div className="flex w-full flex-col gap-2 md:flex-row">
      <input
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-primary"
        placeholder="Search roles, companies..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search query"
      />
      <input
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-primary md:max-w-xs"
        placeholder="Location"
        value={loc}
        onChange={(e) => setLoc(e.target.value)}
        aria-label="Location"
      />
      <button
        onClick={apply}
        className="rounded-md border border-border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 md:w-auto"
      >
        Apply
      </button>
    </div>
  )
}
