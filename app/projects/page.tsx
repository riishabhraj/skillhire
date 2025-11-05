"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Loader2, Github, ExternalLink, Code, Users, Calendar, Award, Target as TargetIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  githubUrl?: string
  liveUrl?: string
  role: string
  duration: string
  teamSize: number
  challenges: string[]
  achievements: string[]
  complexity: 'simple' | 'medium' | 'complex' | 'enterprise'
  scale: 'small' | 'medium' | 'large'
  candidateName: string
  candidateId: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedComplexity, setSelectedComplexity] = useState<string>("all")

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase())) ||
      project.candidateName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesComplexity = selectedComplexity === "all" || project.complexity === selectedComplexity

    return matchesSearch && matchesComplexity
  })

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'complex':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getScaleIcon = (scale: string) => {
    switch (scale) {
      case 'small':
        return '📱'
      case 'medium':
        return '💻'
      case 'large':
        return '🏢'
      default:
        return '💼'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <TargetIcon className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Candidate Projects</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Explore real-world projects built by our talented candidates
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search by title, technology, or candidate name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground">Complexity:</label>
              <select
                value={selectedComplexity}
                onChange={(e) => setSelectedComplexity(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Levels</option>
                <option value="simple">Simple</option>
                <option value="medium">Medium</option>
                <option value="complex">Complex</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <TargetIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedComplexity !== "all" 
                ? "Try adjusting your filters" 
                : "Check back later for new projects"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                    <span className="text-2xl">{getScaleIcon(project.scale)}</span>
                  </div>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Candidate Info */}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">by</span>
                    <Link 
                      href={`/candidate/${project.candidateId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {project.candidateName}
                    </Link>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Code className="h-4 w-4" />
                      <span>{project.role}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{project.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{project.teamSize}</span>
                    </div>
                  </div>

                  {/* Complexity Badge */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getComplexityColor(project.complexity)}>
                      {project.complexity}
                    </Badge>
                    <Badge variant="outline">
                      {project.scale} scale
                    </Badge>
                  </div>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 5).map((tech, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.technologies.length - 5}
                      </Badge>
                    )}
                  </div>

                  {/* Achievements Preview */}
                  {project.achievements.length > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <Award className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground line-clamp-2">{project.achievements[0]}</p>
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Github className="h-4 w-4" />
                        <span>Code</span>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

