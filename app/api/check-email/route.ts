import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { isCompanyEmail, getCompanyEmailErrorMessage } from '@/lib/utils/email-validation'

// POST /api/check-email - Check if email is valid for the requested role
export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json()

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      )
    }

    // Check if it's a company email for employer signups
    if (role === 'employer' && !isCompanyEmail(email)) {
      return NextResponse.json(
        { 
          valid: false,
          error: getCompanyEmailErrorMessage(email)
        },
        { status: 400 }
      )
    }

    // Check if email is already registered with a different role
    await connectDB()
    const existingUser = await User.findOne({ email })

    if (existingUser && existingUser.role !== role) {
      return NextResponse.json(
        {
          valid: false,
          error: `This email is already registered as a ${existingUser.role}. Please use a different email or sign in as ${existingUser.role}.`
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

