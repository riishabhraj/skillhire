import { PageHeader } from "@/components/page-header"
import { JobCard, type Job } from "@/components/job-card"
import { EmptyState } from "@/components/empty-state"

const SAVED: Job[] = [
  {
    id: "2",
    title: "Full-stack Developer",
    company: "SkillHire",
    location: "New York, NY",
    salary: "$120k - $160k",
    tags: ["Node.js", "PostgreSQL", "AWS"],
  },
]

export default function SavedJobsPage() {
  return (
    <main>
      <PageHeader title="Saved Jobs" description="Quick access to roles you've saved." />
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {SAVED.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {SAVED.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        ) : (
          <EmptyState title="No saved jobs" description="Save roles to view them here." />
        )}
      </div>
    </main>
  )
}
