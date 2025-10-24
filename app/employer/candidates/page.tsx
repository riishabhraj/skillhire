"use client"

import { useState, useEffect } from "react"
import { useUserData } from "@/hooks/use-user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, Users } from "lucide-react"

interface Candidate {
  _id: string
  firstName: string
  lastName: string
  email: string
  profilePicture?: string
  role: 'candidate'
  candidateProfile: {
    skills: {
      technical: string[]
      soft: string[]
    }
    experience: {
      totalYears: number
      relevantYears: number
      previousRoles: string[]
    }
    availability: string
    location: string
    portfolio: string[]
  }
  applications: Array<{
    _id: string
    jobId: string
    status: string
    evaluation?: {
      overallScore: number
      projectScore: number
      skillsScore: number
      shortlistStatus: string
    }
    submittedAt: string
  }>
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [scoreFilter, setScoreFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { userData, isLoaded } = useUserData()

  useEffect(() => {
    if (isLoaded && userData) {
      fetchCandidates()
    }
  }, [isLoaded, userData])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/employer/candidates')
      if (!response.ok) {
        throw new Error('Failed to fetch candidates')
      }
      const data = await response.json()
      console.log('Candidates API response:', data)
      setCandidates(data.candidates || [])
    } catch (err) {
      console.error('Error fetching candidates:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleViewProfile = (candidateId: string) => {
    // Navigate to the candidate profile page
    window.open(`/employer/candidates/${candidateId}`, '_blank')
  }

  const handleShortlist = async (applicationId: string, candidateId: string) => {
    try {
      setActionLoading(applicationId)
      console.log('Shortlisting application:', applicationId, 'for candidate:', candidateId)
      
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'shortlisted' })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to shortlist candidate')
      }

      // Update local state
      setCandidates(prev => prev.map(candidate => {
        if (candidate._id === candidateId) {
          return {
            ...candidate,
            applications: candidate.applications.map(app => 
              app._id === applicationId ? { ...app, status: 'shortlisted' } : app
            )
          }
        }
        return candidate
      }))

      // Show success message
      alert('Candidate shortlisted successfully!')

    } catch (err) {
      console.error('Error shortlisting candidate:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      alert(`Error: ${err instanceof Error ? err.message : 'An error occurred'}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (applicationId: string, candidateId: string) => {
    try {
      setActionLoading(applicationId)
      console.log('Rejecting application:', applicationId, 'for candidate:', candidateId)
      
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reject candidate')
      }

      // Update local state
      setCandidates(prev => prev.map(candidate => {
        if (candidate._id === candidateId) {
          return {
            ...candidate,
            applications: candidate.applications.map(app => 
              app._id === applicationId ? { ...app, status: 'rejected' } : app
            )
          }
        }
        return candidate
      }))

      // Show success message
      alert('Candidate rejected successfully!')

    } catch (err) {
      console.error('Error rejecting candidate:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      alert(`Error: ${err instanceof Error ? err.message : 'An error occurred'}`)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      (candidate.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.candidateProfile?.skills?.technical || []).some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )

    const matchesStatus = statusFilter === "all" || 
      (candidate.applications || []).some(app => app.status === statusFilter)

    const matchesScore = scoreFilter === "all" || 
      (candidate.applications || []).some(app => {
        if (!app.evaluation?.overallScore) return false
        const score = app.evaluation.overallScore
        switch (scoreFilter) {
          case "high": return score >= 80
          case "medium": return score >= 60 && score < 80
          case "low": return score < 60
          default: return true
        }
      })

    return matchesSearch && matchesStatus && matchesScore
  })

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
        <span className="ml-2">Loading candidates...</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Candidates</h1>
        <p className="text-muted-foreground mt-2">
          Browse and manage candidates who have applied to your jobs.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>Total candidates: {candidates.length}</p>
          <p>Filtered candidates: {filteredCandidates.length}</p>
          {candidates.length > 0 && (
            <div>
              <p>First candidate applications: {candidates[0]?.applications?.length || 0}</p>
              <p>First candidate ID: {candidates[0]?._id}</p>
            </div>
          )}
        </div>
      )}

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates by name, email, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={scoreFilter} onValueChange={setScoreFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scores</SelectItem>
              <SelectItem value="high">High (80+)</SelectItem>
              <SelectItem value="medium">Medium (60-79)</SelectItem>
              <SelectItem value="low">Low (under 60)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {candidates.length === 0 ? 'No candidates yet' : 'No candidates match your filters'}
            </h3>
            <p className="text-muted-foreground text-center">
              {candidates.length === 0 
                ? 'Candidates will appear here once they apply to your jobs.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => {
            const latestApplication = (candidate.applications || [])
              .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0]
            
            return (
              <Card key={candidate._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {(candidate.firstName || '')} {(candidate.lastName || '')}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{candidate.email || 'No email'}</p>
                    </div>
                    {latestApplication?.evaluation?.overallScore && (
                      <Badge variant="outline">
                        {latestApplication.evaluation.overallScore}/100
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">

                  <div>
                    <h4 className="text-sm font-medium mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {(candidate.candidateProfile?.skills?.technical || []).slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {(candidate.candidateProfile?.skills?.technical || []).length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{(candidate.candidateProfile?.skills?.technical || []).length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {latestApplication && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Latest Application</h4>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {new Date(latestApplication.submittedAt).toLocaleDateString()}
                        </span>
                        <Badge 
                          variant={
                            latestApplication.status === 'shortlisted' ? 'default' :
                            latestApplication.status === 'rejected' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {latestApplication.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewProfile(candidate._id)}
                    >
                      View Profile
                    </Button>
                    {latestApplication ? (
                      <>
                        <Button 
                          variant="outline"
                          onClick={() => handleShortlist(latestApplication._id, candidate._id)}
                          disabled={actionLoading === latestApplication._id || latestApplication.status === 'shortlisted'}
                        >
                          {actionLoading === latestApplication._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Shortlist'
                          )}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleReject(latestApplication._id, candidate._id)}
                          disabled={actionLoading === latestApplication._id || latestApplication.status === 'rejected'}
                        >
                          {actionLoading === latestApplication._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Reject'
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" disabled>
                          No Applications
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}