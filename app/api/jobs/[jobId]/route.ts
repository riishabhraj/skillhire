import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Job from '@/lib/models/Job'
import Application from '@/lib/models/Application'

// GET /api/jobs/[jobId] - Get job details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
    console.log('API: Fetching job with ID:', jobId)
    await connectDB()
    
    const job = await Job.findById(jobId)
    console.log('API: Job found:', job ? 'Yes' : 'No')
    
    if (!job) {
      console.log('API: Job not found for ID:', jobId)
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Increment view count (you might want to track this)
    job.views = (job.views || 0) + 1
    await job.save()

    console.log('API: Returning job data for ID:', jobId)
    return NextResponse.json(job)
  } catch (error) {
    console.error('API: Error fetching job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/jobs/[jobId] - Update job (employer only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    await connectDB()
    
    const job = await Job.findById(jobId)
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check if user owns this job
    if (job.companyId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update job fields
    Object.keys(body).forEach(key => {
      if (body[key] !== undefined) {
        job[key] = body[key]
      }
    })

    const updatedJob = await job.save()
    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/jobs/[jobId] - Delete job (employer only)
export async function DELETE(
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
    
    const job = await Job.findById(jobId)
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check if user owns this job
    if (job.companyId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete associated applications
    await Application.deleteMany({ jobId: jobId })

    // Delete the job
    await Job.findByIdAndDelete(jobId)
    
    return NextResponse.json({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

