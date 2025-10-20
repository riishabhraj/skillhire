import { PageHeader } from "@/components/page-header"
import { SectionCard } from "@/components/section-card"
import { EmptyState } from "@/components/empty-state"

const REQUESTS = [
  { id: "i1", role: "Senior Frontend Engineer", company: "Acme Corp", status: "Pending" },
  { id: "i2", role: "Full-stack Developer", company: "SkillHire", status: "Scheduled" },
]

export default function InterviewsPage() {
  return (
    <main>
      <PageHeader title="Interview Requests" description="Track interview invites and statuses." />
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        {REQUESTS.length ? (
          <SectionCard>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {REQUESTS.map((r) => (
                <li key={r.id} className="rounded-md border border-border p-4">
                  <p className="text-sm font-medium">{r.role}</p>
                  <p className="text-xs text-muted-foreground">{r.company}</p>
                  <span className="mt-2 inline-block rounded-full border border-border bg-muted px-2 py-0.5 text-xs">
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : (
          <EmptyState title="No interview requests" description="Requests will appear here." />
        )}
      </div>
    </main>
  )
}
