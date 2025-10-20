import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Application from '@/lib/models/Application'
import Job from '@/lib/models/Job'

// GET /api/applications/[id] - Get a specific application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await connectDB()

    // Find the application and populate job details
    const application = await Application.findById(id)
      .populate('jobId', 'title companyName location remote jobType category salary postedAt')

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check if the application belongs to the current user
    if (application.candidateId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/applications/[id] - Update application status (for employers)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    await connectDB()

    // Find the application
    const application = await Application.findById(id).populate('jobId')
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check if the current user is the job owner
    if (application.jobId.companyId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update application status
    application.status = status
    application.reviewedAt = new Date()
    
    if (status === 'shortlisted') {
      application.shortlistedAt = new Date()
    }

    await application.save()

    // Update job shortlisted applications count
    const job = await Job.findById(application.jobId._id)
    if (job) {
      if (status === 'shortlisted' && application.status !== 'shortlisted') {
        job.shortlistedApplications = (job.shortlistedApplications || 0) + 1
      } else if (application.status === 'shortlisted' && status !== 'shortlisted') {
        job.shortlistedApplications = Math.max((job.shortlistedApplications || 0) - 1, 0)
      }
      await job.save()
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}