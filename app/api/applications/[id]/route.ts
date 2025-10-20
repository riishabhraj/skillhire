import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Application from '@/lib/models/Application'
import Job from '@/lib/models/Job'
import { revalidatePath } from 'next/cache'

// PATCH /api/applications/[id] - Update application status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    await connectDB()

    // Find the application
    const application = await Application.findById(id)
      .populate('jobId', '_id companyId title')

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check if the user is the job owner
    const job = application.jobId as any
    if (job.companyId !== userId) {
      return NextResponse.json({ error: 'Unauthorized to update this application' }, { status: 403 })
    }

    // Track previous status to adjust job counters
    const previousStatus = application.status

    // Update the application status
    application.status = status
    await application.save()

    // Update Job shortlistedApplications counter if needed
    try {
      const isPrevShortlisted = previousStatus === 'shortlisted'
      const isNowShortlisted = status === 'shortlisted'
      if (isPrevShortlisted !== isNowShortlisted) {
        const inc = isNowShortlisted ? 1 : -1
        const populated = application.jobId as any
        const jobObjectId = populated?._id || application.jobId
        if (jobObjectId) {
          await Job.updateOne({ _id: jobObjectId }, { $inc: { shortlistedApplications: inc } })
        }
      }
    } catch (counterErr) {
      console.error('Failed updating job shortlistedApplications counter:', counterErr)
    }

    // Revalidate dashboards
    try {
      revalidatePath('/employer/dashboard')
      revalidatePath('/candidate/dashboard')
    } catch (revErr) {
      console.warn('Revalidate dashboards warning:', revErr)
    }

    return NextResponse.json({ 
      message: 'Application status updated successfully',
      application: {
        _id: application._id,
        status: application.status,
        submittedAt: application.submittedAt
      }
    })

  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
