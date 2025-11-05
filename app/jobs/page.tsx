"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useUserData } from "@/hooks/use-user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, MapPin, Briefcase, DollarSign, Clock, Filter, Building2 } from "lucide-react"

interface Job {
  _id: string
  id?: string
  title: string
  companyName: string
  companyLogo?: string
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
  useCareerSite: boolean
  careerSiteUrl?: string
  isFeatured?: boolean // true for employer-posted jobs from our platform
  source?: 'platform' | 'remoteok' // track job source
  planType?: 'basic' | 'premium' // plan type for platform jobs
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const { userData } = useUserData()

  // Filters
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [remote, setRemote] = useState("all")
  const [jobType, setJobType] = useState("all")
  const [allJobs, setAllJobs] = useState<Job[]>([]) // Store all jobs for client-side filtering

  // Fetch jobs only once on component mount
  useEffect(() => {
    fetchJobs()
  }, [])

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, category, remote, jobType])

  // Apply client-side filtering and pagination
  useEffect(() => {
    if (allJobs.length === 0) return

    // Apply filters
    let filteredJobs = allJobs

    if (search) {
      const searchLower = search.toLowerCase()
      filteredJobs = filteredJobs.filter((job: any) => 
        job.title.toLowerCase().includes(searchLower) ||
        job.companyName.toLowerCase().includes(searchLower) ||
        job.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
      )
    }

    if (category && category !== 'all') {
      filteredJobs = filteredJobs.filter((job: any) => 
        job.category.toLowerCase() === category.toLowerCase() ||
        job.tags.some((tag: string) => tag.toLowerCase().includes(category.toLowerCase()))
      )
    }

    if (remote && remote !== 'all') {
      filteredJobs = filteredJobs.filter((job: any) => 
        remote === 'true' ? job.remote : !job.remote
      )
    }

    if (jobType && jobType !== 'all') {
      filteredJobs = filteredJobs.filter((job: any) => 
        job.jobType.toLowerCase() === jobType.toLowerCase()
      )
    }

    // Pagination
    const limit = 12
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

    setJobs(paginatedJobs)
    setTotalPages(Math.ceil(filteredJobs.length / limit))
    setHasMore(endIndex < filteredJobs.length)
  }, [allJobs, search, category, remote, jobType, page])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      
      // Fetch from both sources in parallel
      const [remoteOKResponse, platformResponse] = await Promise.all([
        fetch('https://remoteok.com/api?ref=skillhire').catch(() => null),
        fetch('/api/jobs').catch(() => null)
      ])
      
      let allJobs: Job[] = []

      // Fetch from our platform (employer-posted jobs)
      if (platformResponse && platformResponse.ok) {
        const platformData = await platformResponse.json()
        const platformJobs = (platformData.jobs || []).map((job: any) => ({
          _id: job._id,
          title: job.title,
          companyName: job.companyName,
          companyLogo: job.companyLogo,
          description: job.description,
          location: job.location,
          remote: job.remote,
          jobType: job.jobType,
          salary: job.salary,
          category: job.category,
          tags: job.skills || [],
          postedAt: job.postedAt,
          useCareerSite: job.useCareerSite || false,
          careerSiteUrl: job.careerSiteUrl,
          isFeatured: true,
          source: 'platform' as const
        }))
        allJobs = [...platformJobs]
      }

      // Fetch from RemoteOK API
      if (remoteOKResponse && remoteOKResponse.ok) {
        const data = await remoteOKResponse.json()
        
        // RemoteOK returns an array where first item is metadata, rest are jobs
        const remoteJobs = data.slice(1).map((job: any) => ({
          _id: `remoteok-${job.id || job.slug}`,
          title: job.position,
          companyName: job.company,
          companyLogo: job.logo || job.company_logo || `https://logo.clearbit.com/${job.company.toLowerCase().replace(/\s+/g, '')}.com`,
          description: job.description || '',
          location: job.location || 'Worldwide',
          remote: true,
          jobType: 'full-time',
          salary: {
            min: 0,
            max: 0,
            currency: 'USD'
          },
          category: job.tags?.[0] || 'other',
          tags: job.tags || [],
          postedAt: job.date || new Date().toISOString(),
          useCareerSite: true,
          careerSiteUrl: job.url,
          isFeatured: false,
          source: 'remoteok' as const
        }))
        allJobs = [...allJobs, ...remoteJobs]
      }

      // Sort: Featured jobs first, then by date
      allJobs.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      })

      // Store all jobs for client-side filtering
      setAllJobs(allJobs)
    } catch (err) {
      console.error('Error fetching jobs:', err)
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
          Discover amazing job opportunities from top companies worldwide. 
          Featured jobs let you showcase your projects and get evaluated on your real skills.
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
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No jobs found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check back later for new opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="mb-2">
                      <CardTitle className="text-lg leading-tight mb-1">
                        <Link 
                          href={job.isFeatured ? `/jobs/${job._id}` : job.careerSiteUrl || '#'}
                          className="hover:text-primary transition-colors block overflow-hidden"
                          target={job.isFeatured ? '_self' : '_blank'}
                          rel={job.isFeatured ? undefined : 'noopener noreferrer'}
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {job.title}
                        </Link>
                      </CardTitle>
                      {job.isFeatured && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-xs">
                          ⭐ Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      <span 
                        className="overflow-hidden"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {job.companyName}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {job.companyLogo && job.planType === 'premium' && (
                      <img 
                        src={job.companyLogo} 
                        alt={`${job.companyName} logo`}
                        className="w-12 h-12 rounded-lg object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {job.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 min-w-0">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span 
                      className="overflow-hidden"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {job.remote ? 'Remote' : job.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 min-w-0">
                    <Briefcase className="h-4 w-4 flex-shrink-0" />
                    <span 
                      className="overflow-hidden"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {job.jobType}
                    </span>
                  </div>
                </div>
                
                {job.salary.min > 0 && (
                  <div className="flex items-center gap-1 text-sm text-green-600 min-w-0">
                    <DollarSign className="h-4 w-4 flex-shrink-0" />
                    <span 
                      className="overflow-hidden"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                    </span>
                  </div>
                )}
                
                {/* Only show date for platform jobs */}
                {job.isFeatured && (
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{new Date(job.postedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                
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
                  {job.isFeatured ? (
                    <>
                      <Button asChild className="flex-1">
                        <Link href={`/jobs/${job._id}`}>
                          View Details
                        </Link>
                      </Button>
                      {userData && userData.role === 'candidate' ? (
                        <Button asChild variant="outline">
                          <Link href={`/candidate/apply/${job._id}`}>
                            Apply Now
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild variant="outline">
                          <Link href="/candidate">
                            Sign In to Apply
                          </Link>
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button asChild className="flex-1">
                      <a href={job.careerSiteUrl} target="_blank" rel="noopener noreferrer">
                        View & Apply
                      </a>
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
