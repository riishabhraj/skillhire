"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useUserData } from "@/hooks/use-user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Calendar, MapPin, Briefcase, Clock, Users, CheckCircle, XCircle, Eye } from "lucide-react"

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
  coverLetter: string
  projects: Array<{
    id: string
    title: string
    description: string
    technologies: string[]
    githubUrl?: string
    liveUrl?: string
    complexity: string
    scale: string
  }>
  skills: {
    technical: Array<{
      name: string
      level: string
      yearsOfExperience: number
    }>
    soft: Array<{
      name: string
      examples: string[]
    }>
  }
  experience: {
    totalYears: number
    relevantYears: number
    previousRoles: Array<{
      title: string
      company: string
      duration: string
      responsibilities: string[]
      achievements: string[]
    }>
  }
  evaluation?: {
    overallScore: number
    projectScore: number
    experienceScore: number
    skillsScore: number
    shortlistStatus: 'shortlisted' | 'under_review' | 'rejected'
    feedback: string
    detailedFeedback?: {
      projectFeedback: string
      experienceFeedback: string
      skillsFeedback: string
      recommendations: string[]
    }
  }
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userData, isLoaded } = useUserData()

  useEffect(() => {
    if (isLoaded && userData && params.id) {
      fetchApplication()
    }
  }, [isLoaded, userData, params.id])

  const fetchApplication = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/applications/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Application not found')
        } else {
          setError('Failed to fetch application')
        }
        return
      }

      const data = await response.json()
      setApplication(data.application)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading application...</span>
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
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/candidate/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>Application not found</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/candidate/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="outline">
          <Link href="/candidate/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Application Details</h1>
          <p className="text-muted-foreground">View your application status and details</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{application.jobId.title}</h3>
                <p className="text-muted-foreground">{application.jobId.companyName}</p>
                <Badge variant="outline" className="mt-2">{application.jobId.category}</Badge>
              </div>
              
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
                <div className="flex items-center gap-1 text-green-600">
                  <span className="font-semibold">
                    ${application.jobId.salary.min.toLocaleString()} - ${application.jobId.salary.max.toLocaleString()} {application.jobId.salary.currency}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cover Letter */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Letter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{application.coverLetter}</p>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Projects Submitted</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.projects.map((project, index) => (
                <div key={project.id || index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">{project.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Complexity: {project.complexity}</span>
                    <span>Scale: {project.scale}</span>
                    {project.githubUrl && (
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        GitHub
                      </a>
                    )}
                    {project.liveUrl && (
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {application.skills.technical.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill.name} ({skill.level})
                    </Badge>
                  ))}
                </div>
              </div>
              
              {application.skills.soft.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Soft Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {application.skills.soft.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Evaluation Results */}
        <div className="space-y-6">
          {application.evaluation && (
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{application.evaluation.overallScore}/100</div>
                    <div className="text-sm text-muted-foreground">Overall</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{application.evaluation.projectScore}/100</div>
                    <div className="text-sm text-muted-foreground">Projects</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{application.evaluation.skillsScore}/100</div>
                    <div className="text-sm text-muted-foreground">Skills</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{application.evaluation.experienceScore}/100</div>
                    <div className="text-sm text-muted-foreground">Experience</div>
                  </div>
                </div>
                
                {application.evaluation.feedback && (
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Feedback</h4>
                    <p className="text-sm">{application.evaluation.feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(application.status)} text-white border-0`}
                  >
                    {application.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Applied</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(application.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
