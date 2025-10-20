"use client"

import React from "react"
import { SignUp } from "@clerk/nextjs"
import { Building2, Users, Target, UserCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function UnifiedSignUpPage() {
  const router = useRouter()
  
  // Set role intent in localStorage when component mounts
  React.useEffect(() => {
    // Check if there's a role intent from the URL or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const roleFromUrl = urlParams.get('role')
    const roleFromStorage = localStorage.getItem('userRoleIntent')
    
    const role = roleFromUrl || roleFromStorage || 'candidate' // Default to candidate
    localStorage.setItem('userRoleIntent', role)
  }, [])

  const handleSignUpSuccess = () => {
    // Get the role intent
    const role = localStorage.getItem('userRoleIntent') || 'candidate'
    
    // Redirect based on role
    if (role === 'employer') {
      router.push('/onboarding/employer')
    } else {
      router.push('/onboarding/candidate')
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left side - Benefits */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Join SkillHire
            </h1>
            <p className="text-lg text-muted-foreground">
              Create your account and start your journey with project-based hiring and evaluation.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Project-Based Evaluation</h3>
                <p className="text-sm text-muted-foreground">
                  Showcase your skills through real projects, not just resumes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Quality Connections</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with companies and candidates who value real skills.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Enterprise Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Built for scale with team collaboration and analytics.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-6">
            <h4 className="font-semibold text-foreground mb-2">Get Started Today</h4>
            <p className="text-sm text-muted-foreground">
              Sign up with your Google or GitHub account for instant access.
            </p>
          </div>
        </div>

        {/* Right side - Sign up form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-foreground">Create Account</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Join SkillHire and start your journey today.
              </p>
            </div>

            <SignUp
              appearance={{
                elements: {
                  card: "bg-card text-card-foreground border border-border",
                  headerSubtitle: "text-muted-foreground",
                  socialButtonsBlockButton: "border border-border hover:bg-muted",
                  formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                  footerActionLink: "text-primary hover:text-primary/80",
                },
              }}
              fallbackRedirectUrl="/onboarding"
              forceRedirectUrl="/onboarding"
              signInUrl="/sign-in/unified"
              afterSignUpUrl="/onboarding"
            />

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/sign-in/unified" className="text-primary hover:text-primary/80 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Looking for a specific role?{" "}
                <Link href="/onboarding" className="text-primary hover:text-primary/80 font-medium">
                  Choose your role
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
