"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRoleDetection } from '@/hooks/use-role-detection'

interface RoleGuardProps {
  allowedRoles: ('employer' | 'candidate')[]
  children: React.ReactNode
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role, isDetecting, isSignedIn } = useRoleDetection()
  const router = useRouter()

  useEffect(() => {
    if (!isDetecting && isSignedIn) {
      if (!role) {
        // Redirect to home or appropriate page if user role is not found
        router.push('/')
        return
      }

      if (!allowedRoles.includes(role)) {
        // User doesn't have permission for this page
        const redirectPath = role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard'
        router.push(redirectPath)
        return
      }
    }
  }, [role, isDetecting, isSignedIn, allowedRoles, router])

  // Show loading while detecting role
  if (isDetecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing if user doesn't have permission (will redirect)
  if (isSignedIn && role && !allowedRoles.includes(role)) {
    return null
  }

  // Show nothing if user needs to complete onboarding
  if (isSignedIn && !role) {
    return null
  }

  return <>{children}</>
}
