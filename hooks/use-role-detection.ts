"use client"

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

export function useRoleDetection() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [role, setRole] = useState<'employer' | 'candidate' | null>(null)
  const [isDetecting, setIsDetecting] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      setRole(null)
      setIsDetecting(false)
      return
    }

    // Fetch user role from database via API
    const fetchUserRole = async () => {
      try {
        const response = await fetch(`/api/users/${user?.id}`)
        if (response.ok) {
          const userData = await response.json()
          setRole(userData.role)
        } else {
          // If user not found in database, redirect to onboarding
          setRole(null)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
        setRole(null)
      } finally {
        setIsDetecting(false)
      }
    }

    fetchUserRole()
  }, [isLoaded, isSignedIn, user])

  const setUserRole = (newRole: 'employer' | 'candidate') => {
    setRole(newRole)
    // Don't store in localStorage for security
  }

  const clearRole = () => {
    setRole(null)
  }

  return {
    role,
    isDetecting,
    setUserRole,
    clearRole,
    isSignedIn,
    isLoaded
  }
}
