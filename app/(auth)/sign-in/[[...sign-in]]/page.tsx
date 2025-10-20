"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, Briefcase } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user has a role preference in localStorage
    const userRole = localStorage.getItem("userRoleIntent")
    
    // Check if user came from a specific referrer
    const referrer = document.referrer
    
    if (userRole === "employer") {
      router.push("/sign-in/employer")
    } else if (userRole === "candidate") {
      router.push("/sign-in/candidate")
    } else if (referrer.includes('/sign-up/employer') || referrer.includes('/employer')) {
      // If user came from employer pages, redirect to employer sign-in
      router.push("/sign-in/employer")
    } else if (referrer.includes('/sign-up/candidate') || referrer.includes('/candidate')) {
      // If user came from candidate pages, redirect to candidate sign-in
      router.push("/sign-in/candidate")
    }
    // If no role preference or specific referrer, show role selection
  }, [router])

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Sign In to SkillHire</h1>
          <p className="text-muted-foreground">Choose how you'd like to sign in</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Employer Sign In */}
          <Link
            href="/sign-in/employer"
            className="group rounded-lg border border-border bg-card p-6 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">I'm Hiring</h3>
                <p className="text-sm text-muted-foreground">Employer account</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Access your employer dashboard to manage job postings, review applicants, and hire talent.
            </p>
          </Link>

          {/* Candidate Sign In */}
          <Link
            href="/sign-in/candidate"
            className="group rounded-lg border border-border bg-card p-6 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">I'm Job Hunting</h3>
                <p className="text-sm text-muted-foreground">Candidate account</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Access your candidate dashboard to track applications, manage projects, and find opportunities.
            </p>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:text-primary/80 font-medium">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
