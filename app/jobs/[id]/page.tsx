"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useUserData } from "@/hooks/use-user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MapPin, Briefcase, DollarSign, Clock, Users, CheckCircle, Star, Code, Target } from "lucide-react"

interface Job {
  _id: string
  id?: string
  title: string
  companyName: string
  description: string
  requirements: string[]
  preferredSkills: string[]
  requiredSkills: string[]
  experience: {
    min: number
    max: number
    level: string
  }
  location: string
  remote: boolean
  jobType: string
  salary: {
    min: number
    max: number
    currency: string
  }
  benefits: string[]
  category: string
  tags: string[]
  projectEvaluationCriteria: {
    requiredProjectTypes: string[]
    minimumProjectComplexity: string
    requiredTechnologies: string[]
    preferredProjectFeatures: string[]
    projectScale: string
  }
  postedAt: string
  totalApplications: number
  views: number
  useCareerSite: boolean
  careerSiteUrl?: string
}

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userData, isLoaded } = useUserData()

  useEffect(() => {
    fetchJob()
  }, [params.id])

  const fetchJob = async () => {
    try {
      console.log('Fetching job with ID:', params.id)
      const response = await fetch(`/api/jobs/${params.id}`)
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.log('Error response:', errorData)
        throw new Error(errorData.error || 'Job not found')
      }
      const jobData = await response.json()
      console.log('Job data received:', jobData)
      setJob(jobData)
    } catch (err) {
      console.error('Error fetching job:', err)
      setError(err instanceof Error ? err.message : 'Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading job details...</span>
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Job Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <p className="text-xl text-muted-foreground mb-4">{job.companyName}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.remote ? 'Remote' : job.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {job.jobType}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Posted {new Date(job.postedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {job.totalApplications} applications
              </span>
            </div>

            {job.salary.min > 0 && (
              <div className="flex items-center gap-1 text-lg font-semibold text-green-600 mb-4">
                <DollarSign className="h-5 w-5" />
                <span>
                  ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} {job.salary.currency}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="text-sm">
              {job.category}
            </Badge>
            {userData && (
              job.useCareerSite ? (
                <Button asChild size="lg" variant="outline">
                  <a href={job.careerSiteUrl} target="_blank" rel="noopener noreferrer">
                    Apply on Company Site
                  </a>
                </Button>
              ) : (
                <Button asChild size="lg">
                  <Link href={`/candidate/apply/${job._id}`}>
                    Apply Now
                  </Link>
                </Button>
              )
            )}
          </div>
        </div>

        {job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag, index) => (
              <Badge key={`${job._id}-tag-${index}`} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={`${job._id}-desc-${index}`} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={`${job._id}-req-${index}`} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.requiredSkills.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-red-600">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <Badge key={`${job._id}-req-skill-${index}`} variant="destructive">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {job.preferredSkills.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-blue-600">Preferred Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredSkills.map((skill, index) => (
                      <Badge key={`${job._id}-pref-skill-${index}`} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle>Experience Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Minimum</p>
                  <p className="font-semibold">{job.experience.min} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Maximum</p>
                  <p className="font-semibold">{job.experience.max} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="font-semibold capitalize">{job.experience.level}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          {job.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={`${job._id}-benefit-${index}`} className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Application Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.useCareerSite ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    This job redirects to the company's career site for applications.
                  </p>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Apply at:</strong> <a href={job.careerSiteUrl} target="_blank" rel="noopener noreferrer" className="underline">{job.careerSiteUrl}</a>
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Apply directly on our platform with project portfolio evaluation.
                  </p>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Benefits:</strong> Automatic evaluation, project-based assessment, and direct communication with the company.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Evaluation Criteria - Only show for platform applications */}
          {!job.useCareerSite && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Project Evaluation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Required Project Types</h4>
                {job.projectEvaluationCriteria.requiredProjectTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {job.projectEvaluationCriteria.requiredProjectTypes.map((type, index) => (
                      <Badge key={`${job._id}-proj-type-${index}`} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Any project type accepted</p>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Required Technologies</h4>
                {job.projectEvaluationCriteria.requiredTechnologies.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {job.projectEvaluationCriteria.requiredTechnologies.map((tech, index) => (
                      <Badge key={`${job._id}-tech-${index}`} variant="destructive" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific technologies required</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Complexity</p>
                  <p className="font-medium capitalize">
                    {job.projectEvaluationCriteria.minimumProjectComplexity}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Scale</p>
                  <p className="font-medium capitalize">
                    {job.projectEvaluationCriteria.projectScale}
                  </p>
                </div>
              </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Make sure your projects demonstrate these technologies and complexity levels to increase your chances of being shortlisted.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Application Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Application Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Applications</span>
                <span className="font-semibold">{job.totalApplications}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Views</span>
                <span className="font-semibold">{job.views}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Posted</span>
                <span className="font-semibold">
                  {new Date(job.postedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Apply Button */}
          {userData ? (
            job.useCareerSite ? (
              <Button asChild size="lg" className="w-full" variant="outline">
                <a href={job.careerSiteUrl} target="_blank" rel="noopener noreferrer">
                  Apply on Company Site
                </a>
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full">
                <Link href={`/candidate/apply/${job._id}`}>
                  Apply Now
                </Link>
              </Button>
            )
          ) : (
            <div className="space-y-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/sign-in/candidate">
                  Sign In to Apply
                </Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You need to be signed in to apply for this job
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}