"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUserData } from "@/hooks/use-user"
import { PageHeader } from "@/components/page-header"
import { SectionCard } from "@/components/section-card"
import { Building2, Users, Target, MapPin, Briefcase, Upload, FileText, X } from "lucide-react"

const EMPLOYER_STEPS = ["Company Info", "Company Logo", "Hiring Needs", "Team Size", "Preferences"] as const

export default function EmployerOnboardingPage() {
  const [step, setStep] = useState(0)
  const { userData, isLoaded } = useUserData()
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    website: "",
    industry: "",
    location: "",
    companySize: "",
  })
  const [hiringNeeds, setHiringNeeds] = useState({
    primaryRoles: "",
    experienceLevel: "",
    budget: "",
    timeline: "",
  })
  const [teamSize, setTeamSize] = useState({
    currentTeam: "",
    hiringGoal: "",
    teamStructure: "",
  })
  const [preferences, setPreferences] = useState({
    remote: true,
    projectBased: true,
    fullTime: false,
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const router = useRouter()

  function next() {
    setStep((s) => Math.min(s + 1, EMPLOYER_STEPS.length - 1))
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0))
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

  async function finishOnboarding() {
    try {
      if (!userData) {
        throw new Error('User data not available')
      }
      
      // Debug: Log the current state
      console.log('Company Info:', companyInfo)
      console.log('Company Size:', companyInfo.companySize)
      
      // Validate required fields
      if (!companyInfo.companySize) {
        alert('Please select a company size')
        return
      }
      
      // Upload logo if provided
      let logoUrl = null
      if (logoFile) {
        logoUrl = await uploadLogo()
      }
      
      const profileData = {
        firstName: userData.firstName || companyInfo.companyName.split(' ')[0] || "Company",
        lastName: userData.lastName || companyInfo.companyName.split(' ').slice(1).join(' ') || "Owner",
        profilePicture: userData.profileImageUrl,
        employerProfile: {
          companyName: companyInfo.companyName,
          companySize: companyInfo.companySize as any,
          industry: companyInfo.industry,
          website: companyInfo.website,
          companyDescription: `We are a ${companyInfo.industry} company looking to hire ${hiringNeeds.primaryRoles}`,
          hiringNeeds: hiringNeeds.primaryRoles.split(',').map(role => role.trim()).filter(Boolean),
          teamSize: teamSize.hiringGoal,
          location: companyInfo.location,
          timezone: "UTC", // You might want to detect this
          preferredWorkArrangement: preferences.remote ? "remote" : "onsite" as any,
          companyLogo: logoUrl
        }
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          role: 'employer',
          profile: profileData,
          onboardingCompleted: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      // Store role in localStorage for immediate access
      localStorage.setItem("userRoleIntent", "employer")
      
      router.push("/employer/dashboard")
    } catch (error) {
      console.error("Error completing onboarding:", error)
      alert("There was an error completing onboarding. Please try again.")
    }
  }

  return (
    <main>
      <PageHeader 
        title="Welcome to SkillHire" 
        description="Let's set up your company profile to start hiring the best talent." 
      />
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <nav aria-label="Progress" className="flex items-center gap-2">
          {EMPLOYER_STEPS.map((label, idx) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={["h-2 w-2 rounded-full", idx <= step ? "bg-primary" : "bg-muted"].join(" ")}
                aria-hidden
              />
              <span className="text-xs text-muted-foreground">{label}</span>
              {idx < EMPLOYER_STEPS.length - 1 ? <span className="mx-1 text-muted-foreground">/</span> : null}
            </div>
          ))}
        </nav>

        <SectionCard title={EMPLOYER_STEPS[step]}>
          {step === 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Company Information</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Company Name *</span>
                  <input
                    type="text"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Acme Inc."
                    value={companyInfo.companyName}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Website</span>
                  <input
                    type="url"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="https://acme.com"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, website: e.target.value }))}
                  />
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Industry</span>
                  <select
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={companyInfo.industry}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, industry: e.target.value }))}
                  >
                    <option value="">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="fintech">Fintech</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">SaaS</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Location</span>
                  <input
                    type="text"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="San Francisco, CA"
                    value={companyInfo.location}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, location: e.target.value }))}
                  />
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Company Size *</span>
                  <select
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={companyInfo.companySize}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, companySize: e.target.value }))}
                    required
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Company Logo</span>
              </div>
              
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Upload your company logo (optional). This will be displayed on your job postings.
                </div>
                
                {!logoPreview ? (
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
                      src={logoPreview}
                      alt="Company logo preview"
                      className="h-20 w-20 object-contain border rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{logoFile?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(logoFile?.size || 0) / 1024 / 1024 < 1 
                          ? `${Math.round((logoFile?.size || 0) / 1024)} KB`
                          : `${Math.round((logoFile?.size || 0) / 1024 / 1024)} MB`
                        }
                      </div>
                    </div>
                    <button
                      onClick={removeLogo}
                      className="p-2 hover:bg-muted rounded-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                {logoUploading && (
                  <div className="text-sm text-muted-foreground">
                    Uploading logo...
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Hiring Needs</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Primary roles you're hiring for</span>
                  <input
                    type="text"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Frontend Developer, Backend Engineer, Product Manager"
                    value={hiringNeeds.primaryRoles}
                    onChange={(e) => setHiringNeeds(prev => ({ ...prev, primaryRoles: e.target.value }))}
                  />
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Experience level</span>
                  <select
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={hiringNeeds.experienceLevel}
                    onChange={(e) => setHiringNeeds(prev => ({ ...prev, experienceLevel: e.target.value }))}
                  >
                    <option value="">Select experience level</option>
                    <option value="junior">Junior (0-2 years)</option>
                    <option value="mid">Mid-level (2-5 years)</option>
                    <option value="senior">Senior (5+ years)</option>
                    <option value="mixed">Mixed levels</option>
                  </select>
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Budget range</span>
                  <select
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={hiringNeeds.budget}
                    onChange={(e) => setHiringNeeds(prev => ({ ...prev, budget: e.target.value }))}
                  >
                    <option value="">Select budget range</option>
                    <option value="under-50k">Under $50k</option>
                    <option value="50k-100k">$50k - $100k</option>
                    <option value="100k-200k">$100k - $200k</option>
                    <option value="200k-plus">$200k+</option>
                  </select>
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Hiring timeline</span>
                  <select
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={hiringNeeds.timeline}
                    onChange={(e) => setHiringNeeds(prev => ({ ...prev, timeline: e.target.value }))}
                  >
                    <option value="">Select timeline</option>
                    <option value="asap">ASAP</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="3-months">Within 3 months</option>
                    <option value="6-months">Within 6 months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Team Information</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Current team size</span>
                  <select
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={teamSize.currentTeam}
                    onChange={(e) => setTeamSize(prev => ({ ...prev, currentTeam: e.target.value }))}
                  >
                    <option value="">Select team size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="200-plus">200+ employees</option>
                  </select>
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">How many people do you plan to hire?</span>
                  <input
                    type="text"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="e.g., 3-5 developers, 1 designer"
                    value={teamSize.hiringGoal}
                    onChange={(e) => setTeamSize(prev => ({ ...prev, hiringGoal: e.target.value }))}
                  />
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Team structure</span>
                  <select
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={teamSize.teamStructure}
                    onChange={(e) => setTeamSize(prev => ({ ...prev, teamStructure: e.target.value }))}
                  >
                    <option value="">Select structure</option>
                    <option value="startup">Startup (flat structure)</option>
                    <option value="traditional">Traditional hierarchy</option>
                    <option value="agile">Agile/Scrum teams</option>
                    <option value="remote-first">Remote-first</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Hiring Preferences</span>
              </div>
              
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Tell us about your hiring preferences:
                </div>
                
                <label className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={preferences.remote}
                    onChange={(e) => setPreferences(prev => ({ ...prev, remote: e.target.checked }))}
                  />
                  <span className="text-sm">Open to remote candidates</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={preferences.projectBased}
                    onChange={(e) => setPreferences(prev => ({ ...prev, projectBased: e.target.checked }))}
                  />
                  <span className="text-sm">Use project-based evaluation</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={preferences.fullTime}
                    onChange={(e) => setPreferences(prev => ({ ...prev, fullTime: e.target.checked }))}
                  />
                  <span className="text-sm">Only full-time positions</span>
                </label>
              </div>
            </div>
          )}
        </SectionCard>

        <div className="flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className="rounded-md border border-border bg-muted px-4 py-2 text-sm disabled:opacity-50"
          >
            Back
          </button>
          {step < EMPLOYER_STEPS.length - 1 ? (
            <button
              onClick={next}
              disabled={step === 0 && (!companyInfo.companyName || !companyInfo.companySize)}
              className="rounded-md border border-border bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              className="rounded-md border border-border bg-primary px-4 py-2 text-sm text-primary-foreground"
              onClick={finishOnboarding}
            >
              Complete Setup
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
