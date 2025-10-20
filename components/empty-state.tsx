import type { ReactNode } from "react"

export function EmptyState({
  title = "Nothing to show",
  description,
  action,
}: {
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
      <h3 className="text-lg font-medium">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
