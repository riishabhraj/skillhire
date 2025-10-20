import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Application from '@/lib/models/Application'
import Job from '@/lib/models/Job'
import EvaluationSettings from '@/lib/models/EvaluationSettings'
import { CandidateEvaluationService } from '@/lib/services/candidate-evaluation'
import { GitHubEnhancementService } from '@/lib/services/github-enhancement'

// POST /api/applications - Create new application
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { jobId, candidateId, coverLetter, projects, skills, experience } = body

    console.log('API: Received application data:', {
      jobId,
      candidateId,
      coverLetter: coverLetter ? `Length: ${coverLetter.length}` : 'Missing',
      projects: projects ? `Count: ${projects.length}` : 'Missing',
      skills: skills ? 'Present' : 'Missing',
      experience: experience ? 'Present' : 'Missing'
    })

    if (!jobId || !coverLetter || !projects || projects.length === 0) {
      console.log('API: Validation failed:', {
        jobId: !!jobId,
        coverLetter: !!coverLetter,
        projects: projects ? projects.length : 0
      })
      return NextResponse.json(
        { error: 'Job ID, cover letter, and at least one project are required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if job exists
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check if user already applied to this job
    const existingApplication = await Application.findOne({
      jobId,
      candidateId: candidateId || userId
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      )
    }

    // Create new application
    const newApplication = new Application({
      candidateId: candidateId || userId,
      jobId,
      coverLetter,
      projects,
      skills: skills || { technical: [], soft: [] },
      experience: experience || { totalYears: 0, relevantYears: 0, previousRoles: [] },
      status: 'submitted',
      submittedAt: new Date()
    })

    const savedApplication = await newApplication.save()

    // Update job application count
    job.totalApplications = (job.totalApplications || 0) + 1
    job.applications.push(savedApplication._id)
    await job.save()

    // Get evaluation settings for the job owner
    let settings = await EvaluationSettings.findOne({ companyId: job.companyId })
    if (!settings) {
      // Create default settings for the job owner
      settings = new EvaluationSettings({
        companyId: job.companyId,
        projectWeight: 0.5,
        experienceWeight: 0.3,
        skillsWeight: 0.2,
        minimumProjectScore: 70,
        enableAIAnalysis: true,
        githubIntegration: {
          enabled: false,
          minimumStars: 0,
          minimumCommits: 0,
          minimumRepositoryAge: 0,
          requireActiveMaintenance: false
        },
        status: 'active'
      })
      await settings.save()
    }

    // Automatically evaluate the application
    try {
      // Enhance projects with GitHub data if enabled
      let enhancedApplication = savedApplication
      if (settings.githubIntegration.enabled) {
        const githubService = new GitHubEnhancementService(settings.githubIntegration.token)
        const enhancedProjects = await githubService.enhanceProjectsWithGitHub(savedApplication.projects || [])
        enhancedApplication = {
          ...savedApplication,
          projects: enhancedProjects
        }
      }

      const evaluationService = new CandidateEvaluationService()
      const evaluation = await evaluationService.evaluateCandidate(
        enhancedApplication,
        job,
        {
          projectWeight: settings.projectWeight,
          experienceWeight: settings.experienceWeight,
          skillsWeight: settings.skillsWeight,
          minimumProjectScore: settings.minimumProjectScore,
          enableAIAnalysis: settings.enableAIAnalysis
        }
      )

      // Update application with evaluation results
      savedApplication.evaluation = evaluation
      savedApplication.status = evaluation.shortlistStatus === 'shortlisted' ? 'shortlisted' : 
                                evaluation.shortlistStatus === 'rejected' ? 'rejected' : 'under_review'
      
      if (evaluation.shortlistStatus === 'shortlisted') {
        savedApplication.shortlistedAt = new Date()
        job.shortlistedApplications = (job.shortlistedApplications || 0) + 1
        await job.save()
      }
      
      savedApplication.reviewedAt = new Date()
      await savedApplication.save()
    } catch (evaluationError) {
      console.error('Error evaluating application:', evaluationError)
      // Don't fail the application creation if evaluation fails
    }

    return NextResponse.json({ application: savedApplication }, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/applications - Get applications (for current user or company)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const candidateId = searchParams.get('candidateId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    await connectDB()

    // Build query
    const query: any = {}
    
    if (jobId) {
      query.jobId = jobId
    }
    
    if (candidateId) {
      query.candidateId = candidateId
    }
    
    if (status) {
      query.status = status
    }

    // If no specific candidateId provided, get applications for current user
    if (!candidateId) {
      query.candidateId = userId
    }

    // Execute query with pagination
    const skip = (page - 1) * limit
    const applications = await Application.find(query)
      .populate('jobId', 'title companyName location remote jobType')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Application.countDocuments(query)

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
