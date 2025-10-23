"use client"

import { Building2, Briefcase, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Join SkillHire</h1>
          <p className="text-lg text-muted-foreground">Choose how you'd like to use SkillHire</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Employer Sign Up */}
          <Link
            href="/employer"
            className="group rounded-xl border border-border bg-card p-8 hover:bg-muted/50 transition-all hover:shadow-lg"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">I'm Hiring</h3>
                <p className="text-muted-foreground">Employer account</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span className="text-sm text-muted-foreground">Post project-based job listings</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span className="text-sm text-muted-foreground">Review candidate projects</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span className="text-sm text-muted-foreground">Hire faster with better quality</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-primary font-medium">
              <span>Start hiring</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Candidate Sign Up */}
          <Link
            href="/candidate"
            className="group rounded-xl border border-border bg-card p-8 hover:bg-muted/50 transition-all hover:shadow-lg"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">I'm Job Hunting</h3>
                <p className="text-muted-foreground">Candidate account</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span className="text-sm text-muted-foreground">Showcase skills through projects</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span className="text-sm text-muted-foreground">Skip resume screening</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span className="text-sm text-muted-foreground">Connect with quality employers</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-primary font-medium">
              <span>Find opportunities</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:text-primary/80 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
