"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function RoleRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Check if user has a role set
    const userRole = localStorage.getItem("userRole")
    
    if (userRole === "employer") {
      router.push("/employer/dashboard")
    } else if (userRole === "candidate") {
      router.push("/candidate/dashboard")
    } else {
      // No role set, redirect to onboarding
      router.push("/onboarding")
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
