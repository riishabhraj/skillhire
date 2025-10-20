import { PageHeader } from "@/components/page-header"
import { SectionCard } from "@/components/section-card"
import { EmptyState } from "@/components/empty-state"
import { requireCandidate } from "@/lib/auth"
import Link from "next/link"
import { Clock, CheckCircle, XCircle } from "lucide-react"

const APPLICATIONS = [
  {
    id: "1",
    company: "Acme Corp",
    role: "Senior Frontend Engineer",
    status: "Under Review",
    appliedAt: "3 days ago",
    projectStatus: "Submitted",
  },
  {
    id: "2",
    company: "TechStart",
    role: "Full-stack Developer",
    status: "Interview Scheduled",
    appliedAt: "1 week ago",
    projectStatus: "Approved",
  },
  {
    id: "3",
    company: "InnovateLab",
    role: "React Developer",
    status: "Rejected",
    appliedAt: "2 weeks ago",
    projectStatus: "Rejected",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Under Review":
      return <Clock className="h-4 w-4 text-yellow-500" />
    case "Interview Scheduled":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "Rejected":
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Under Review":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "Interview Scheduled":
      return "bg-green-100 text-green-800 border-green-200"
    case "Rejected":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default async function ApplicationsPage() {
  // This will redirect if user is not a candidate
  await requireCandidate()

  return (
    <main>
      <PageHeader 
        title="My Applications" 
        description="Track the status of your job applications and project submissions."
      />
      
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        {APPLICATIONS.length === 0 ? (
          <EmptyState 
            title="No applications yet" 
            description="Start applying to jobs to see your applications here."
            action={
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Browse Jobs
              </Link>
            }
          />
        ) : (
          <SectionCard>
            <div className="space-y-4">
              {APPLICATIONS.map((application) => (
                <div key={application.id} className="rounded-lg border border-border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(application.status)}
                        <h3 className="text-lg font-semibold">{application.role}</h3>
                      </div>
                      <p className="text-muted-foreground mb-3">{application.company}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Applied:</span> {application.appliedAt}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Project:</span> {application.projectStatus}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                      <Link
                        href={`/candidate/applications/${application.id}`}
                        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </main>
  )
}
