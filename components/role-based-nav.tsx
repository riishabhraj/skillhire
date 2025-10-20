"use client"

import Link from "next/link"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { useRoleDetection } from "@/hooks/use-role-detection"
import { Loader2, Briefcase, User, Settings, BarChart3, FileText, Users, Plus } from "lucide-react"

export default function RoleBasedNav() {
  const { role, isDetecting, isSignedIn } = useRoleDetection()

  return (
    <nav className="flex items-center gap-3">
      <SignedOut>
        <Link
          href="/sign-in/unified"
          className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted"
        >
          Sign In
        </Link>
        <Link
          href="/onboarding"
          className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
        >
          Get Started
        </Link>
      </SignedOut>
      
      <SignedIn>
        {isDetecting ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Role-based navigation links */}
            {role === 'candidate' && (
              <>
                <Link
                  href="/candidate/dashboard"
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Briefcase className="h-4 w-4" />
                  Find Jobs
                </Link>
                <Link
                  href="/candidate/applications"
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <FileText className="h-4 w-4" />
                  Applications
                </Link>
              </>
            )}
            
            {role === 'employer' && (
              <>
                <Link
                  href="/employer/dashboard"
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/employer/post-job"
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                  Post Job
                </Link>
                <Link
                  href="/employer/candidates"
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Users className="h-4 w-4" />
                  Candidates
                </Link>
                <Link
                  href="/employer/settings"
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </>
            )}
            
            {/* User profile button */}
            <UserButton 
              appearance={{ 
                elements: { 
                  userButtonPopoverCard: "bg-background text-foreground border border-border",
                  userButtonPopoverActionButton: "hover:bg-muted",
                  userButtonPopoverFooter: "hidden" // Hide the "Manage account" footer
                } 
              }} 
            />
          </div>
        )}
      </SignedIn>
    </nav>
  )
}
