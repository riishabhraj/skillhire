"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRoleDetection } from "@/hooks/use-role-detection"
import { Loader2 } from "lucide-react"

interface OnboardingGuardProps {
  children: React.ReactNode
  allowedRoles: ('candidate' | 'employer')[]
}

export default function OnboardingGuard({ children, allowedRoles }: OnboardingGuardProps) {
  const { role, onboardingCompleted, isDetecting, isSignedIn } = useRoleDetection()
  const router = useRouter()

  useEffect(() => {
    if (!isDetecting && isSignedIn && role) {
      // Check if user has the right role
      if (!allowedRoles.includes(role)) {
        router.push('/')
        return
      }

      // Check if onboarding is completed
      if (!onboardingCompleted) {
        if (role === 'candidate') {
          router.push('/onboarding/candidate')
        } else if (role === 'employer') {
          router.push('/onboarding/employer')
        }
        return
      }
    }
  }, [role, onboardingCompleted, isDetecting, isSignedIn, allowedRoles, router])

  // Show loading while detecting
  if (isDetecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking onboarding status...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting
  if (isSignedIn && role && !onboardingCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting to onboarding...</p>
        </div>
      </div>
    )
  }

  // Show children if all checks pass
  if (isSignedIn && role && onboardingCompleted && allowedRoles.includes(role)) {
    return <>{children}</>
  }

  // Show loading for other cases
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
