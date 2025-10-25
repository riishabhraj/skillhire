"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useUserData } from "@/hooks/use-user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Briefcase, Users, TrendingUp, Plus, Eye, BarChart3, Settings, Clock, DollarSign, MapPin } from "lucide-react"
import RoleGuard from "@/components/role-guard"

interface Job {
  _id: string
  id?: string
  title: string
  companyName: string
  description: string
  location: string
  remote: boolean
  jobType: string
  category: string
  salary: {
    min: number
    max: number
    currency: string
  }
  totalApplications: number
  shortlistedApplications: number
  postedAt: string
  status: 'active' | 'paused' | 'closed'
}

interface DashboardStats {
  totalJobs: number
  totalApplications: number
  shortlistedCandidates: number
  activeJobs: number
  recentApplications: number
  averageScore: number
}

export default function EmployerDashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activatingJobId, setActivatingJobId] = useState<string | null>(null)
  const [freeJobsRemaining, setFreeJobsRemaining] = useState(0)
  const [isEligibleForFree, setIsEligibleForFree] = useState(false)
  const { userData, isLoaded } = useUserData()

  useEffect(() => {
    if (isLoaded && userData) {
      fetchDashboardData()
      fetchFreeJobsCount()
    }
  }, [isLoaded, userData])

  const fetchFreeJobsCount = async () => {
    try {
      const response = await fetch('/api/employer/free-jobs-count')
      if (response.ok) {
        const data = await response.json()
        setFreeJobsRemaining(data.freeJobsRemaining)
        setIsEligibleForFree(data.isEligibleForFree)
      }
    } catch (error) {
      console.error('Error fetching free jobs count:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch jobs posted by this employer
      const jobsResponse = await fetch('/api/employer/jobs')
      if (!jobsResponse.ok) {
        throw new Error('Failed to fetch jobs')
      }
      const jobsData = await jobsResponse.json()
      setJobs(jobsData.jobs || [])

      // Calculate stats
      const totalJobs = jobsData.jobs?.length || 0
      const totalApplications = jobsData.jobs?.reduce((sum: number, job: Job) => sum + (job.totalApplications || 0), 0) || 0
      const shortlistedCandidates = jobsData.jobs?.reduce((sum: number, job: Job) => sum + (job.shortlistedApplications || 0), 0) || 0
      const activeJobs = jobsData.jobs?.filter((job: Job) => job.status === 'active').length || 0
      
      setStats({
        totalJobs,
        totalApplications,
        shortlistedCandidates,
        activeJobs,
        recentApplications: 0, // TODO: Calculate recent applications
        averageScore: 0 // TODO: Calculate average score
      })

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleActivateJob = async (jobId: string) => {
    try {
      setActivatingJobId(jobId)
      const response = await fetch(`/api/jobs/${jobId}/activate`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to activate job')
      }

      // Refresh dashboard data
      await fetchDashboardData()
      alert('Job activated successfully!')
    } catch (err) {
      console.error('Error activating job:', err)
      alert('Failed to activate job. Please try again.')
    } finally {
      setActivatingJobId(null)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['employer']}>
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {userData?.firstName}! Here's your hiring overview.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeJobs} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {stats.recentApplications} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.shortlistedCandidates}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalApplications > 0 ? Math.round((stats.shortlistedCandidates / stats.totalApplications) * 100) : 0}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}/100</div>
              <p className="text-xs text-muted-foreground">
                Candidate quality
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Free Jobs Counter */}
      {isEligibleForFree && (
        <div className="mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600 text-lg">🎉</span>
              <h3 className="text-green-800 font-medium">Free Job Posts Available!</h3>
            </div>
            <p className="text-green-700 text-sm">
              You have <span className="font-semibold">{freeJobsRemaining} free job posts</span> remaining. 
              After that, jobs will cost $99 (Basic) or $128 (Premium).
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/employer/post-job">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/employer/candidates">
              <Users className="h-4 w-4 mr-2" />
              View Candidates
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/employer/settings">
              <Settings className="h-4 w-4 mr-2" />
              Evaluation Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Job Postings</h2>
          <Button asChild variant="outline">
            <Link href="/employer/jobs">View All</Link>
          </Button>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start building your team by posting your first job opening.
              </p>
              <Button asChild>
                <Link href="/employer/post-job">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 6).map((job) => (
              <Card key={job._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {job.companyName} • {job.remote ? 'Remote' : job.location}
                      </p>
                    </div>
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.jobType}
                    </span>
                    {job.salary.min > 0 && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${job.salary.min.toLocaleString()}+
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {job.totalApplications} applications
                    </span>
                    <span className="text-green-600 font-medium">
                      {job.shortlistedApplications} shortlisted
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild size="sm">
                      <Link href={`/employer/jobs/${job._id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/employer/jobs/${job._id}/applications`}>
                        Applications
                      </Link>
                    </Button>
                  </div>
                  
                  {job.status === 'paused' && (
                    <Button 
                      onClick={() => handleActivateJob(job._id)}
                      disabled={activatingJobId === job._id}
                      variant="default"
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {activatingJobId === job._id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Activating...
                        </>
                      ) : (
                        <>
                          Activate Job (Test Mode)
                        </>
                      )}
                    </Button>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Posted {new Date(job.postedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
    </RoleGuard>
  )
}