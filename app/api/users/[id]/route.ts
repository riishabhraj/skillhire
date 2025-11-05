import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Users can only access their own data
    if (userId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    let user = await User.findOne({ clerkId: id })
    
    // If user doesn't exist by Clerk ID, check by email and update, or create new
    if (!user) {
      // Get user info from Clerk
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(id)
      
      const email = clerkUser.emailAddresses[0]?.emailAddress || ''
      const firstName = clerkUser.firstName || ''
      const lastName = clerkUser.lastName || ''
      const profilePicture = clerkUser.imageUrl || ''

      // Check if user exists with this email (from old sign-up)
      user = await User.findOne({ email })
      
      if (user) {
        // User already exists - update their Clerk ID to link the accounts
        console.log('⚠️ User already exists with email:', email, 'Role:', user.role)
        
        // Update Clerk ID to link this session to the existing user
        user.clerkId = id
        
        // Update profile info from Clerk
        if (!user.profile) {
          user.profile = {}
        }
        user.profile.firstName = firstName
        user.profile.lastName = lastName
        user.profile.profilePicture = profilePicture
        
        await user.save()
        console.log('✅ Updated user Clerk ID and profile for:', email, 'Role:', user.role)
      } else {
        // Create new candidate user
        console.log('Creating new candidate user:', { id, email, firstName, lastName })

        user = new User({
          clerkId: id,
          email,
          role: 'candidate', // Default role for OAuth sign-ins
          profile: {
            firstName: firstName || '',
            lastName: lastName || '',
            profilePicture,
            bio: '',
            candidateProfile: {
              skills: [],
              experience: '',
              education: '',
              portfolio: '',
              resume: '',
              availability: 'immediately',
              preferredJobTypes: [],
              location: '',
              timezone: '',
              languages: []
            }
          }
        })

        await user.save()
        console.log('✅ Auto-created candidate user:', id, email)
      }
    }

    return NextResponse.json({
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
      firstName: user.profile?.firstName || user.firstName,
      lastName: user.profile?.lastName || user.lastName
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}