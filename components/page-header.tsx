import type { ReactNode } from "react"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="w-full border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="flex gap-2">{actions}</div> : null}
        </div>
      </div>
    </header>
  )
}
