"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserData } from "@/hooks/use-user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, X, Briefcase, MapPin, DollarSign, Clock, Target, CreditCard } from "lucide-react"
import { PaymentButton } from "@/components/payment-button"

export default function PostJobPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdJobId, setCreatedJobId] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic')
  const [freeJobsRemaining, setFreeJobsRemaining] = useState(0)
  const [isEligibleForFree, setIsEligibleForFree] = useState(false)
  const { userData, isLoaded } = useUserData()
  const router = useRouter()

  // Fetch free jobs count on component mount
  useEffect(() => {
    if (isLoaded && userData) {
      fetchFreeJobsCount()
    }
  }, [isLoaded, userData])

  const fetchFreeJobsCount = async () => {
    try {
      const response = await fetch('/api/employer/free-jobs-count')
      if (response.ok) {
        const data = await response.json()
        setFreeJobsRemaining(data.freeJobsRemaining)
        setIsEligibleForFree(data.isEligibleForFree)
      }
    } catch (error) {
      console.error('Error fetching free jobs count:', error)
    }
  }

  // Job form data
  const [jobData, setJobData] = useState({
    title: "",
    companyName: "",
    companyLogo: "",
    description: "",
    requirements: [] as string[],
    preferredSkills: [] as string[],
    requiredSkills: [] as string[],
    experience: {
      min: 0,
      max: 10,
      level: "mid" as "junior" | "mid" | "senior" | "lead"
    },
    location: "",
    remote: true,
    jobType: "full-time" as "full-time" | "part-time" | "contract" | "internship",
    salary: {
      min: 0,
      max: 0,
      currency: "USD"
    },
    benefits: [] as string[],
    category: "",
    tags: [] as string[],
    
    // Project evaluation criteria
    projectEvaluationCriteria: {
      requiredProjectTypes: [] as string[],
      minimumProjectComplexity: "medium" as "simple" | "medium" | "complex" | "enterprise",
      requiredTechnologies: [] as string[],
      preferredProjectFeatures: [] as string[],
      projectScale: "medium" as "small" | "medium" | "large"
    },
    
    // Career site integration
    careerSiteUrl: "",
    useCareerSite: false
  })

  const [newRequirement, setNewRequirement] = useState("")
  const [newRequiredSkill, setNewRequiredSkill] = useState("")
  const [newPreferredSkill, setNewPreferredSkill] = useState("")
  const [newBenefit, setNewBenefit] = useState("")
  const [newTag, setNewTag] = useState("")
  
  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [logoUploading, setLogoUploading] = useState(false)

  const steps = [
    { id: 0, title: "Job Details", icon: Briefcase },
    { id: 1, title: "Requirements", icon: Target },
    { id: 2, title: "How To Apply", icon: Target },
    { id: 3, title: "Review", icon: Clock },
    { id: 4, title: "Payment", icon: CreditCard }
  ]

  // Logo upload functions
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      
      setLogoFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null
    
    setLogoUploading(true)
    try {
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(logoFile)
      })
      
      const base64Data = await base64Promise
      const fileName = `${jobData.companyName.replace(/\s+/g, '-').toLowerCase()}-logo.${logoFile.name.split('.').pop()}`
      
      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Data,
          fileName
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload logo')
      }
      
      const { logoUrl } = await response.json()
      return logoUrl
    } catch (error) {
      console.error('Error uploading logo:', error)
      setError('Failed to upload logo')
      return null
    } finally {
      setLogoUploading(false)
    }
  }

  const handleNext = () => {
    // Validate current step before proceeding
    if (step === 0) {
      if (!jobData.title.trim()) {
        setError('Job title is required')
        return
      }
      if (!jobData.companyName.trim()) {
        setError('Company name is required')
        return
      }
      if (!jobData.category) {
        setError('Category is required')
        return
      }
    }
    
    if (step < steps.length - 1) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const addItem = (type: 'requirements' | 'preferredSkills' | 'requiredSkills' | 'benefits' | 'tags' | 'projectEvaluationCriteria.requiredProjectTypes' | 'projectEvaluationCriteria.requiredTechnologies', value: string) => {
    if (value.trim()) {
      if (type === 'projectEvaluationCriteria.requiredProjectTypes') {
        setJobData(prev => ({
          ...prev,
          projectEvaluationCriteria: {
            ...prev.projectEvaluationCriteria,
            requiredProjectTypes: [...prev.projectEvaluationCriteria.requiredProjectTypes, value.trim()]
          }
        }))
      } else if (type === 'projectEvaluationCriteria.requiredTechnologies') {
        setJobData(prev => ({
          ...prev,
          projectEvaluationCriteria: {
            ...prev.projectEvaluationCriteria,
            requiredTechnologies: [...prev.projectEvaluationCriteria.requiredTechnologies, value.trim()]
          }
        }))
      } else {
        setJobData(prev => ({
          ...prev,
          [type]: [...prev[type], value.trim()]
        }))
      }
      setNewRequirement("")
      setNewRequiredSkill("")
      setNewPreferredSkill("")
      setNewBenefit("")
      setNewTag("")
    }
  }

  const removeItem = (type: 'requirements' | 'preferredSkills' | 'requiredSkills' | 'benefits' | 'tags' | 'projectEvaluationCriteria.requiredProjectTypes' | 'projectEvaluationCriteria.requiredTechnologies', index: number) => {
    if (type === 'projectEvaluationCriteria.requiredProjectTypes') {
      setJobData(prev => ({
        ...prev,
        projectEvaluationCriteria: {
          ...prev.projectEvaluationCriteria,
          requiredProjectTypes: prev.projectEvaluationCriteria.requiredProjectTypes.filter((_, i) => i !== index)
        }
      }))
    } else if (type === 'projectEvaluationCriteria.requiredTechnologies') {
      setJobData(prev => ({
        ...prev,
        projectEvaluationCriteria: {
          ...prev.projectEvaluationCriteria,
          requiredTechnologies: prev.projectEvaluationCriteria.requiredTechnologies.filter((_, i) => i !== index)
        }
      }))
    } else {
      setJobData(prev => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async () => {
    if (!userData) {
      setError('User data not available')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Upload logo first if provided (allowed for all plans)
      let logoUrl = jobData.companyLogo
      if (logoFile) {
        const uploadedLogoUrl = await uploadLogo()
        if (!uploadedLogoUrl) {
          setLoading(false)
          return
        }
        logoUrl = uploadedLogoUrl
      }

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...jobData,
          companyLogo: logoUrl,
          companyId: userData.id,
          planType: selectedPlan,
          paymentStatus: 'pending'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create job')
      }

      const result = await response.json()
      setCreatedJobId(result.job._id)
      
      if (result.isFreeJob) {
        // Free job - skip payment and go directly to success
        router.push('/employer/dashboard')
      } else {
        // Paid job - go to payment step
        setStep(4)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {steps.map((stepItem, index) => {
          const Icon = stepItem.icon
          return (
            <div key={stepItem.id} className="flex items-center space-x-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                index <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-sm font-medium ${
                index <= step ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {stepItem.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-px ${
                  index < step ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[step].icon, { className: "h-5 w-5" })}
            {steps[step].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior React Developer"
                    value={jobData.title}
                    onChange={(e) => setJobData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="e.g., Acme Inc."
                    value={jobData.companyName}
                    onChange={(e) => setJobData(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
              </div>

              {/* Company Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="companyLogo">
                  Company Logo {selectedPlan === 'premium' ? '(Will be displayed)' : '(Premium plan required for display)'}
                </Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      id="companyLogo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a company logo (PNG, JPG, GIF - Max 5MB)
                      {selectedPlan === 'basic' && (
                        <span className="block text-amber-600 font-medium">
                          Logo will be stored but only displayed with Premium plan
                        </span>
                      )}
                    </p>
                  </div>
                  {logoPreview && (
                    <div className="flex-shrink-0">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-16 h-16 rounded-lg object-contain border"
                      />
                    </div>
                  )}
                </div>
                {logoUploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading logo...
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={jobData.category} onValueChange={(value) => setJobData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software-development">Software Development</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="data">Data Science</SelectItem>
                      <SelectItem value="devops">DevOps</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={6}
                  value={jobData.description}
                  onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, CA"
                    value={jobData.location}
                    onChange={(e) => setJobData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jobType">Job Type *</Label>
                  <Select value={jobData.jobType} onValueChange={(value: any) => setJobData(prev => ({ ...prev, jobType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remote"
                  checked={jobData.remote}
                  onChange={(e) => setJobData(prev => ({ ...prev, remote: e.target.checked }))}
                />
                <Label htmlFor="remote">Remote work allowed</Label>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Required Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a required skill..."
                      value={newRequiredSkill}
                      onChange={(e) => setNewRequiredSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addItem('requiredSkills', newRequiredSkill)}
                    />
                    <Button onClick={() => addItem('requiredSkills', newRequiredSkill)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {jobData.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            removeItem('requiredSkills', index)
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a preferred skill..."
                      value={newPreferredSkill}
                      onChange={(e) => setNewPreferredSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addItem('preferredSkills', newPreferredSkill)}
                    />
                    <Button onClick={() => addItem('preferredSkills', newPreferredSkill)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {jobData.preferredSkills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            removeItem('preferredSkills', index)
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Min Experience (years)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={jobData.experience.min}
                    onChange={(e) => setJobData(prev => ({ 
                      ...prev, 
                      experience: { ...prev.experience, min: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Max Experience (years)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={jobData.experience.max}
                    onChange={(e) => setJobData(prev => ({ 
                      ...prev, 
                      experience: { ...prev.experience, max: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select value={jobData.experience.level} onValueChange={(value: any) => setJobData(prev => ({ 
                    ...prev, 
                    experience: { ...prev.experience, level: value }
                  }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid-level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Salary Min ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={jobData.salary.min}
                    onChange={(e) => setJobData(prev => ({ 
                      ...prev, 
                      salary: { ...prev.salary, min: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Salary Max ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={jobData.salary.max}
                    onChange={(e) => setJobData(prev => ({ 
                      ...prev, 
                      salary: { ...prev.salary, max: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">How To Apply</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose how candidates will apply for this job.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="usePlatform"
                    name="applicationMethod"
                    checked={!jobData.useCareerSite}
                    onChange={() => setJobData(prev => ({ ...prev, useCareerSite: false }))}
                  />
                  <Label htmlFor="usePlatform" className="text-sm font-medium">
                    Use our platform for applications (Recommended)
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Candidates will apply directly on our platform with project portfolios and get evaluated automatically.
                </p>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="useCareerSite"
                    name="applicationMethod"
                    checked={jobData.useCareerSite}
                    onChange={() => setJobData(prev => ({ ...prev, useCareerSite: true }))}
                  />
                  <Label htmlFor="useCareerSite" className="text-sm font-medium">
                    Redirect to our career site
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Candidates will be redirected to your company's career page to apply.
                </p>

                {jobData.useCareerSite && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="careerSiteUrl">Career Site URL *</Label>
                    <Input
                      id="careerSiteUrl"
                      placeholder="https://yourcompany.com/careers"
                      value={jobData.careerSiteUrl}
                      onChange={(e) => setJobData(prev => ({ ...prev, careerSiteUrl: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the URL where candidates should apply for this job.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Review Your Job Posting</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Review all details before posting your job.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{jobData.title}</h3>
                      <p className="text-muted-foreground">{jobData.companyName}</p>
                      <p className="text-sm text-muted-foreground">{jobData.category}</p>
                    </div>
                    {(logoPreview || jobData.companyLogo) && (
                      <div className="flex-shrink-0">
                        <img
                          src={logoPreview || jobData.companyLogo}
                          alt="Company logo"
                          className="w-16 h-16 rounded-lg object-contain border"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {jobData.remote ? 'Remote' : jobData.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {jobData.jobType}
                    </span>
                    {jobData.salary.min > 0 && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${jobData.salary.min.toLocaleString()} - ${jobData.salary.max.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{jobData.description}</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {jobData.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Preferred Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {jobData.preferredSkills.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">How To Apply</h4>
                  <div className="space-y-2 text-sm">
                    {jobData.useCareerSite ? (
                      <div>
                        <p><strong>Method:</strong> Redirect to career site</p>
                        <p><strong>Career Site URL:</strong> {jobData.careerSiteUrl}</p>
                      </div>
                    ) : (
                      <div>
                        <p><strong>Method:</strong> Apply on our platform</p>
                        <p>Candidates will apply directly on our platform with project portfolios and get evaluated automatically.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              {/* Free Jobs Counter */}
              {isEligibleForFree && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 text-lg">🎉</span>
                    <h4 className="text-green-800 font-medium">Free Job Posts Available!</h4>
                  </div>
                  <p className="text-green-700 text-sm">
                    You have <span className="font-semibold">{freeJobsRemaining} free job posts</span> remaining. 
                    After that, jobs will cost $99 (Basic) or $128 (Premium).
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-2">Choose Your Plan</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {isEligibleForFree 
                    ? "Your next job will be free! Select a plan for future jobs or to upgrade features."
                    : "Select a plan to publish your job posting."
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Basic Plan */}
                <div 
                  className={`rounded-xl border p-6 cursor-pointer transition-all ${
                    selectedPlan === 'basic' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPlan('basic')}
                >
                  <div className="text-center">
                    <h5 className="text-lg font-semibold text-foreground mb-2">Basic</h5>
                    <div className="mb-4">
                      {isEligibleForFree ? (
                        <>
                          <span className="text-3xl font-bold text-green-600">FREE</span>
                          <div className="text-sm text-muted-foreground">
                            <span className="line-through">$99</span> /job
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-foreground">$99</span>
                          <span className="text-muted-foreground">/job</span>
                        </>
                      )}
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        Job posting & management
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        Project-based evaluation
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        Candidate analytics
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        Email support
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Premium Plan */}
                <div 
                  className={`rounded-xl border p-6 cursor-pointer transition-all relative ${
                    selectedPlan === 'premium' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPlan('premium')}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Most Popular
                    </span>
                  </div>
                  <div className="text-center">
                    <h5 className="text-lg font-semibold text-foreground mb-2">Premium</h5>
                    <div className="mb-4">
                      {isEligibleForFree ? (
                        <>
                          <span className="text-3xl font-bold text-green-600">FREE</span>
                          <div className="text-sm text-muted-foreground">
                            <span className="line-through">$128</span> /job
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-foreground">$128</span>
                          <span className="text-muted-foreground">/job</span>
                        </>
                      )}
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        Everything in Basic
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        Company logo display
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        Priority candidate matching
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        Advanced analytics
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        Priority support
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {createdJobId && (
                <div className="mt-6">
                  <PaymentButton
                    planType={selectedPlan}
                    jobId={createdJobId}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 0}
        >
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          {step < 3 ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : step === 3 ? (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Job
            </Button>
          ) : (
            <div className="text-sm text-muted-foreground">
              Complete payment to publish your job
            </div>
          )}
        </div>
      </div>
    </div>
  )
}