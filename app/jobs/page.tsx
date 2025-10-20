"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, MapPin, Briefcase, DollarSign, Clock, Users, Filter } from "lucide-react"

interface Job {
  _id: string
  id?: string
  title: string
  companyName: string
  description: string
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
  postedAt: string
  totalApplications: number
  useCareerSite: boolean
  careerSiteUrl?: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [remote, setRemote] = useState("all")
  const [jobType, setJobType] = useState("all")

  useEffect(() => {
    fetchJobs()
  }, [page, search, category, remote, jobType])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      })

      if (search) params.append('search', search)
      if (category && category !== 'all') params.append('category', category)
      if (remote && remote !== 'all') params.append('remote', remote)
      if (jobType && jobType !== 'all') params.append('jobType', jobType)

      const response = await fetch(`/api/jobs?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }

      const data = await response.json()
      setJobs(data.jobs || [])
      setTotalPages(data.pagination?.pages || 1)
      setHasMore(page < (data.pagination?.pages || 1))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1) // Reset to first page when searching
  }

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'category':
        setCategory(value)
        break
      case 'remote':
        setRemote(value)
        break
      case 'jobType':
        setJobType(value)
        break
    }
    setPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    setSearch("")
    setCategory("all")
    setRemote("all")
    setJobType("all")
    setPage(1)
  }

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading jobs...</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Find Your Next Opportunity</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover amazing remote job opportunities from companies worldwide. 
          Showcase your projects and get evaluated on your real skills.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, companies, or skills..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="software-development">Software Development</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="data">Data Science</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
              </SelectContent>
            </Select>

            <Select value={remote} onValueChange={(value) => handleFilterChange('remote', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Remote" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Remote</SelectItem>
                <SelectItem value="false">On-site</SelectItem>
              </SelectContent>
            </Select>

            <Select value={jobType} onValueChange={(value) => handleFilterChange('jobType', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {(search || (category && category !== 'all') || (remote && remote !== 'all') || (jobType && jobType !== 'all')) && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {search && <Badge variant="secondary">Search: {search}</Badge>}
            {category && category !== 'all' && <Badge variant="secondary">Category: {category}</Badge>}
            {remote && remote !== 'all' && <Badge variant="secondary">Remote: {remote === 'true' ? 'Yes' : 'No'}</Badge>}
            {jobType && jobType !== 'all' && <Badge variant="secondary">Type: {jobType}</Badge>}
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Jobs Grid */}
      {jobs.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No jobs found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check back later for new opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight mb-2">
                      <Link 
                        href={`/jobs/${job._id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {job.title}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{job.companyName}</p>
                  </div>
                  <Badge variant="outline">{job.category}</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {job.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.remote ? 'Remote' : job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.jobType}
                  </span>
                </div>
                
                {job.salary.min > 0 && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(job.postedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {job.totalApplications} applications
                  </span>
                </div>
                
                {job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {job.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={`${job._id}-tag-${index}`} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {job.tags.length > 3 && (
                      <Badge key={`${job._id}-more-tags`} variant="outline" className="text-xs">
                        +{job.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/jobs/${job._id}`}>
                      View Details
                    </Link>
                  </Button>
                  {job.useCareerSite ? (
                    <Button asChild variant="outline" onClick={() => window.open(job.careerSiteUrl, '_blank')}>
                      <a href={job.careerSiteUrl} target="_blank" rel="noopener noreferrer">
                        Apply on Company Site
                      </a>
                    </Button>
                  ) : (
                    <Button asChild variant="outline">
                      <Link href={`/candidate/apply/${job._id}`}>
                        Apply Now
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={!hasMore}
          >
            Next
          </Button>
        </div>
      )}

      {loading && page > 1 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading more jobs...</span>
        </div>
      )}
    </div>
  )
}