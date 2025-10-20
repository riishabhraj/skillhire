import type { ReactNode } from "react"

export function SectionCard({
  title,
  children,
  footer,
}: {
  title?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-card text-card-foreground">
      {title ? (
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-pretty text-base font-medium">{title}</h2>
        </div>
      ) : null}
      <div className="px-4 py-4">{children}</div>
      {footer ? <div className="border-t border-border px-4 py-3">{footer}</div> : null}
    </section>
  )
}
