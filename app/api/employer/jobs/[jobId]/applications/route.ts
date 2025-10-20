import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Application from '@/lib/models/Application'
import Job from '@/lib/models/Job'
import User from '@/lib/models/User'

// GET /api/employer/jobs/[jobId]/applications - Get applications for a specific job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Check if job exists and user owns it
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.companyId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch applications for this job
    const applications = await Application.find({ jobId })
      .sort({ submittedAt: -1 })

    return NextResponse.json({
      applications,
      total: applications.length
    })
  } catch (error) {
    console.error('Error fetching job applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
