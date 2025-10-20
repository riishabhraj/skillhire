import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const user = await User.findById(params.id)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only return basic profile info for other users
    const publicProfile = {
      _id: user._id,
      role: user.role,
      profile: {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        profilePicture: user.profile.profilePicture,
        bio: user.profile.bio,
        // Only include relevant profile data based on role
        ...(user.role === 'candidate' && user.profile.candidateProfile ? {
          candidateProfile: {
            skills: user.profile.candidateProfile.skills,
            experience: user.profile.candidateProfile.experience,
            availability: user.profile.candidateProfile.availability,
            location: user.profile.candidateProfile.location,
            languages: user.profile.candidateProfile.languages
          }
        } : {}),
        ...(user.role === 'employer' && user.profile.employerProfile ? {
          employerProfile: {
            companyName: user.profile.employerProfile.companyName,
            companySize: user.profile.employerProfile.companySize,
            industry: user.profile.employerProfile.industry,
            companyDescription: user.profile.employerProfile.companyDescription,
            location: user.profile.employerProfile.location
          }
        } : {})
      }
    }

    return NextResponse.json(publicProfile)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    await connectDB()
    
    const user = await User.findOne({ clerkId: userId })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update profile fields
    if (body.profile) {
      user.profile = { ...user.profile, ...body.profile }
    }
    
    if (body.email) {
      user.email = body.email
    }

    const updatedUser = await user.save()
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Delete user profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await User.findByIdAndDelete(user._id)
    
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
