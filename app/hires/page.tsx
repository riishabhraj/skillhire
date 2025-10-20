import { PageHeader } from "@/components/page-header"
import { SectionCard } from "@/components/section-card"
import { EmptyState } from "@/components/empty-state"

const HIRES = [{ id: "h1", name: "Jane Doe", role: "Frontend Engineer", company: "Acme Corp" }]

export default function HiresPage() {
  return (
    <main>
      <PageHeader title="Hires" description="A log of completed placements." />
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        {HIRES.length ? (
          <SectionCard>
            <ul className="divide-y divide-border">
              {HIRES.map((h) => (
                <li key={h.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{h.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.role} • {h.company}
                    </p>
                  </div>
                  <span className="rounded-md border border-border px-2 py-1 text-xs">Completed</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : (
          <EmptyState title="No hires yet" description="Once a hire is confirmed, it will show here." />
        )}
      </div>
    </main>
  )
}
