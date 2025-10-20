"use client"

import React from "react"
import { SignIn } from "@clerk/nextjs"
import { Building2, Users, Target, UserCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function UnifiedSignInPage() {
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

  const handleSignInSuccess = () => {
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
              Welcome to SkillHire
            </h1>
            <p className="text-lg text-muted-foreground">
              Sign in to continue your journey with project-based hiring and evaluation.
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
                  See actual skills in action, not just resumes. Create custom projects that mirror real work.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Quality Matches</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with motivated professionals who are serious about their roles.
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
                  Scale your hiring process with team collaboration and analytics.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-6">
            <h4 className="font-semibold text-foreground mb-2">Ready to Get Started?</h4>
            <p className="text-sm text-muted-foreground">
              Sign in with your Google or GitHub account for seamless authentication.
            </p>
          </div>
        </div>

        {/* Right side - Sign in form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-foreground">Sign In</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Access your account and continue your journey.
              </p>
            </div>

            <SignIn
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
              signUpUrl="/sign-up/unified"
              afterSignInUrl="/onboarding"
            />

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/sign-up/unified" className="text-primary hover:text-primary/80 font-medium">
                  Sign up here
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
