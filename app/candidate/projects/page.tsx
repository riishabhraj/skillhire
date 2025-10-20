import { PageHeader } from "@/components/page-header"
import { SectionCard } from "@/components/section-card"
import { EmptyState } from "@/components/empty-state"
import { requireCandidate } from "@/lib/auth"
import Link from "next/link"
import { Plus, Code, CheckCircle, Clock, Eye } from "lucide-react"

const PROJECTS = [
  {
    id: "1",
    title: "E-commerce Dashboard",
    company: "Acme Corp",
    status: "Submitted",
    submittedAt: "3 days ago",
    description: "Build a responsive dashboard with React and TypeScript",
  },
  {
    id: "2",
    title: "API Integration",
    company: "TechStart",
    status: "In Progress",
    submittedAt: "1 week ago",
    description: "Create a REST API with Node.js and PostgreSQL",
  },
  {
    id: "3",
    title: "Mobile App UI",
    company: "InnovateLab",
    status: "Completed",
    submittedAt: "2 weeks ago",
    description: "Design and implement a mobile app interface",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Submitted":
      return <Clock className="h-4 w-4 text-blue-500" />
    case "In Progress":
      return <Code className="h-4 w-4 text-yellow-500" />
    case "Completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Submitted":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "In Progress":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "Completed":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default async function ProjectsPage() {
  // This will redirect if user is not a candidate
  await requireCandidate()

  return (
    <main>
      <PageHeader 
        title="My Projects" 
        description="Manage your project submissions and track their progress."
        actions={
          <Link
            href="/candidate/projects/create"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        }
      />
      
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        {PROJECTS.length === 0 ? (
          <EmptyState 
            title="No projects yet" 
            description="Start working on project submissions to showcase your skills."
            action={
              <Link
                href="/candidate/projects/create"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Create Project
              </Link>
            }
          />
        ) : (
          <SectionCard>
            <div className="space-y-4">
              {PROJECTS.map((project) => (
                <div key={project.id} className="rounded-lg border border-border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(project.status)}
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                      </div>
                      <p className="text-muted-foreground mb-2">{project.company}</p>
                      <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                      
                      <div className="text-sm text-muted-foreground">
                        Submitted: {project.submittedAt}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <div className="flex gap-2">
                        <Link
                          href={`/candidate/projects/${project.id}`}
                          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {project.status === "In Progress" && (
                          <Link
                            href={`/candidate/projects/${project.id}/edit`}
                            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                          >
                            Continue
                          </Link>
                        )}
                      </div>
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
