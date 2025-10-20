"use client"

import Link from "next/link"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

export default function AuthNav() {
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
        <UserButton appearance={{ elements: { userButtonPopoverCard: "bg-background text-foreground" } }} />
      </SignedIn>
    </nav>
  )
}
