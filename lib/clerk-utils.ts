import { currentUser } from '@clerk/nextjs/server'

export async function getCurrentUserData() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      profileImageUrl: user.profileImageUrl || '',
    }
  } catch (error) {
    console.error('Error getting current user data:', error)
    return null
  }
}
