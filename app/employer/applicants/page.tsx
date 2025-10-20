import { PageHeader } from "@/components/page-header"
import { SectionCard } from "@/components/section-card"
import { EmptyState } from "@/components/empty-state"
import { requireEmployer } from "@/lib/auth"

const APPLICANTS = [
  { id: "a1", name: "Jane Doe", role: "Frontend Engineer", status: "New" },
  { id: "a2", name: "John Smith", role: "Full-stack Developer", status: "Interviewing" },
]

export default async function ApplicantsPage() {
  // This will redirect if user is not an employer
  await requireEmployer()
  return (
    <main>
      <PageHeader title="Applicants" description="Review and manage applicants for your roles." />
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        {APPLICANTS.length === 0 ? (
          <EmptyState title="No applicants yet" description="You'll see candidates here as they apply." />
        ) : (
          <SectionCard>
            <ul className="divide-y divide-border">
              {APPLICANTS.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.role}</p>
                  </div>
                  <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs">{a.status}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </div>
    </main>
  )
}
