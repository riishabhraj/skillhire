"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRoleDetection } from "@/hooks/use-role-detection"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { role, isDetecting } = useRoleDetection()
  const router = useRouter()

  useEffect(() => {
    if (!isDetecting) {
      if (role === 'candidate') {
        router.replace('/candidate/dashboard')
      } else if (role === 'employer') {
        router.replace('/employer/dashboard')
      } else {
        // No role detected, redirect to onboarding
        router.replace('/onboarding')
      }
    }
  }, [role, isDetecting, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Redirecting to your dashboard...</span>
      </div>
    </div>
  )
}