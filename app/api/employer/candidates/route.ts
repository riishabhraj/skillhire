import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Application from '@/lib/models/Application'
import Job from '@/lib/models/Job'

// GET /api/employer/candidates - Get candidates who applied to employer's jobs
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    await connectDB()

    // First, get all job IDs posted by this employer
    const employerJobs = await Job.find({ companyId: userId }).select('_id')
    const jobIds = employerJobs.map(job => job._id)
    
    console.log('Employer jobs found:', employerJobs.length)
    console.log('Job IDs:', jobIds)

    // Get all applications for jobs posted by this employer
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .sort({ submittedAt: -1 })
    
    console.log('Applications found:', applications.length)

    // Get unique candidate IDs
    const candidateIds = [...new Set(applications.map(app => app.candidateId).filter(Boolean))]
    console.log('Candidate IDs from applications:', candidateIds)
    
    // Fetch candidate data
    const candidatesData = await User.find({ 
      clerkId: { $in: candidateIds },
      role: 'candidate'
    }).select('clerkId firstName lastName email profilePicture role candidateProfile')
    
    console.log('Candidates data found:', candidatesData.length)
    console.log('Candidate IDs in DB:', candidatesData.map(c => c.clerkId))

    // Create a map of candidates with their applications
    const candidateMap = new Map()
    
    applications.forEach(app => {
      if (app.candidateId) {
        const candidate = candidatesData.find(c => c.clerkId === app.candidateId)
        console.log(`Looking for candidate ${app.candidateId}, found:`, candidate ? 'YES' : 'NO')
        if (candidate) {
          if (!candidateMap.has(candidate._id)) {
            candidateMap.set(candidate._id, {
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
              applications: []
            })
          }
          candidateMap.get(candidate._id).applications.push({
            _id: app._id,
            jobId: app.jobId,
            status: app.status,
            evaluation: app.evaluation,
            submittedAt: app.submittedAt
          })
        }
      }
    })
    
    console.log('Final candidate map size:', candidateMap.size)

    const candidates = Array.from(candidateMap.values())

    // Apply pagination
    const skip = (page - 1) * limit
    const paginatedCandidates = candidates.slice(skip, skip + limit)

    return NextResponse.json({
      candidates: paginatedCandidates,
      pagination: {
        page,
        limit,
        total: candidates.length,
        pages: Math.ceil(candidates.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
