"use client"

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export function useUserData() {
  const { user, isLoaded } = useUser()
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    if (isLoaded && user) {
      setUserData({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profileImageUrl: user.profileImageUrl || '',
      })
    }
  }, [isLoaded, user])

  return { userData, isLoaded }
}
