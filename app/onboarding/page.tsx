"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { SectionCard } from "@/components/section-card"
import { Building2, Briefcase } from "lucide-react"
import { useRoleDetection } from "@/hooks/use-role-detection"

type UserRole = "employer" | "candidate"

export default function OnboardingPage() {
  const router = useRouter()
  const { role, isDetecting } = useRoleDetection()

  // Check if user came from a specific sign-up path or has role intent
  useEffect(() => {
    if (isDetecting) return

    const urlParams = new URLSearchParams(window.location.search)
    const urlRole = urlParams.get('role') as UserRole
    
    // Priority: URL parameter > localStorage role intent
    const finalRole = urlRole || role
    
    if (finalRole === 'employer') {
      router.push('/onboarding/employer')
    } else if (finalRole === 'candidate') {
      router.push('/onboarding/candidate')
    }
    // If no role parameter, show role selection
  }, [router, role, isDetecting])

  function selectRole(role: UserRole) {
    // Set role intent in localStorage
    localStorage.setItem("userRoleIntent", role)
    
    // Redirect to unified sign-up with role parameter
    router.push(`/sign-up/unified?role=${role}`)
  }

  return (
    <main>
      <PageHeader title="Welcome to SkillHire" description="Let's get you set up with the right experience." />
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <SectionCard title="Choose Your Path">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-6">
              How will you be using SkillHire?
            </div>
            
            <button
              onClick={() => selectRole('candidate')}
              className="w-full flex items-start gap-4 p-6 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground mb-2">I'm Looking for Jobs</div>
                <div className="text-sm text-muted-foreground mb-3">
                  Find opportunities through hands-on projects and showcase your skills to employers.
                </div>
                <div className="text-xs text-muted-foreground">
                  • Build your professional profile<br/>
                  • Apply to project-based opportunities<br/>
                  • Showcase your skills through real work
                </div>
              </div>
            </button>
            
            <button
              onClick={() => selectRole('employer')}
              className="w-full flex items-start gap-4 p-6 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground mb-2">I'm Hiring Talent</div>
                <div className="text-sm text-muted-foreground mb-3">
                  Hire the best candidates through project-based evaluation and find quality talent faster.
                </div>
                <div className="text-xs text-muted-foreground">
                  • Set up your company profile<br/>
                  • Create project-based assessments<br/>
                  • Evaluate candidates through real work
                </div>
              </div>
            </button>
          </div>
        </SectionCard>
      </div>
    </main>
  )
}
