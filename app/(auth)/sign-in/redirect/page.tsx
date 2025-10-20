"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SignInRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to unified sign-in
    router.push("/sign-in/unified")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Redirecting...</h2>
        <p className="text-sm text-muted-foreground">Taking you to the sign-in page</p>
      </div>
    </div>
  )
}
