import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Job from '@/lib/models/Job'

// GET /api/employer/jobs - Get jobs posted by the current employer
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    await connectDB()

    // Build query
    const query: any = { companyId: userId }
    
    if (status) {
      query.status = status
    }

    // Execute query with pagination
    const skip = (page - 1) * limit
    const jobs = await Job.find(query)
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Job.countDocuments(query)

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching employer jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}