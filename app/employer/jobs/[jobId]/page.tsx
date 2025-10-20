"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Briefcase, MapPin, CalendarDays } from "lucide-react"

interface Job {
  _id: string
  title: string
  companyName: string
  description: string
  location: string
  remote: boolean
  jobType: string
  category: string
  requiredSkills?: string[]
  preferredSkills?: string[]
  postedAt: string
  status: "active" | "paused" | "closed"
}

export default function EmployerJobDetailsPage() {
  const params = useParams<{ jobId: string }>()
  const jobId = (params?.jobId as string) || ""
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) return
    const fetchJob = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/jobs/${jobId}`)
        if (!res.ok) throw new Error("Failed to fetch job")
        const data = await res.json()
        setJob(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load job")
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [jobId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading job...</span>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error || "Job not found"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/employer/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline">
          <Link href="/employer/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Link>
        </Button>
        <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>{job.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{job.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.jobType}</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.remote ? 'Remote' : job.location}</span>
            <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" />Posted {new Date(job.postedAt).toLocaleDateString()}</span>
          </div>

          <div>
            <h3 className="font-medium mb-1">About the role</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{job.description}</p>
          </div>

          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((s, i) => (
                  <Badge key={i} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          {job.preferredSkills && job.preferredSkills.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Preferred Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.preferredSkills.map((s, i) => (
                  <Badge key={i} variant="outline">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button asChild>
              <Link href={`/employer/jobs/${job._id}/applications`}>View Applications</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


