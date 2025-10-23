import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Job from '@/lib/models/Job'

// Temporary endpoint for testing - manually activate a job (bypassing payment in test mode)
export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { userId } = await auth()
    const { jobId } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Find the job and verify ownership
    const job = await Job.findById(jobId)

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.companyId !== userId) {
      return NextResponse.json({ error: 'Unauthorized - not your job' }, { status: 403 })
    }

    // Update job to active status (for testing only)
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        paymentStatus: 'paid',
        status: 'active',
        paidAt: new Date(),
        lemonSqueezyOrderId: 'test-mode-' + Date.now()
      },
      { new: true }
    )

    console.log(`✅ [TEST MODE] Job ${jobId} manually activated`)

    return NextResponse.json({
      success: true,
      message: 'Job activated for testing',
      job: updatedJob
    })
  } catch (error) {
    console.error('Error activating job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

