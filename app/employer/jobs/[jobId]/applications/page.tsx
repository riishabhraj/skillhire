"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useUserData } from "@/hooks/use-user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, User, Calendar, Star, Code, Briefcase, MapPin } from "lucide-react"

interface Job {
  _id: string
  title: string
  companyName: string
  description: string
  location: string
  remote: boolean
  jobType: string
  category: string
  postedAt: string
}

interface Application {
  _id: string
  candidateId: string
  jobId: string
  coverLetter: string
  projects: Array<{
    id: string
    title: string
    description: string
    technologies: string[]
    githubUrl: string
    liveUrl: string
    role: string
    duration: string
    teamSize: number
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
    }>
  }
  status: string
  submittedAt: string
  evaluation?: {
    overallScore: number
    shortlistStatus: string
    feedback: string
  }
}

export default function JobApplicationsPage() {
  const [job, setJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { userData, isLoaded } = useUserData()
  const params = useParams<{ jobId: string }>()
  const jobId = (params?.jobId as string) || ""

  useEffect(() => {
    if (isLoaded && userData && jobId) {
      fetchData()
    }
  }, [isLoaded, userData, jobId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch job details
      const jobResponse = await fetch(`/api/jobs/${jobId}`)
      if (!jobResponse.ok) {
        throw new Error('Job not found')
      }
      const jobData = await jobResponse.json()
      setJob(jobData)

      // Fetch applications for this job
      const applicationsResponse = await fetch(`/api/employer/jobs/${jobId}/applications`)
      if (!applicationsResponse.ok) {
        throw new Error('Failed to fetch applications')
      }
      const applicationsData = await applicationsResponse.json()
      setApplications(applicationsData.applications || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleViewProfile = (candidateId: string) => {
    // Open a placeholder view for now; integrate a dedicated profile page later
    window.open(`/employer/candidates?candidateId=${candidateId}`, '_blank')
  }

  const updateApplicationStatus = async (applicationId: string, status: 'shortlisted' | 'rejected') => {
    try {
      setActionLoading(applicationId)
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update application')
      }

      // Optimistically update local state
      setApplications(prev => prev.map(app => app._id === applicationId ? { ...app, status } : app))
    } catch (e) {
      console.error('Failed to update application', e)
      alert(e instanceof Error ? e.message : 'Failed to update application')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'shortlisted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading applications...</span>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Job not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/employer/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Applications for {job.title}</h1>
            <p className="text-lg text-muted-foreground mb-4">{job.companyName}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.remote ? 'Remote' : job.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {job.jobType}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Posted {new Date(job.postedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <Badge variant="outline" className="text-sm">
            {applications.length} Application{applications.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No applications yet</h3>
            <p className="text-muted-foreground">
              Applications will appear here as candidates apply to this job.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <Card key={application._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      Application #{application._id.slice(-6)}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Applied {new Date(application.submittedAt).toLocaleDateString()}
                      </span>
                      {application.evaluation?.overallScore && (
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          Score: {application.evaluation.overallScore}/100
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Cover Letter */}
                <div>
                  <h4 className="font-medium mb-2">Cover Letter</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {application.coverLetter}
                  </p>
                </div>

                {/* Projects */}
                {application.projects.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Projects ({application.projects.length})
                    </h4>
                    <div className="space-y-4">
                      {application.projects.map((project, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium">{project.title}</h5>
                            <Badge variant="outline" className="text-xs">
                              {project.complexity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.technologies.map((tech, techIndex) => (
                              <Badge key={techIndex} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                            <div>
                              <span className="font-medium">Role:</span> {project.role}
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span> {project.duration}
                            </div>
                            <div>
                              <span className="font-medium">Team Size:</span> {project.teamSize}
                            </div>
                            <div>
                              <span className="font-medium">Scale:</span> {project.scale}
                            </div>
                          </div>
                          {(project.githubUrl || project.liveUrl) && (
                            <div className="flex gap-2 mt-3">
                              {project.githubUrl && (
                                <Button asChild size="sm" variant="outline">
                                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                    View Code
                                  </a>
                                </Button>
                              )}
                              {project.liveUrl && (
                                <Button asChild size="sm" variant="outline">
                                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                    Live Demo
                                  </a>
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {application.skills.technical.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {application.skills.technical.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill.name} ({skill.level})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {application.experience.totalYears > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Experience</h4>
                    <div className="text-sm text-muted-foreground">
                      <p>Total: {application.experience.totalYears} years</p>
                      <p>Relevant: {application.experience.relevantYears} years</p>
                    </div>
                  </div>
                )}

                {/* Evaluation */}
                {application.evaluation && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Evaluation</h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4" />
                        <span className="font-medium">Score: {application.evaluation.overallScore}/100</span>
                      </div>
                      {application.evaluation.feedback && (
                        <p className="text-sm text-muted-foreground">
                          {application.evaluation.feedback}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button size="sm" onClick={() => handleViewProfile(application.candidateId)}>
                    View Full Profile
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateApplicationStatus(application._id, 'shortlisted')}
                    disabled={actionLoading === application._id || application.status === 'shortlisted'}
                  >
                    {actionLoading === application._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Shortlist'
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateApplicationStatus(application._id, 'rejected')}
                    disabled={actionLoading === application._id || application.status === 'rejected'}
                  >
                    {actionLoading === application._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Reject'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
