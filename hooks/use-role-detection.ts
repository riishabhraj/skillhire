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

    // Check localStorage for role intent (with backward compatibility)
    const roleIntent = localStorage.getItem('userRoleIntent') || localStorage.getItem('userRole')
    
    if (roleIntent === 'employer' || roleIntent === 'candidate') {
      setRole(roleIntent)
      setIsDetecting(false)
      return
    }

    // Check if user has role in their metadata
    if (user?.publicMetadata?.role) {
      setRole(user.publicMetadata.role as 'employer' | 'candidate')
      setIsDetecting(false)
      return
    }

    // If no role found, set to null
    setRole(null)
    setIsDetecting(false)
  }, [isLoaded, isSignedIn, user])

  const setUserRole = (newRole: 'employer' | 'candidate') => {
    setRole(newRole)
    localStorage.setItem('userRoleIntent', newRole)
  }

  const clearRole = () => {
    setRole(null)
    localStorage.removeItem('userRoleIntent')
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
