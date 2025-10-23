"use client"

import React from "react"
import { SignIn } from "@clerk/nextjs"
import { Briefcase, Zap, Star } from "lucide-react"
import Link from "next/link"

export default function CandidateAuthPage() {
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
              Showcase your skills through real projects and connect with companies that value your abilities.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Real Project Experience</h3>
                <p className="text-sm text-muted-foreground">
                  Work on actual projects that showcase your skills. No more generic coding challenges or resume screening.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Faster Interviews</h3>
                <p className="text-sm text-muted-foreground">
                  Skip the initial screening. Companies see your work first, leading to more meaningful conversations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Quality Opportunities</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with companies that value skills over credentials. Find roles that match your expertise.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-6">
            <h4 className="font-semibold text-foreground mb-2">Join 10,000+ candidates</h4>
            <p className="text-sm text-muted-foreground">
              "Finally, a platform where my skills speak louder than my resume. I found my dream job in 2 weeks!"
            </p>
            <p className="text-xs text-muted-foreground mt-2">- Mike Rodriguez, Full-stack Developer</p>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-foreground">Continue with Google</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Sign in or create your account to get started.
              </p>
            </div>

            <SignIn
              appearance={{
                elements: {
                  card: "bg-card text-card-foreground border border-border",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "border border-border hover:bg-muted",
                  formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                  footerActionLink: "text-primary hover:text-primary/80",
                  formFieldInput: "bg-background",
                  dividerLine: "bg-border",
                  dividerText: "text-muted-foreground",
                },
              }}
              routing="hash"
              signUpForceRedirectUrl="/candidate/dashboard"
              forceRedirectUrl="/candidate/dashboard"
            />

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Hiring talent?{" "}
                <Link href="/employer" className="text-primary hover:text-primary/80 font-medium">
                  Sign in as employer
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

