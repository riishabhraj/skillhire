import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Application from '@/lib/models/Application'
import Job from '@/lib/models/Job'
import EvaluationSettings from '@/lib/models/EvaluationSettings'
import { CandidateEvaluationService } from '@/lib/services/candidate-evaluation'
import { HFEvaluatorService } from '@/lib/services/hf-evaluator'
import { GitHubEnhancementService } from '@/lib/services/github-enhancement'
import { AdvancedAIEvaluator } from '@/lib/services/advanced-ai-evaluator'
import { isEvaluationVisible, getCandidateStatus, getCandidateEvaluation, getTimeUntilVisible } from '@/lib/utils/evaluation-visibility'
import User from '@/lib/models/User'

/**
 * Sync projects from application to candidate's profile portfolio
 * Prevents duplicates based on project ID or title+githubUrl
 */
async function syncProjectsToProfile(candidateId: string, projects: any[]) {
  const user = await User.findOne({ clerkId: candidateId })
  
  if (!user || user.role !== 'candidate') {
    console.warn('User not found or not a candidate, skipping project sync')
    return
  }

  // Initialize projects array if it doesn't exist
  if (!user.profile.candidateProfile) {
    user.profile.candidateProfile = {}
  }
  
  if (!user.profile.candidateProfile.projects) {
    user.profile.candidateProfile.projects = []
  }

  const existingProjects = user.profile.candidateProfile.projects || []

  // Add new projects (avoid duplicates)
  for (const project of projects) {
    // Check if project already exists (by ID or by title+githubUrl)
    const isDuplicate = existingProjects.some((existingProj: any) => {
      if (existingProj.id === project.id) return true
      if (project.githubUrl && existingProj.githubUrl === project.githubUrl) return true
      if (existingProj.title === project.title && !project.githubUrl && !existingProj.githubUrl) return true
      return false
    })

    if (!isDuplicate) {
      existingProjects.push({
        ...project,
        addedAt: new Date()
      })
      console.log(`📁 Added new project to profile: ${project.title}`)
    } else {
      console.log(`⏭️  Project already in profile: ${project.title}`)
    }
  }

  user.profile.candidateProfile.projects = existingProjects
  await user.save()
}

// POST /api/applications - Create new application
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Check user role - only candidates can apply for jobs
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Only candidates can apply for jobs. Employers cannot apply for positions.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { jobId, candidateId, coverLetter, projects, skills, experience } = body

    // Validate required fields
    if (!jobId || !projects || projects.length === 0) {
      return NextResponse.json(
        { error: 'Job ID and at least one project are required' },
        { status: 400 }
      )
    }

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

    // Debug: Log skills data
    console.log('Skills data received:', JSON.stringify(skills, null, 2))
    console.log('Technical skills:', skills?.technical)

    // Create new application
    const newApplication = new Application({
      candidateId: candidateId || userId,
      jobId,
      coverLetter: coverLetter || '', // Cover letter is optional
      projects,
      skills: skills || { technical: [], soft: [] },
      experience: experience || { totalYears: 0, relevantYears: 0, previousRoles: [] },
      status: 'submitted',
      submittedAt: new Date()
    })

    const savedApplication = await newApplication.save()
    
    // Debug: Log saved application to verify skills were saved
    console.log('Saved application from DB:', JSON.stringify(savedApplication.skills, null, 2))

    // Update job application count
    job.totalApplications = (job.totalApplications || 0) + 1
    job.applications.push(savedApplication._id)
    await job.save()

    // NEW: Sync projects to candidate's profile portfolio
    try {
      await syncProjectsToProfile(candidateId || userId, projects)
      console.log('✅ Projects synced to candidate profile')
    } catch (syncError) {
      console.error('Failed to sync projects to profile:', syncError)
      // Don't fail the application if sync fails
    }

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
          enabled: true,
          token: process.env.GITHUB_TOKEN || '',
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
      // Debug: Log saved application skills before enhancement
      console.log('Saved application skills:', savedApplication.skills)
      console.log('Saved application technical skills:', savedApplication.skills?.technical)
      
      // Enhance projects with GitHub data if enabled
      let enhancedApplication = savedApplication
      if (settings.githubIntegration.enabled) {
        const githubService = new GitHubEnhancementService(settings.githubIntegration.token)
        const enhancedProjects = await githubService.enhanceProjectsWithGitHub(savedApplication.projects || [])
        enhancedApplication = {
          ...savedApplication.toObject(), // Convert Mongoose document to plain object
          projects: enhancedProjects
        }
      }
      
      // Debug: Log enhanced application skills
      console.log('Enhanced application skills:', enhancedApplication.skills)
      console.log('Enhanced application technical skills:', enhancedApplication.skills?.technical)

      const evaluationService = new CandidateEvaluationService()
      let evaluation = await evaluationService.evaluateCandidate(
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

      // Optional: Blend with Hugging Face LLM scoring if configured
      if (settings.enableAIAnalysis) {
        try {
          const hf = new HFEvaluatorService()
          if (hf.isConfigured()) {
            const hfScores = await hf.scoreApplication({
              job,
              candidate: enhancedApplication,
              projects: (enhancedApplication as any).projects || []
            })
            if (hfScores) {
              // Blend scores (70% rule, 30% LLM by default)
              const alpha = 0.3
              const blend = (a: number, b: number) => Math.round(a * (1 - alpha) + b * alpha)
              evaluation.projectScore = blend(evaluation.projectScore, hfScores!.projectScore)
              evaluation.skillsScore = blend(evaluation.skillsScore, hfScores!.skillsScore)
              evaluation.experienceScore = blend(evaluation.experienceScore, hfScores!.experienceScore)
              evaluation.overallScore = blend(evaluation.overallScore, hfScores!.overallScore)
              // Re-evaluate shortlist status with blended score
              evaluation.shortlistStatus = evaluation.overallScore >= Math.round(settings.minimumProjectScore) ? 'shortlisted' : evaluation.shortlistStatus
              if (hfScores!.feedback) {
                evaluation.feedback = (evaluation.feedback ? evaluation.feedback + '\n' : '') + hfScores!.feedback
              }
            }
          }
        } catch (hfError) {
          // Continue with rule-based evaluation if HF fails
          console.warn('Hugging Face evaluation failed, using rule-based only:', hfError)
        }
        
        // NEW: Advanced AI Evaluation with RAG (Vector Embeddings + Deep Analysis)
        try {
          console.log('🚀 Starting Advanced AI Evaluation with RAG...')
          const advancedEvaluator = new AdvancedAIEvaluator(
            process.env.HF_TOKEN,
            process.env.GITHUB_TOKEN
          )
          
          if (advancedEvaluator.isConfigured()) {
            const advancedResult = await advancedEvaluator.evaluateWithRAG({
              job,
              application: enhancedApplication as any,
              enhancedProjects: (enhancedApplication as any).projects || []
            })
            
            if (advancedResult) {
              // Store advanced evaluation results
              (evaluation as any).advancedEvaluation = {
                semanticScore: advancedResult.semanticScore,
                technicalDepthScore: advancedResult.technicalDepthScore,
                innovationScore: advancedResult.innovationScore,
                aiRanking: advancedResult.aiRanking,
                aiAnalysis: advancedResult.aiAnalysis,
                aiConfidence: advancedResult.aiConfidence,
                overallRecommendation: advancedResult.overallRecommendation,
                strengths: advancedResult.strengths,
                weaknesses: advancedResult.weaknesses,
                keyTakeaways: advancedResult.keyTakeaways,
                projectInsights: advancedResult.projectInsights
              }
              
              // Optionally boost shortlist status for top-tier candidates
              if (advancedResult.aiRanking === 'top-tier' && advancedResult.overallRecommendation === 'strongly-recommend') {
                evaluation.shortlistStatus = 'shortlisted'
                console.log('✨ Top-tier candidate auto-shortlisted!')
              }
              
              // Enhance feedback with AI analysis
              if (advancedResult.aiAnalysis) {
                evaluation.feedback = `${evaluation.feedback}\n\n🤖 Advanced AI Analysis:\n${advancedResult.aiAnalysis}`
              }
              
              console.log(`✅ Advanced evaluation complete: ${advancedResult.aiRanking} (Confidence: ${advancedResult.aiConfidence}%)`)
            }
          } else {
            console.log('⚠️ Advanced AI evaluation skipped: HF token not configured')
          }
        } catch (advancedError) {
          console.error('Advanced AI evaluation failed:', advancedError)
          // Continue without advanced evaluation
        }
      }

      // Store evaluation results but don't immediately show to candidate
      savedApplication.evaluation = evaluation
      savedApplication.status = 'under_review' // Always start as under_review for candidates
      savedApplication.reviewedAt = new Date()
      savedApplication.evaluationVisibleAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours from now
      
      // Store the actual status internally for employer reference
      savedApplication.internalStatus = evaluation.shortlistStatus === 'shortlisted' ? 'shortlisted' : 
                                       evaluation.shortlistStatus === 'rejected' ? 'rejected' : 'under_review'
      
      if (evaluation.shortlistStatus === 'shortlisted') {
        savedApplication.shortlistedAt = new Date()
        job.shortlistedApplications = (job.shortlistedApplications || 0) + 1
        await job.save()
      }
      
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

    // Check if this is a candidate viewing their own applications
    const isCandidateView = !candidateId || candidateId === userId
    
    // Apply visibility logic for candidates
    const processedApplications = applications.map(app => {
      if (isCandidateView) {
        // For candidates, apply visibility logic
        const candidateApp = {
          ...app.toObject(),
          status: getCandidateStatus(app),
          evaluation: getCandidateEvaluation(app),
          timeUntilVisible: getTimeUntilVisible(app)
        }
        return candidateApp
      } else {
        // For employers, show full data
        return app
      }
    })

    return NextResponse.json({
      applications: processedApplications,
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
