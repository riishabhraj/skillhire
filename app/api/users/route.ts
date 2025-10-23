import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { isCompanyEmail, getCompanyEmailErrorMessage } from '@/lib/utils/email-validation'

// GET /api/users - Get current user profile
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const user = await User.findOne({ clerkId: userId })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create or update user profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, role, profile } = body

    // Debug: Log the received data
    console.log('Received profile data:', JSON.stringify(profile, null, 2))
    console.log('Company size value:', profile?.employerProfile?.companySize)

    if (!email || !role || !profile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['employer', 'candidate'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Validate employer email - must be company email, not free provider
    if (role === 'employer' && !isCompanyEmail(email)) {
      return NextResponse.json(
        { error: getCompanyEmailErrorMessage(email) },
        { status: 400 }
      )
    }

    await connectDB()
    
    // Check if user already exists
    const existingUser = await User.findOne({ clerkId: userId })
    
    if (existingUser) {
      // Update existing user
      existingUser.email = email
      existingUser.role = role
      
      // Update only the relevant profile fields
      existingUser.profile.firstName = profile.firstName
      existingUser.profile.lastName = profile.lastName
      existingUser.profile.profilePicture = profile.profilePicture
      existingUser.profile.bio = profile.bio
      
      // Update role-specific profile
      if (role === 'candidate' && profile.candidateProfile) {
        existingUser.profile.candidateProfile = profile.candidateProfile
      } else if (role === 'employer' && profile.employerProfile) {
        // Ensure companySize is not empty
        if (profile.employerProfile.companySize === '') {
          profile.employerProfile.companySize = '1-10' // Default value
        }
        existingUser.profile.employerProfile = profile.employerProfile
      }
      
      const updatedUser = await existingUser.save()
      return NextResponse.json(updatedUser)
    } else {
      // Create new user - only include the relevant profile based on role
      const userData: any = {
        clerkId: userId,
        email,
        role,
        profile: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          profilePicture: profile.profilePicture,
          bio: profile.bio
        }
      }
      
      // Add role-specific profile
      if (role === 'candidate' && profile.candidateProfile) {
        userData.profile.candidateProfile = profile.candidateProfile
      } else if (role === 'employer' && profile.employerProfile) {
        // Ensure companySize is not empty
        if (profile.employerProfile.companySize === '') {
          profile.employerProfile.companySize = '1-10' // Default value
        }
        userData.profile.employerProfile = profile.employerProfile
      }
      
      const newUser = new User(userData)
      const savedUser = await newUser.save()
      return NextResponse.json(savedUser, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating/updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
