"use client"

import React from "react"
import { SignUp } from "@clerk/nextjs"
import { Building2, Users, Target } from "lucide-react"
import Link from "next/link"

export default function EmployerSignUpPage() {
  // Set role intent in localStorage when component mounts
  React.useEffect(() => {
    localStorage.setItem('userRoleIntent', 'employer')
  }, [])

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left side - Benefits */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Hire the Right Talent
            </h1>
            <p className="text-lg text-muted-foreground">
              Join thousands of companies using project-based hiring to find better candidates faster.
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

          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-foreground text-center">Choose Your Plan</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Basic Plan */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center">
                  <h5 className="text-lg font-semibold text-foreground mb-2">Basic</h5>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">$99</span>
                    <span className="text-muted-foreground">/job</span>
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
                  <div className="text-xs text-muted-foreground">
                    Perfect for single job postings
                  </div>
                </div>
              </div>

              {/* Premium Plan */}
              <div className="rounded-xl border border-primary bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                </div>
                <div className="text-center">
                  <h5 className="text-lg font-semibold text-foreground mb-2">Premium</h5>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">$128</span>
                    <span className="text-muted-foreground">/job</span>
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
                  <div className="text-xs text-muted-foreground">
                    Best for professional hiring
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              No monthly fees • Pay only for what you use • Cancel anytime
            </div>
          </div>
        </div>

        {/* Right side - Sign up form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-foreground">Start Hiring Today</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Create your employer account and post your first job in minutes.
              </p>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Please use your company email address to sign up as an employer.
                </p>
              </div>
            </div>

            <SignUp
              appearance={{
                elements: {
                  card: "bg-card text-card-foreground border border-border",
                  headerSubtitle: "text-muted-foreground",
                  socialButtonsBlockButton: "hidden", // Hide social login buttons
                  formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                  footerActionLink: "text-primary hover:text-primary/80",
                },
              }}
              fallbackRedirectUrl="/onboarding/employer"
              forceRedirectUrl="/onboarding/employer"
              signInUrl="/sign-in/employer"
              path="/sign-up/employer"
            />

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/sign-in/employer" className="text-primary hover:text-primary/80 font-medium">
                  Sign in as employer
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Looking for a job?{" "}
                <Link href="/sign-up/candidate" className="text-primary hover:text-primary/80 font-medium">
                  Sign up as candidate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
