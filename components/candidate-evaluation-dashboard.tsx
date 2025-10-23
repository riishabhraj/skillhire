"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Star, 
  Code, 
  Briefcase, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2,
  Eye,
  Download
} from "lucide-react"

interface CandidateEvaluationDashboardProps {
  jobId: string
}

interface EvaluationResult {
  applicationId: string
  candidateId: string
  overallScore: number
  shortlistStatus: 'pending' | 'shortlisted' | 'rejected' | 'under_review'
  shortlistReason: string
  strengths: string[]
  areasForImprovement: string[]
  projectScores: Array<{
    projectId: string
    technicalScore: number
    complexityScore: number
    innovationScore: number
    qualityScore: number
    relevanceScore: number
    overallProjectScore: number
    feedback: string
  }>
  skillsMatch: {
    overallSkillsScore: number
    missingSkills: string[]
    strongSkills: string[]
  }
  experienceMatch: {
    overallExperienceScore: number
    experienceGaps: string[]
    experienceStrengths: string[]
  }
  submittedAt: string
  reviewedAt: string
}

interface EvaluationStats {
  total: number
  shortlisted: number
  rejected: number
  underReview: number
  averageScore: number
}

export function CandidateEvaluationDashboard({ jobId }: CandidateEvaluationDashboardProps) {
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([])
  const [stats, setStats] = useState<EvaluationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvaluationResults()
  }, [jobId])

  const fetchEvaluationResults = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/applications/evaluate?jobId=${jobId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch evaluation results')
      }

      const data = await response.json()
      setEvaluations(data.applications || [])
      setStats(data.stats || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEvaluateAll = async () => {
    try {
      setEvaluating(true)
      const response = await fetch('/api/applications/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId })
      })

      if (!response.ok) {
        throw new Error('Failed to evaluate applications')
      }

      // Refresh results
      await fetchEvaluationResults()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setEvaluating(false)
    }
  }

  const isStatusVisible = (shortlistedAt: Date) => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - shortlistedAt.getTime()) / 36e5;
    return diffInHours >= 48;
  }

  const getStatusIcon = (status: string, shortlistedAt: Date) => {
    if (!isStatusVisible(shortlistedAt)) {
      return <Clock className="h-4 w-4 text-gray-500" />;
    }

    switch (status) {
      case 'shortlisted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'under_review':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  }

  const getStatusColor = (status: string, shortlistedAt: Date) => {
    if (!isStatusVisible(shortlistedAt)) {
      return 'bg-gray-100 text-gray-800';
    }

    switch (status) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading evaluation results...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Candidate Evaluation Dashboard</h2>
          <p className="text-muted-foreground">
            Project-based candidate evaluation and shortlisting
          </p>
        </div>
        <Button 
          onClick={handleEvaluateAll} 
          disabled={evaluating}
          className="flex items-center gap-2"
        >
          {evaluating && <Loader2 className="h-4 w-4 animate-spin" />}
          {evaluating ? 'Evaluating...' : 'Evaluate All Candidates'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Shortlisted</p>
                  <p className="text-2xl font-bold text-green-600">{stats.shortlisted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.underReview}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold">{stats.averageScore}/100</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Evaluation Results */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({evaluations.length})</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted ({stats?.shortlisted || 0})</TabsTrigger>
              <TabsTrigger value="under-review">Under Review ({stats?.underReview || 0})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats?.rejected || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {evaluations.map((evaluation) => (
                <EvaluationCard key={evaluation.applicationId} evaluation={evaluation} />
              ))}
            </TabsContent>

            <TabsContent value="shortlisted" className="space-y-4">
              {evaluations
                .filter(e => e.shortlistStatus === 'shortlisted')
                .map((evaluation) => (
                  <EvaluationCard key={evaluation.applicationId} evaluation={evaluation} />
                ))}
            </TabsContent>

            <TabsContent value="under-review" className="space-y-4">
              {evaluations
                .filter(e => e.shortlistStatus === 'under_review')
                .map((evaluation) => (
                  <EvaluationCard key={evaluation.applicationId} evaluation={evaluation} />
                ))}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {evaluations
                .filter(e => e.shortlistStatus === 'rejected')
                .map((evaluation) => (
                  <EvaluationCard key={evaluation.applicationId} evaluation={evaluation} />
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function EvaluationCard({ evaluation }: { evaluation: EvaluationResult }) {
  const [expanded, setExpanded] = useState(false)

  const isStatusVisible = (shortlistedAt: Date) => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - shortlistedAt.getTime()) / 36e5;
    return diffInHours >= 48;
  }

  const getStatusIcon = (status: string, shortlistedAt: Date) => {
    if (!isStatusVisible(shortlistedAt)) {
      return <Clock className="h-4 w-4 text-gray-500" />;
    }

    switch (status) {
      case 'shortlisted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'under_review':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  }

  const getStatusColor = (status: string, shortlistedAt: Date) => {
    if (!isStatusVisible(shortlistedAt)) {
      return 'bg-gray-100 text-gray-800';
    }

    switch (status) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(evaluation.shortlistStatus, new Date(evaluation.reviewedAt))}
              <Badge className={getStatusColor(evaluation.shortlistStatus, new Date(evaluation.reviewedAt))}>
                {evaluation.shortlistStatus.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <p className="font-medium">Candidate {evaluation.candidateId}</p>
              <p className="text-sm text-muted-foreground">
                Applied: {new Date(evaluation.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-2xl font-bold">{evaluation.overallScore}/100</p>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {expanded ? 'Hide' : 'View'} Details
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="mt-6 space-y-6 border-t pt-6">
            {/* Project Scores */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Code className="h-4 w-4" />
                Project Evaluation
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evaluation.projectScores.map((project, index) => (
                  <div key={project.projectId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Project {index + 1}</span>
                      <span className="text-sm font-bold">{project.overallProjectScore}/100</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Technical</span>
                        <span>{project.technicalScore}/100</span>
                      </div>
                      <Progress value={project.technicalScore} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Complexity</span>
                        <span>{project.complexityScore}/100</span>
                      </div>
                      <Progress value={project.complexityScore} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Quality</span>
                        <span>{project.qualityScore}/100</span>
                      </div>
                      <Progress value={project.qualityScore} className="h-1" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{project.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Match */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Skills Match
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Skills Score</span>
                    <span className="text-sm font-bold">{evaluation.skillsMatch.overallSkillsScore}/100</span>
                  </div>
                  <Progress value={evaluation.skillsMatch.overallSkillsScore} className="h-2" />
                </div>
                <div>
                  <div className="space-y-2">
                    {evaluation.skillsMatch.strongSkills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-green-600">Strong Skills</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {evaluation.skillsMatch.strongSkills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {evaluation.skillsMatch.missingSkills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-600">Missing Skills</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {evaluation.skillsMatch.missingSkills.map((skill) => (
                            <Badge key={skill} variant="destructive" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Experience Match */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Experience Match
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Experience Score</span>
                    <span className="text-sm font-bold">{evaluation.experienceMatch.overallExperienceScore}/100</span>
                  </div>
                  <Progress value={evaluation.experienceMatch.overallExperienceScore} className="h-2" />
                </div>
                <div>
                  <div className="space-y-2">
                    {evaluation.experienceMatch.experienceStrengths.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-green-600">Experience Strengths</p>
                        <ul className="text-xs text-muted-foreground mt-1">
                          {evaluation.experienceMatch.experienceStrengths.map((strength, index) => (
                            <li key={index}>• {strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {evaluation.experienceMatch.experienceGaps.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-600">Experience Gaps</p>
                        <ul className="text-xs text-muted-foreground mt-1">
                          {evaluation.experienceMatch.experienceGaps.map((gap, index) => (
                            <li key={index}>• {gap}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Evaluation Summary</h4>
              <p className="text-sm text-muted-foreground mb-3">{evaluation.shortlistReason}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-2">Strengths</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {evaluation.strengths.map((strength, index) => (
                      <li key={index}>• {strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-600 mb-2">Areas for Improvement</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {evaluation.areasForImprovement.map((improvement, index) => (
                      <li key={index}>• {improvement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

}
