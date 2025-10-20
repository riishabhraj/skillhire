"use client"

import React from "react"
import { SignIn } from "@clerk/nextjs"
import { Building2, Users, Target } from "lucide-react"
import Link from "next/link"

export default function EmployerSignInPage() {
  // Set role intent in localStorage when component mounts
  React.useEffect(() => {
    localStorage.setItem('userRoleIntent', 'employer')
  }, [])

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left side - Benefits reminder */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Welcome Back, Employer
            </h1>
            <p className="text-lg text-muted-foreground">
              Continue managing your hiring process and finding the best talent through project-based evaluation.
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
                  See candidates' actual skills in action, not just resumes. Create custom projects that mirror your real work.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Quality Candidates</h3>
                <p className="text-sm text-muted-foreground">
                  Attract motivated candidates who are serious about your role. Reduce time-to-hire by 70%.
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
                  Scale your hiring process with team collaboration, analytics, and integration tools.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-6">
            <h4 className="font-semibold text-foreground mb-2">Your Dashboard Awaits</h4>
            <p className="text-sm text-muted-foreground">
              Access your job postings, review applicants, and manage your hiring pipeline all in one place.
            </p>
          </div>
        </div>

        {/* Right side - Sign in form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-foreground">Sign In to Your Account</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Access your employer dashboard and continue hiring.
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
              fallbackRedirectUrl="/onboarding/employer"
              forceRedirectUrl="/onboarding/employer"
              signUpUrl="/sign-up/employer"
              path="/sign-in/employer"
            />

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/sign-up/employer" className="text-primary hover:text-primary/80 font-medium">
                  Sign up as employer
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Looking for a job?{" "}
                <Link href="/sign-in/candidate" className="text-primary hover:text-primary/80 font-medium">
                  Sign in as candidate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
