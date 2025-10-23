import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { isCompanyEmail } from '@/lib/utils/email-validation'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    console.log('🔵 [CREATE-EMPLOYER] Auth check - User ID:', userId)
    
    if (!userId) {
      console.log('❌ [CREATE-EMPLOYER] Unauthorized - no user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()
    console.log('🔵 [CREATE-EMPLOYER] Received email:', email)

    if (!email || !isCompanyEmail(email)) {
      console.log('❌ [CREATE-EMPLOYER] Invalid company email:', email)
      return NextResponse.json({ error: 'Invalid company email' }, { status: 400 })
    }

    await connectDB()
    console.log('✅ [CREATE-EMPLOYER] Connected to DB')

    // Check if user already exists
    let user = await User.findOne({ clerkId: userId })
    console.log('🔍 [CREATE-EMPLOYER] Existing user by Clerk ID:', user ? `Found (${user.email}, ${user.role})` : 'Not found')

    if (user) {
      // If user exists but is a candidate, prevent role change
      if (user.role === 'candidate') {
        return NextResponse.json({ 
          error: 'This account is registered as a candidate. Please use a different email for employer account.',
          role: 'candidate'
        }, { status: 400 })
      }
      
      // User already exists as employer
      return NextResponse.json({ 
        success: true, 
        role: user.role,
        user: {
          id: user._id,
          clerkId: user.clerkId,
          email: user.email,
          role: user.role
        }
      })
    }

    // Check if user exists with this email but different Clerk ID
    user = await User.findOne({ email })
    console.log('🔍 [CREATE-EMPLOYER] Existing user by email:', user ? `Found (${user.email}, ${user.role})` : 'Not found')
    
    if (user) {
      // User exists with same email - update Clerk ID if role matches
      if (user.role === 'employer' || !user.role) {
        console.log('✅ [CREATE-EMPLOYER] Updating existing employer user')
        user.clerkId = userId
        user.role = 'employer'
        await user.save()
        
        return NextResponse.json({ 
          success: true, 
          role: 'employer',
          user: {
            id: user._id,
            clerkId: user.clerkId,
            email: user.email,
            role: user.role
          }
        })
      } else {
        // User is a candidate - don't allow conversion
        console.log('❌ [CREATE-EMPLOYER] User is a candidate, preventing role change')
        return NextResponse.json({ 
          error: 'This email is registered as a candidate. Please use a different company email.',
          role: 'candidate'
        }, { status: 400 })
      }
    }

    // Get user info from Clerk
    console.log('🔵 [CREATE-EMPLOYER] Fetching Clerk user data')
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    
    const firstName = clerkUser.firstName || ''
    const lastName = clerkUser.lastName || ''
    const profilePicture = clerkUser.imageUrl || ''

    console.log('🔵 [CREATE-EMPLOYER] Creating new employer user')
    // Create new employer user
    user = new User({
      clerkId: userId,
      email,
      role: 'employer',
      profile: {
        firstName: firstName || '',
        lastName: lastName || '',
        profilePicture: profilePicture || '',
        bio: '',
        employerProfile: {
          companyName: '',
          companySize: '1-10',
          industry: '',
          website: '',
          location: '',
          description: ''
        }
      }
    })

    await user.save()
    console.log('✅ [CREATE-EMPLOYER] Employer user created successfully:', user._id)

    return NextResponse.json({ 
      success: true, 
      role: 'employer',
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error creating employer account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

