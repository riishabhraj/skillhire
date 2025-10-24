"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useUserData } from "@/hooks/use-user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, User, Calendar, Star, Code, Briefcase, MapPin, ExternalLink, Github } from "lucide-react"

interface Candidate {
  _id: string
  firstName: string
  lastName: string
  email: string
  profilePicture?: string
  role: string
  candidateProfile?: {
    location?: string
    skills?: {
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
    experience?: {
      totalYears: number
      relevantYears: number
      previousRoles: Array<{
        title: string
        company: string
        duration: string
      }>
    }
  }
  applications?: Array<{
    _id: string
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
      projectScore: number
      experienceScore: number
      skillsScore: number
      shortlistStatus: string
      feedback: string
    }
  }>
}

export default function CandidateProfilePage() {
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userData, isLoaded } = useUserData()
  const params = useParams<{ candidateId: string }>()
  const candidateId = (params?.candidateId as string) || ""

  useEffect(() => {
    if (isLoaded && userData && candidateId) {
      fetchCandidateData()
    }
  }, [isLoaded, userData, candidateId])

  const fetchCandidateData = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/employer/candidates/${candidateId}`)
      if (!response.ok) {
        throw new Error('Candidate not found')
      }
      const data = await response.json()
      setCandidate(data.candidate)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
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
        <span className="ml-2">Loading candidate profile...</span>
      </div>
    )
  }

  if (error || !candidate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Candidate not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const latestApplication = (candidate.applications || [])
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/employer/candidates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidates
            </Link>
          </Button>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {candidate.firstName} {candidate.lastName}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">{candidate.email}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {candidate.candidateProfile?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {candidate.candidateProfile.location}
                </span>
              )}
              {candidate.candidateProfile?.experience?.totalYears && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {candidate.candidateProfile.experience.totalYears} years experience
                </span>
              )}
            </div>
          </div>
          
          <Badge variant="outline" className="text-sm">
            {candidate.applications?.length || 0} Application{(candidate.applications?.length || 0) !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Application */}
          {latestApplication && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Latest Application
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Applied {new Date(latestApplication.submittedAt).toLocaleDateString()}
                    </span>
                    {latestApplication.evaluation?.overallScore && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        Score: {latestApplication.evaluation.overallScore}/100
                      </span>
                    )}
                  </div>
                  <Badge className={getStatusColor(latestApplication.status)}>
                    {latestApplication.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Cover Letter */}
                {latestApplication.coverLetter && (
                  <div>
                    <h4 className="font-medium mb-2">Cover Letter</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{latestApplication.coverLetter}</p>
                    </div>
                  </div>
                )}

                {/* Projects */}
                {latestApplication.projects.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Projects ({latestApplication.projects.length})
                    </h4>
                    <div className="space-y-4">
                      {latestApplication.projects.map((project, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h5 className="font-medium">{project.title}</h5>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                {project.complexity}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {project.scale}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {project.description}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-xs">
                            <div>
                              <span className="font-medium">Role:</span> {project.role}
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span> {project.duration}
                            </div>
                            <div>
                              <span className="font-medium">Team Size:</span> {project.teamSize}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {project.technologies.map((tech, techIndex) => (
                              <Badge key={techIndex} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            {project.githubUrl && (
                              <Button asChild size="sm" variant="outline">
                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                  <Github className="h-3 w-3 mr-1" />
                                  GitHub
                                </a>
                              </Button>
                            )}
                            {project.liveUrl && (
                              <Button asChild size="sm" variant="outline">
                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Live Demo
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {latestApplication.skills.technical.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Technical Skills</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {latestApplication.skills.technical.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{skill.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {skill.level}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {skill.yearsOfExperience} years
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Soft Skills */}
                {latestApplication.skills.soft.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Soft Skills</h4>
                    <div className="space-y-3">
                      {latestApplication.skills.soft.map((skill, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <h5 className="font-medium mb-2">{skill.name}</h5>
                          <div className="flex flex-wrap gap-1">
                            {skill.examples.map((example, exampleIndex) => (
                              <Badge key={exampleIndex} variant="secondary" className="text-xs">
                                {example}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {latestApplication.experience.previousRoles.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Work Experience</h4>
                    <div className="space-y-3">
                      {latestApplication.experience.previousRoles.map((role, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium">{role.title}</h5>
                              <p className="text-sm text-muted-foreground">{role.company}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{role.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evaluation */}
                {latestApplication.evaluation && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Evaluation Results</h4>
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {latestApplication.evaluation.overallScore}
                          </div>
                          <div className="text-xs text-muted-foreground">Overall</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {latestApplication.evaluation.projectScore}
                          </div>
                          <div className="text-xs text-muted-foreground">Projects</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {latestApplication.evaluation.experienceScore}
                          </div>
                          <div className="text-xs text-muted-foreground">Experience</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {latestApplication.evaluation.skillsScore}
                          </div>
                          <div className="text-xs text-muted-foreground">Skills</div>
                        </div>
                      </div>
                      {latestApplication.evaluation.feedback && (
                        <div>
                          <h5 className="font-medium mb-2">Feedback</h5>
                          <p className="text-sm">{latestApplication.evaluation.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Candidate Info */}
          <Card>
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Contact</h4>
                <p className="text-sm text-muted-foreground">{candidate.email}</p>
              </div>
              {candidate.candidateProfile?.location && (
                <div>
                  <h4 className="font-medium mb-2">Location</h4>
                  <p className="text-sm text-muted-foreground">{candidate.candidateProfile.location}</p>
                </div>
              )}
              {candidate.candidateProfile?.experience?.totalYears && (
                <div>
                  <h4 className="font-medium mb-2">Experience</h4>
                  <p className="text-sm text-muted-foreground">
                    {candidate.candidateProfile.experience.totalYears} years total
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {candidate.candidateProfile.experience.relevantYears} years relevant
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Applications */}
          {candidate.applications && candidate.applications.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>All Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {candidate.applications.map((application, index) => (
                    <div key={application._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Application #{application._id.slice(-6)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(application.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
