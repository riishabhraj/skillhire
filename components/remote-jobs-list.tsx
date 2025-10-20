"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, MapPin, Building2, Clock, Search } from "lucide-react"

interface RemoteJob {
  id: number
  title: string
  company_name: string
  company_logo: string
  category: string
  job_type: string
  salary: string
  candidate_required_location: string
  url: string
  publication_date: string
  description: string
}

export function RemoteJobsList() {
  const [jobs, setJobs] = useState<RemoteJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/remote-jobs')
        
        if (!response.ok) {
          throw new Error('Failed to fetch jobs')
        }
        
        const data = await response.json()
        setJobs(data.jobs || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // Filter jobs based on search term and category
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || job.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(jobs.map(job => job.category))).sort()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading remote jobs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error loading jobs: {error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs, companies, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>
      </div>

      {/* Attribution */}
      <div className="text-center mb-8">
        <p className="text-sm text-muted-foreground">
          Powered by <a href="https://remotive.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Remotive</a>
        </p>
      </div>
      
      {/* Jobs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight mb-2 line-clamp-2">
                    {job.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{job.company_name}</span>
                  </div>
                </div>
                {job.company_logo && (
                  <img 
                    src={job.company_logo} 
                    alt={`${job.company_name} logo`}
                    className="w-12 h-12 rounded-lg object-contain flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{job.candidate_required_location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>{new Date(job.publication_date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {job.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {job.job_type}
                  </Badge>
                </div>
                
                {job.salary && (
                  <p className="text-sm font-medium text-green-600">
                    {job.salary}
                  </p>
                )}
                
                {job.description && (
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {job.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </div>
                )}
                
                <Button 
                  asChild 
                  className="w-full mt-4"
                  size="sm"
                >
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    View Job
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredJobs.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory 
              ? "No jobs found matching your criteria. Try adjusting your search or filters."
              : "No remote jobs found at the moment."
            }
          </p>
          {(searchTerm || selectedCategory) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("")
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
