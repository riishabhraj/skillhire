"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useUserData } from "@/hooks/use-user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Briefcase, Clock, CheckCircle, XCircle, Eye, TrendingUp, Plus } from "lucide-react"
import RoleGuard from "@/components/role-guard"
import OnboardingGuard from "@/components/onboarding-guard"

interface Application {
  _id: string
  id?: string
  jobId: {
    _id: string
    id?: string
    title: string
    companyName: string
    location: string
    remote: boolean
    jobType: string
  }
  status: 'submitted' | 'under_review' | 'shortlisted' | 'interview' | 'rejected' | 'hired'
  submittedAt: string
  timeUntilVisible?: number
  evaluation?: {
    overallScore: number
    projectScore: number
    experienceScore: number
    skillsScore: number
    shortlistStatus: 'shortlisted' | 'under_review' | 'rejected'
    feedback: string
  } | null
}

interface DashboardStats {
  totalApplications: number
  shortlistedApplications: number
  underReviewApplications: number
  rejectedApplications: number
  recentApplications: number
}

export default function CandidateDashboardPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userData, isLoaded } = useUserData()

  useEffect(() => {
    if (isLoaded && userData) {
      fetchDashboardData()
    }
  }, [isLoaded, userData])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch applications
      const response = await fetch('/api/applications')
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }
      const data = await response.json()
      setApplications(data.applications || [])

      // Calculate stats
      const totalApplications = data.applications?.length || 0
      const shortlistedApplications = data.applications?.filter((app: Application) => 
        app.status === 'shortlisted' || app.evaluation?.shortlistStatus === 'shortlisted'
      ).length || 0
      const underReviewApplications = data.applications?.filter((app: Application) => 
        app.status === 'under_review' || app.evaluation?.shortlistStatus === 'under_review'
      ).length || 0
      const rejectedApplications = data.applications?.filter((app: Application) => 
        app.status === 'rejected' || app.evaluation?.shortlistStatus === 'rejected'
      ).length || 0

      const recentApplications = data.applications?.filter((app: Application) => {
        const submittedDate = new Date(app.submittedAt)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return submittedDate >= weekAgo
      }).length || 0

      setStats({
        totalApplications,
        shortlistedApplications,
        underReviewApplications,
        rejectedApplications,
        recentApplications
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-500'
      case 'under_review':
        return 'bg-yellow-500'
      case 'interview':
        return 'bg-blue-500'
      case 'rejected':
        return 'bg-red-500'
      case 'hired':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return <CheckCircle className="h-4 w-4" />
      case 'under_review':
        return <Clock className="h-4 w-4" />
      case 'interview':
        return <Eye className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      case 'hired':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['candidate']}>
      <OnboardingGuard allowedRoles={['candidate']}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userData?.firstName || 'there'}! Here's your application overview.
          </p>
        </div>
        <Button asChild>
          <Link href="/jobs">
            <Plus className="h-4 w-4 mr-2" />
            Find Jobs
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
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
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.shortlistedApplications}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalApplications > 0 ? Math.round((stats.shortlistedApplications / stats.totalApplications) * 100) : 0}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.underReviewApplications}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting evaluation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentApplications}</div>
              <p className="text-xs text-muted-foreground">
                Applications this week
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Applications */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent Applications</h2>
          <Button variant="outline" asChild>
            <Link href="/candidate/applications">View All</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading applications...</span>
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start applying to jobs to showcase your projects and skills.
                </p>
                <Button asChild>
                  <Link href="/remote-jobs">
                    <Plus className="h-4 w-4 mr-2" />
                    Find Jobs to Apply
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {applications.slice(0, 6).map((application) => (
              <Card key={application._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight mb-2">
                        <Link 
                          href={`/jobs/${application.jobId._id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {application.jobId.title}
                        </Link>
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{application.jobId.companyName}</span>
                        <span>•</span>
                        <span>{application.jobId.remote ? 'Remote' : application.jobId.location}</span>
                        <span>•</span>
                        <span>{application.jobId.jobType}</span>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(application.status)} text-white border-0`}
                    >
                      <div className="flex items-center gap-1">
                        {getStatusIcon(application.status)}
                        {application.status.replace('_', ' ')}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {application.evaluation?.feedback && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {application.evaluation.feedback}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/jobs/${application.jobId._id}`}>
                        View Job
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={`/candidate/applications/${application._id}`}>
                        View Application
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Applied {new Date(application.submittedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Find Jobs</h3>
                  <p className="text-sm text-muted-foreground">Browse available opportunities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">My Applications</h3>
                  <p className="text-sm text-muted-foreground">Track your applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Profile</h3>
                  <p className="text-sm text-muted-foreground">Update your profile</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
        </div>
      </OnboardingGuard>
    </RoleGuard>
  )
}