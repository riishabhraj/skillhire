import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Application from '@/lib/models/Application'
import Job from '@/lib/models/Job'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { candidateId } = await params
    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 })
    }

    await connectDB()

    // Verify the user is an employer
    const employer = await User.findOne({ clerkId: userId, role: 'employer' })
    if (!employer) {
      return NextResponse.json({ error: 'Access denied. Employer role required.' }, { status: 403 })
    }

    // First, get all job IDs posted by this employer
    const employerJobs = await Job.find({ companyId: userId }).select('_id')
    const jobIds = employerJobs.map(job => job._id)

    // Find the candidate by clerkId (since candidateId is actually the clerkId)
    const candidate = await User.findOne({ 
      clerkId: candidateId, 
      role: 'candidate' 
    }).select('clerkId firstName lastName email profilePicture role candidateProfile')

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    // Find all applications from this candidate to jobs posted by this employer
    const applications = await Application.find({
      candidateId: candidateId,
      jobId: { $in: jobIds }
    }).populate('jobId', 'title companyName')

    // Transform the data
    const candidateData = {
      _id: candidate._id,
      firstName: candidate.profile?.firstName || '',
      lastName: candidate.profile?.lastName || '',
      email: candidate.email,
      profilePicture: candidate.profile?.profilePicture,
      role: candidate.role,
      candidateProfile: candidate.profile?.candidateProfile || {
        skills: { technical: [], soft: [] },
        experience: { totalYears: 0, relevantYears: 0, previousRoles: [] },
        availability: 'flexible',
        location: '',
        portfolio: []
      },
      applications: applications.map(app => ({
        _id: app._id,
        jobId: app.jobId,
        coverLetter: app.coverLetter,
        projects: app.projects,
        skills: app.skills,
        experience: app.experience,
        status: app.status,
        submittedAt: app.submittedAt,
        evaluation: app.evaluation
      }))
    }

    return NextResponse.json({ candidate: candidateData })
  } catch (error) {
    console.error('Error fetching candidate:', error)
    return NextResponse.json(
      { error: 'Failed to fetch candidate data' },
      { status: 500 }
    )
  }
}
