"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUserData } from "@/hooks/use-user"
import { PageHeader } from "@/components/page-header"
import { SectionCard } from "@/components/section-card"
import { User, Code, MapPin, Briefcase, Star, Target } from "lucide-react"

const CANDIDATE_STEPS = ["Profile", "Skills", "Experience", "Preferences"] as const

export default function CandidateOnboardingPage() {
  const [step, setStep] = useState(0)
  const { userData, isLoaded } = useUserData()
  const [profile, setProfile] = useState({
    fullName: "",
    title: "",
    location: "",
    bio: "",
    linkedin: "",
    github: "",
    portfolio: "",
  })
  const [skills, setSkills] = useState({
    primarySkills: "",
    experience: "",
    technologies: "",
    languages: "",
  })
  const [experience, setExperience] = useState({
    yearsExperience: "",
    currentRole: "",
    previousRoles: "",
    education: "",
    certifications: "",
  })
  const [preferences, setPreferences] = useState({
    remote: true,
    fullTime: false,
    contract: false,
    salaryRange: "",
    industries: "",
  })
  const router = useRouter()

  function next() {
    setStep((s) => Math.min(s + 1, CANDIDATE_STEPS.length - 1))
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function finishOnboarding() {
    try {
      if (!userData) {
        throw new Error('User data not available')
      }

      // Validate required fields
      if (!profile.fullName) {
        throw new Error('Full name is required')
      }
      if (!skills.primarySkills) {
        throw new Error('Primary skills are required')
      }
      
      const profileData = {
        firstName: userData.firstName || profile.fullName.split(' ')[0] || "",
        lastName: userData.lastName || profile.fullName.split(' ').slice(1).join(' ') || "",
        profilePicture: userData.profileImageUrl,
        bio: profile.bio,
        candidateProfile: {
          skills: skills.primarySkills.split(',').map(skill => skill.trim()).filter(Boolean),
          experience: skills.experience,
          education: experience.education,
          availability: 'flexible', // FIXED: Changed from full-time to flexible for enum validation
          preferredJobTypes: preferences.industries ? preferences.industries.split(',').map(type => type.trim()).filter(Boolean) : [],
          location: profile.location,
          timezone: "UTC",
          languages: skills.languages ? skills.languages.split(',').map(lang => lang.trim()).filter(Boolean) : ["English"]
        }
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          role: 'candidate',
          profile: profileData
        })
      })

        if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      // Store role in localStorage for immediate access
      localStorage.setItem("userRoleIntent", "candidate")
      
      router.push("/candidate/dashboard")
    } catch (error) {
      console.error("Error completing onboarding:", error)
      alert("There was an error completing onboarding. Please try again.")
    }
  }

  return (
    <main>
      <PageHeader 
        title="Welcome to SkillHire" 
        description="Let's build your profile to showcase your skills and find amazing opportunities." 
      />
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <nav aria-label="Progress" className="flex items-center gap-2">
          {CANDIDATE_STEPS.map((label, idx) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={["h-2 w-2 rounded-full", idx <= step ? "bg-primary" : "bg-muted"].join(" ")}
                aria-hidden
              />
              <span className="text-xs text-muted-foreground">{label}</span>
              {idx < CANDIDATE_STEPS.length - 1 ? <span className="mx-1 text-muted-foreground">/</span> : null}
            </div>
          ))}
        </nav>

        <SectionCard title={CANDIDATE_STEPS[step]}>
          {step === 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Personal Information</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Full Name *</span>
                  <input
                    type="text"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="John Doe"
                    value={profile.fullName}
                    onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Professional Title</span>
                  <input
                    type="text"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Frontend Developer, Product Manager, UX Designer"
                    value={profile.title}
                    onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                  />
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Location</span>
                  <input
                    type="text"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="San Francisco, CA"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  />
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Bio</span>
                  <textarea
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                    placeholder="Tell us about yourself, your passion for technology, and what drives you..."
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </label>
                
                <div className="grid grid-cols-1 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">LinkedIn Profile</span>
                    <input
                      type="url"
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                      placeholder="https://linkedin.com/in/yourname"
                      value={profile.linkedin}
                      onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                    />
                  </label>
                  
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">GitHub Profile</span>
                    <input
                      type="url"
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                      placeholder="https://github.com/yourname"
                      value={profile.github}
                      onChange={(e) => setProfile(prev => ({ ...prev, github: e.target.value }))}
                    />
                  </label>
                  
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Portfolio Website</span>
                    <input
                      type="url"
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                      placeholder="https://yourportfolio.com"
                      value={profile.portfolio}
                      onChange={(e) => setProfile(prev => ({ ...prev, portfolio: e.target.value }))}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Code className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Skills & Technologies</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Primary Skills *</span>
                  <input
                    type="text"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="React, Node.js, TypeScript, Python, Machine Learning"
                    value={skills.primarySkills}
                    onChange={(e) => setSkills(prev => ({ ...prev, primarySkills: e.target.value }))}
                  />
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Years of Experience</span>
                  <select
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={skills.experience}
                    onChange={(e) => setSkills(prev => ({ ...prev, experience: e.target.value }))}
                  >
                    <option value="">Select experience level</option>
                    <option value="0-1">0-1 years (Entry level)</option>
                    <option value="1-3">1-3 years (Junior)</option>
                    <option value="3-5">3-5 years (Mid-level)</option>
                    <option value="5-8">5-8 years (Senior)</option>
                    <option value="8-plus">8+ years (Lead/Principal)</option>
                  </select>
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Technologies & Frameworks</span>
                  <input
                    type="text"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="React, Vue.js, Angular, Express, Django, AWS, Docker"
                    value={skills.technologies}
                    onChange={(e) => setSkills(prev => ({ ...prev, technologies: e.target.value }))}
                  />
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Programming Languages</span>
                  <input
                    type="text"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="JavaScript, Python, Java, Go, Rust, C++"
                    value={skills.languages}
                    onChange={(e) => setSkills(prev => ({ ...prev, languages: e.target.value }))}
                  />
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Work Experience</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Current Role</span>
                  <input
                    type="text"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Senior Frontend Developer at TechCorp"
                    value={experience.currentRole}
                    onChange={(e) => setExperience(prev => ({ ...prev, currentRole: e.target.value }))}
                  />
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Previous Roles</span>
                  <textarea
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                    placeholder="Junior Developer at StartupXYZ (2020-2022)&#10;Intern at BigCorp (2019-2020)"
                    value={experience.previousRoles}
                    onChange={(e) => setExperience(prev => ({ ...prev, previousRoles: e.target.value }))}
                  />
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Education</span>
                  <input
                    type="text"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="BS Computer Science, Stanford University"
                    value={experience.education}
                    onChange={(e) => setExperience(prev => ({ ...prev, education: e.target.value }))}
                  />
                </label>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Certifications</span>
                  <input
                    type="text"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="AWS Certified Developer, Google Cloud Professional"
                    value={experience.certifications}
                    onChange={(e) => setExperience(prev => ({ ...prev, certifications: e.target.value }))}
                  />
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Job Preferences</span>
              </div>
              
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  What kind of opportunities are you looking for?
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Salary Range</span>
                    <select
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                      value={preferences.salaryRange}
                      onChange={(e) => setPreferences(prev => ({ ...prev, salaryRange: e.target.value }))}
                    >
                      <option value="">Select salary range</option>
                      <option value="under-50k">Under $50k</option>
                      <option value="50k-75k">$50k - $75k</option>
                      <option value="75k-100k">$75k - $100k</option>
                      <option value="100k-150k">$100k - $150k</option>
                      <option value="150k-plus">$150k+</option>
                    </select>
                  </label>
                  
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Preferred Industries</span>
                    <input
                      type="text"
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Fintech, Healthcare, E-commerce, SaaS"
                      value={preferences.industries}
                      onChange={(e) => setPreferences(prev => ({ ...prev, industries: e.target.value }))}
                    />
                  </label>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={preferences.remote}
                      onChange={(e) => setPreferences(prev => ({ ...prev, remote: e.target.checked }))}
                    />
                    <span className="text-sm">Open to remote work</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={preferences.fullTime}
                      onChange={(e) => setPreferences(prev => ({ ...prev, fullTime: e.target.checked }))}
                    />
                    <span className="text-sm">Full-time positions</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={preferences.contract}
                      onChange={(e) => setPreferences(prev => ({ ...prev, contract: e.target.checked }))}
                    />
                    <span className="text-sm">Contract/Freelance work</span>
                  </label>
                </div>
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
          {step < CANDIDATE_STEPS.length - 1 ? (
            <button
              onClick={next}
              disabled={
                (step === 0 && !profile.fullName) ||
                (step === 1 && !skills.primarySkills) ||
                (step === 2 && !experience.currentRole)
              }
              className="rounded-md border border-border bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              className="rounded-md border border-border bg-primary px-4 py-2 text-sm text-primary-foreground"
              onClick={finishOnboarding}
            >
              Complete Profile
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
