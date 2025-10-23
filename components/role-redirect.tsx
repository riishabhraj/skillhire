"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from '@clerk/nextjs'

export function RoleRedirect() {
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const [role, setRole] = useState<'employer' | 'candidate' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (isLoaded && isSignedIn && user?.id) {
        try {
          const response = await fetch(`/api/users/${user.id}`)
          if (response.ok) {
            const userData = await response.json()
            setRole(userData.role)
          } else {
            setRole(null)
          }
        } catch {
          setRole(null)
        } finally {
          setLoading(false)
        }
      } else if (isLoaded && !isSignedIn) {
        setLoading(false)
        setRole(null)
      }
    }
    fetchUserRole()
  }, [isLoaded, isSignedIn, user])

  useEffect(() => {
    if (loading) return
    if (role === "employer") {
      router.push("/employer/dashboard")
    } else if (role === "candidate") {
      router.push("/candidate/dashboard")
    } else {
      router.push('/')
    }
  }, [role, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
