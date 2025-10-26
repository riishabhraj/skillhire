"use client"

import { useState, useEffect } from "react"
import { useUserData } from "@/hooks/use-user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Building2, 
  Users, 
  MapPin, 
  Globe, 
  Briefcase, 
  Target, 
  Upload, 
  Edit3, 
  Save, 
  X, 
  Loader2,
  CheckCircle
} from "lucide-react"
import RoleGuard from "@/components/role-guard"

interface CompanyProfile {
  companyName: string
  companySize: string
  industry: string
  website: string
  companyDescription: string
  hiringNeeds: string[]
  teamSize: string
  location: string
  timezone: string
  preferredWorkArrangement: string
  companyLogo?: string
}

function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { userData, isLoaded } = useUserData()

  // Check if user is employer (can edit) or candidate (view only)
  const isEmployer = userData?.role === 'employer'

  // Form state
  const [formData, setFormData] = useState<CompanyProfile>({
    companyName: "",
    companySize: "",
    industry: "",
    website: "",
    companyDescription: "",
    hiringNeeds: [],
    teamSize: "",
    location: "",
    timezone: "",
    preferredWorkArrangement: "",
    companyLogo: ""
  })

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)

  useEffect(() => {
    if (isLoaded && userData) {
      fetchProfile()
    }
  }, [isLoaded, userData])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      const user = await response.json()
      
      if (user.profile?.employerProfile) {
        const employerProfile = user.profile.employerProfile
        setProfile(employerProfile)
        setFormData({
          companyName: employerProfile.companyName || "",
          companySize: employerProfile.companySize || "",
          industry: employerProfile.industry || "",
          website: employerProfile.website || "",
          companyDescription: employerProfile.companyDescription || "",
          hiringNeeds: employerProfile.hiringNeeds || [],
          teamSize: employerProfile.teamSize || "",
          location: employerProfile.location || "",
          timezone: employerProfile.timezone || "",
          preferredWorkArrangement: employerProfile.preferredWorkArrangement || "",
          companyLogo: employerProfile.companyLogo || ""
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null

    setLogoUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        const response = await fetch('/api/upload/logo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            base64Data: base64,
            fileName: logoFile.name
          })
        })

        if (!response.ok) {
          throw new Error('Failed to upload logo')
        }

        const data = await response.json()
        setLogoUploading(false)
        return data.url
      }
      reader.readAsDataURL(logoFile)
    } catch (error) {
      console.error('Error uploading logo:', error)
      setLogoUploading(false)
      return null
    }
    return null
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      // Upload logo if provided
      let logoUrl = formData.companyLogo
      if (logoFile) {
        const uploadedLogoUrl = await uploadLogo()
        if (uploadedLogoUrl) {
          logoUrl = uploadedLogoUrl
        }
      }

      const updatedProfile = {
        ...formData,
        companyLogo: logoUrl
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData?.email,
          role: 'employer',
          profile: {
            firstName: userData?.firstName || "",
            lastName: userData?.lastName || "",
            profilePicture: userData?.profileImageUrl || "",
            bio: "",
            employerProfile: updatedProfile
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      setProfile(updatedProfile)
      setEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        companyName: profile.companyName || "",
        companySize: profile.companySize || "",
        industry: profile.industry || "",
        website: profile.website || "",
        companyDescription: profile.companyDescription || "",
        hiringNeeds: profile.hiringNeeds || [],
        teamSize: profile.teamSize || "",
        location: profile.location || "",
        timezone: profile.timezone || "",
        preferredWorkArrangement: profile.preferredWorkArrangement || "",
        companyLogo: profile.companyLogo || ""
      })
    }
    setLogoFile(null)
    setLogoPreview(null)
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading company profile...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground">
            {isEmployer 
              ? "Manage your company information and preferences" 
              : "Learn more about this company"
            }
          </p>
        </div>
        {isEmployer && (
          <div className="flex gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Profile updated successfully!</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  {editing && isEmployer ? (
                    <Input
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm font-medium">{profile?.companyName || "Not specified"}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Industry</Label>
                  {editing && isEmployer ? (
                    <Input
                      value={formData.industry}
                      onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm font-medium">{profile?.industry || "Not specified"}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  {editing && isEmployer ? (
                    <select
                      className="w-full p-2 border rounded-md"
                      value={formData.companySize}
                      onChange={(e) => setFormData(prev => ({ ...prev, companySize: e.target.value }))}
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium">{profile?.companySize || "Not specified"}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Location</Label>
                  {editing && isEmployer ? (
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm font-medium">{profile?.location || "Not specified"}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Website</Label>
                {editing && isEmployer ? (
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://company.com"
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {profile?.website ? (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.website}
                      </a>
                    ) : (
                      "Not specified"
                    )}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Company Description</Label>
                {editing && isEmployer ? (
                  <Textarea
                    value={formData.companyDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyDescription: e.target.value }))}
                    rows={4}
                    placeholder="Describe your company..."
                  />
                ) : (
                  <p className="text-sm">{profile?.companyDescription || "No description provided"}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Company Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Company Logo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing && isEmployer ? (
                <div className="space-y-4">
                  {!logoPreview && !formData.companyLogo ? (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">Click to upload logo</span>
                        <span className="text-xs text-muted-foreground">PNG, JPG, SVG up to 5MB</span>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <img
                        src={logoPreview || formData.companyLogo}
                        alt="Company logo preview"
                        className="h-20 w-20 object-contain border rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {logoFile?.name || "Current logo"}
                        </div>
                        {logoFile && (
                          <div className="text-xs text-muted-foreground">
                            {(logoFile.size / 1024 / 1024 < 1 
                              ? `${Math.round(logoFile.size / 1024)} KB`
                              : `${Math.round(logoFile.size / 1024 / 1024)} MB`
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                          id="logo-replace"
                        />
                        <label htmlFor="logo-replace">
                          <Button variant="outline" size="sm">
                            Replace
                          </Button>
                        </label>
                        <Button variant="outline" size="sm" onClick={removeLogo}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {logoUploading && (
                    <div className="text-sm text-muted-foreground">
                      Uploading logo...
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {profile?.companyLogo ? (
                    <>
                      <img
                        src={profile.companyLogo}
                        alt="Company logo"
                        className="h-20 w-20 object-contain border rounded-lg"
                      />
                      <div>
                        <p className="text-sm font-medium">Company Logo</p>
                        <p className="text-xs text-muted-foreground">Uploaded during onboarding</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No logo uploaded</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hiring Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Hiring Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Team Size Goal</Label>
                  {editing && isEmployer ? (
                    <Input
                      value={formData.teamSize}
                      onChange={(e) => setFormData(prev => ({ ...prev, teamSize: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm font-medium">{profile?.teamSize || "Not specified"}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Work Arrangement</Label>
                  {editing && isEmployer ? (
                    <select
                      className="w-full p-2 border rounded-md"
                      value={formData.preferredWorkArrangement}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferredWorkArrangement: e.target.value }))}
                    >
                      <option value="">Select arrangement</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium">{profile?.preferredWorkArrangement || "Not specified"}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Hiring Needs</Label>
                {editing && isEmployer ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter roles separated by commas (e.g., Frontend Developer, Backend Developer)"
                      value={formData.hiringNeeds.join(', ')}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        hiringNeeds: e.target.value.split(',').map(role => role.trim()).filter(Boolean)
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple roles with commas
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile?.hiringNeeds && profile.hiringNeeds.length > 0 ? (
                      profile.hiringNeeds.map((role, index) => (
                        <Badge key={index} variant="secondary">{role}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No roles specified</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Company Size</p>
                  <p className="text-xs text-muted-foreground">{profile?.companySize || "Not specified"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-xs text-muted-foreground">{profile?.location || "Not specified"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Work Arrangement</p>
                  <p className="text-xs text-muted-foreground">{profile?.preferredWorkArrangement || "Not specified"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Hiring Goal</p>
                  <p className="text-xs text-muted-foreground">{profile?.teamSize || "Not specified"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isEmployer ? (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/employer/dashboard">
                      <Briefcase className="h-4 w-4 mr-2" />
                      View Dashboard
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/employer/post-job">
                      <Target className="h-4 w-4 mr-2" />
                      Post New Job
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/employer/candidates">
                      <Users className="h-4 w-4 mr-2" />
                      View Candidates
                    </a>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/jobs">
                      <Briefcase className="h-4 w-4 mr-2" />
                      View All Jobs
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/candidate/dashboard">
                      <Users className="h-4 w-4 mr-2" />
                      My Dashboard
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/candidate/applications">
                      <Target className="h-4 w-4 mr-2" />
                      My Applications
                    </a>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CompanyProfilePageWithRoleGuard() {
  return (
    <RoleGuard allowedRoles={['employer', 'candidate']}>
      <CompanyProfilePage />
    </RoleGuard>
  )
}
