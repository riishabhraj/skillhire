"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SignUpRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to role selection
    router.push("/onboarding")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Redirecting...</h2>
        <p className="text-sm text-muted-foreground">Taking you to get started</p>
      </div>
    </div>
  )
}
