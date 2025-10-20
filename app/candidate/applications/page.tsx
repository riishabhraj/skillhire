"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useUserData } from "@/hooks/use-user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Clock, CheckCircle, XCircle, Eye, Briefcase, MapPin, Calendar } from "lucide-react"

interface Application {
  _id: string
  jobId: {
    _id: string
    title: string
    companyName: string
    location: string
    remote: boolean
    jobType: string
    category: string
    salary: {
      min: number
      max: number
      currency: string
    }
    postedAt: string
  }
  status: 'submitted' | 'under_review' | 'shortlisted' | 'interview' | 'rejected' | 'hired'
  submittedAt: string
  evaluation?: {
    overallScore: number
    projectScore: number
    experienceScore: number
    skillsScore: number
    shortlistStatus: 'shortlisted' | 'under_review' | 'rejected'
    feedback: string
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userData, isLoaded } = useUserData()

  useEffect(() => {
    if (isLoaded && userData) {
      fetchApplications()
    }
  }, [isLoaded, userData])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/applications')
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }

      const data = await response.json()
      setApplications(data.applications || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'under_review':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'interview':
        return <Eye className="h-4 w-4 text-blue-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'hired':
        return <CheckCircle className="h-4 w-4 text-purple-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'interview':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'hired':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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
        <span className="ml-2">Loading applications...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">
          Track the status of your job applications and project submissions.
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start applying to jobs to see your applications here.
            </p>
            <Button asChild>
              <Link href="/jobs">
                Browse Jobs
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <Card key={application._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(application.status)}
                      <h3 className="text-lg font-semibold">{application.jobId.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-2">{application.jobId.companyName}</p>
                    <Badge variant="outline" className="mb-3">{application.jobId.category}</Badge>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {application.jobId.remote ? 'Remote' : application.jobId.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {application.jobId.jobType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Applied {new Date(application.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {application.jobId.salary.min > 0 && (
                      <div className="mt-2 text-sm text-green-600">
                        ${application.jobId.salary.min.toLocaleString()} - ${application.jobId.salary.max.toLocaleString()} {application.jobId.salary.currency}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(application.status)}`}
                    >
                      {application.status.replace('_', ' ')}
                    </Badge>
                    
                    {application.evaluation && (
                      <div className="text-center">
                        <div className="text-lg font-bold">{application.evaluation.overallScore}/100</div>
                        <div className="text-xs text-muted-foreground">Overall Score</div>
                      </div>
                    )}
                    
                    <Button asChild variant="outline">
                      <Link href={`/candidate/applications/${application._id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}