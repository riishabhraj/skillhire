import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Job from '@/lib/models/Job'
import Application from '@/lib/models/Application'

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
    let jobs = await Job.find(query)
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(limit)

    // Ensure metrics are up to date by deriving from Applications
    if (jobs.length > 0) {
      const jobIds = jobs.map(j => j._id)
      const jobIdStrings = jobIds.map((id: any) => String(id))
      // Aggregate counts per job
      const counts = await Application.aggregate([
        { $match: { jobId: { $in: jobIdStrings } } },
        {
          $group: {
            _id: '$jobId',
            total: { $sum: 1 },
            shortlisted: {
              $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] }
            }
          }
        }
      ])

      const idToCounts = new Map<string, { total: number; shortlisted: number }>()
      counts.forEach((c: any) => {
        idToCounts.set(String(c._id), { total: c.total || 0, shortlisted: c.shortlisted || 0 })
      })

      // Attach computed metrics (and opportunistically synchronize fields)
      jobs = jobs.map(j => {
        const c = idToCounts.get(String(j._id)) || idToCounts.get(String(j._id)) || { total: 0, shortlisted: 0 }
        ;(j as any).totalApplications = c.total
        ;(j as any).shortlistedApplications = c.shortlisted
        return j
      })
    }

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