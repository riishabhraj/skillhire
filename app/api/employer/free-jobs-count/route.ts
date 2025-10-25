import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Job from '@/lib/models/Job'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    // Count all jobs posted by this employer (including active, paused, and completed)
    const existingJobsCount = await Job.countDocuments({ 
      companyId: userId
    })
    
    const freeJobsRemaining = Math.max(0, 20 - existingJobsCount)
    
    return NextResponse.json({ 
      freeJobsRemaining,
      totalJobsPosted: existingJobsCount,
      isEligibleForFree: freeJobsRemaining > 0
    })
  } catch (error) {
    console.error('Error fetching free jobs count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch free jobs count' },
      { status: 500 }
    )
  }
}
