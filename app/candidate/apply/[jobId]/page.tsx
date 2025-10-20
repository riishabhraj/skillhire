"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserData } from "@/hooks/use-user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, X, Briefcase, MapPin, DollarSign, Clock, Code, Star, Users, CheckCircle } from "lucide-react"

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
  category: string
  tags: string[]
  projectEvaluationCriteria: {
    requiredProjectTypes: string[]
    minimumProjectComplexity: string
    requiredTechnologies: string[]
    preferredProjectFeatures: string[]
    projectScale: string
  }
}

export default function ApplyToJobPage({ params }: { params: { jobId: string } }) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const { userData, isLoaded } = useUserData()
  const router = useRouter()

  // Application form data
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    projects: [] as Array<{
      id: string
      title: string
      description: string
      technologies: string[]
      githubUrl: string
      liveUrl: string
      screenshots: string[]
      role: string
      duration: string
      teamSize: number
      challenges: string[]
      achievements: string[]
      complexity: "simple" | "medium" | "complex" | "enterprise"
      scale: "small" | "medium" | "large"
      features: string[]
    }>,
    skills: {
      technical: [] as Array<{
        name: string
        level: "beginner" | "intermediate" | "advanced" | "expert"
        yearsOfExperience: number
        projects: string[]
      }>,
      soft: [] as Array<{
        name: string
        examples: string[]
      }>
    },
    experience: {
      totalYears: 0,
      relevantYears: 0,
      previousRoles: [] as Array<{
        title: string
        company: string
        duration: string
        responsibilities: string[]
        achievements: string[]
      }>
    }
  })

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    technologies: [] as string[],
    githubUrl: "",
    liveUrl: "",
    role: "",
    duration: "",
    teamSize: 1,
    challenges: [] as string[],
    achievements: [] as string[],
    complexity: "medium" as "simple" | "medium" | "complex" | "enterprise",
    scale: "medium" as "small" | "medium" | "large",
    features: [] as string[]
  })

  const [newTech, setNewTech] = useState("")
  const [newChallenge, setNewChallenge] = useState("")
  const [newAchievement, setNewAchievement] = useState("")
  const [newFeature, setNewFeature] = useState("")

  useEffect(() => {
    fetchJob()
  }, [params.jobId])

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.jobId}`)
      if (!response.ok) {
        throw new Error('Job not found')
      }
      const jobData = await response.json()
      setJob(jobData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  const addProject = () => {
    if (newProject.title && newProject.description) {
      const project = {
        ...newProject,
        id: Date.now().toString()
      }
      setApplicationData(prev => ({
        ...prev,
        projects: [...prev.projects, project]
      }))
      setNewProject({
        title: "",
        description: "",
        technologies: [],
        githubUrl: "",
        liveUrl: "",
        role: "",
        duration: "",
        teamSize: 1,
        challenges: [],
        achievements: [],
        complexity: "medium",
        scale: "medium",
        features: []
      })
    }
  }

  const removeProject = (index: number) => {
    setApplicationData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }))
  }

  const addItem = (type: 'technologies' | 'challenges' | 'achievements' | 'features', value: string) => {
    if (value.trim()) {
      setNewProject(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }))
      setNewTech("")
      setNewChallenge("")
      setNewAchievement("")
      setNewFeature("")
    }
  }

  const removeItem = (type: 'technologies' | 'challenges' | 'achievements' | 'features', index: number) => {
    setNewProject(prev => ({
      ...prev,
      [type]: prev[type].filter((_: any, i: number) => i !== index)
    }))
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      setApplicationData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          technical: [
            ...prev.skills.technical,
            {
              name: newSkill.trim(),
              level: 'intermediate' as const,
              yearsOfExperience: 1,
              projects: []
            }
          ]
        }
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (index: number) => {
    setApplicationData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        technical: prev.skills.technical.filter((_, i) => i !== index)
      }
    }))
  }

  const handleSubmit = async () => {
    if (!userData || !job) {
      setError('User data or job not available')
      return
    }

    if (!applicationData.coverLetter.trim()) {
      setError('Please write a cover letter')
      return
    }

    if (applicationData.projects.length === 0) {
      setError('Please add at least one project to your application')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const requestData = {
        jobId: job._id,
        candidateId: userData.id,
        coverLetter: applicationData.coverLetter,
        projects: applicationData.projects,
        skills: applicationData.skills,
        experience: applicationData.experience
      }
      
      
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit application')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/candidate/applications')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
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

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>Job not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Application Submitted!</h3>
              <p className="text-muted-foreground">
                Your application has been submitted successfully. You'll be redirected to your applications page shortly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {job.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {job.companyName}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.remote ? 'Remote' : job.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {job.jobType}
            </span>
            {job.salary.min > 0 && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
              </span>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{job.description}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Requirements</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {job.requirements.map((req, index) => (
                <li key={index}>• {req}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, index) => (
                <Badge key={index} variant="destructive">{skill}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Project Evaluation Criteria</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Project Types:</strong> {job.projectEvaluationCriteria.requiredProjectTypes.join(', ')}</p>
              <p><strong>Technologies:</strong> {job.projectEvaluationCriteria.requiredTechnologies.join(', ')}</p>
              <p><strong>Complexity:</strong> {job.projectEvaluationCriteria.minimumProjectComplexity}</p>
              <p><strong>Scale:</strong> {job.projectEvaluationCriteria.projectScale}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Application Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter</Label>
            <Textarea
              id="coverLetter"
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              rows={4}
              value={applicationData.coverLetter}
              onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
            />
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <h4 className="font-medium">Technical Skills</h4>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a technical skill (e.g., React, Python, AWS)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                />
                <Button type="button" onClick={addSkill} disabled={!newSkill.trim()}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {applicationData.skills.technical.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill.name}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Project Portfolio */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Project Portfolio</h4>
              <span className="text-sm text-muted-foreground">
                {applicationData.projects.length} project(s) added
              </span>
            </div>

            {/* Add New Project */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project Title *</Label>
                    <Input
                      placeholder="e.g., E-commerce Platform"
                      value={newProject.title}
                      onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Your Role</Label>
                    <Input
                      placeholder="e.g., Full-stack Developer"
                      value={newProject.role}
                      onChange={(e) => setNewProject(prev => ({ ...prev, role: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Project Description *</Label>
                  <Textarea
                    placeholder="Describe the project, what it does, and your contributions..."
                    rows={3}
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>GitHub URL</Label>
                    <Input
                      placeholder="https://github.com/username/project"
                      value={newProject.githubUrl}
                      onChange={(e) => setNewProject(prev => ({ ...prev, githubUrl: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Live URL</Label>
                    <Input
                      placeholder="https://project-demo.com"
                      value={newProject.liveUrl}
                      onChange={(e) => setNewProject(prev => ({ ...prev, liveUrl: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Technologies Used</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., React, Node.js, MongoDB"
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addItem('technologies', newTech)}
                    />
                    <Button onClick={() => addItem('technologies', newTech)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newProject.technologies.map((tech, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tech}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem('technologies', index)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      placeholder="e.g., 3 months"
                      value={newProject.duration}
                      onChange={(e) => setNewProject(prev => ({ ...prev, duration: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Team Size</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newProject.teamSize}
                      onChange={(e) => setNewProject(prev => ({ ...prev, teamSize: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Complexity</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newProject.complexity}
                      onChange={(e) => setNewProject(prev => ({ ...prev, complexity: e.target.value as any }))}
                    >
                      <option value="simple">Simple</option>
                      <option value="medium">Medium</option>
                      <option value="complex">Complex</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Key Challenges</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Real-time data synchronization"
                      value={newChallenge}
                      onChange={(e) => setNewChallenge(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addItem('challenges', newChallenge)}
                    />
                    <Button onClick={() => addItem('challenges', newChallenge)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newProject.challenges.map((challenge, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {challenge}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem('challenges', index)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Key Achievements</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Improved performance by 40%"
                      value={newAchievement}
                      onChange={(e) => setNewAchievement(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addItem('achievements', newAchievement)}
                    />
                    <Button onClick={() => addItem('achievements', newAchievement)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newProject.achievements.map((achievement, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {achievement}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem('achievements', index)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button onClick={addProject} className="w-full">
                  Add Project
                </Button>
              </CardContent>
            </Card>

            {/* Added Projects */}
            {applicationData.projects.map((project, index) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeProject(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Role:</strong> {project.role}</p>
                    <p><strong>Duration:</strong> {project.duration}</p>
                    <p><strong>Team Size:</strong> {project.teamSize}</p>
                    <p><strong>Complexity:</strong> {project.complexity}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={submitting || applicationData.projects.length === 0}
            className="w-full"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Application
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
