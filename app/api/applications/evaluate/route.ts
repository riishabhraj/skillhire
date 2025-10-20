import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Application from '@/lib/models/Application'
import Job from '@/lib/models/Job'
import EvaluationSettings from '@/lib/models/EvaluationSettings'
import { CandidateEvaluationService } from '@/lib/services/candidate-evaluation'
import { GitHubEnhancementService } from '@/lib/services/github-enhancement'

// POST /api/applications/evaluate - Evaluate and shortlist candidates
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { applicationId, jobId } = body

    if (!applicationId && !jobId) {
      return NextResponse.json(
        { error: 'Either applicationId or jobId is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Get or create evaluation settings
    let settings = await EvaluationSettings.findOne({ companyId: userId })
    if (!settings) {
      // Create default settings
      settings = new EvaluationSettings({
        companyId: userId,
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

    const evaluationService = new CandidateEvaluationService()

    if (applicationId) {
      // Evaluate single application
      const application = await Application.findById(applicationId)
      if (!application) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        )
      }

      const job = await Job.findById(application.jobId)
      if (!job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        )
      }

      // Enhance projects with GitHub data if enabled
      let enhancedApplication = application
      if (settings.githubIntegration.enabled) {
        const githubService = new GitHubEnhancementService(settings.githubIntegration.token)
        const enhancedProjects = await githubService.enhanceProjectsWithGitHub(application.projects || [])
        enhancedApplication = {
          ...application,
          projects: enhancedProjects
        }
      }

      // Perform evaluation
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
      application.evaluation = evaluation
      application.status = evaluation.shortlistStatus === 'shortlisted' ? 'shortlisted' : 
                          evaluation.shortlistStatus === 'rejected' ? 'rejected' : 'under_review'
      
      if (evaluation.shortlistStatus === 'shortlisted') {
        application.shortlistedAt = new Date()
      }
      
      application.reviewedAt = new Date()
      await application.save()

      return NextResponse.json({
        applicationId: application._id,
        evaluation,
        message: 'Application evaluated successfully'
      })
    } else {
      // Evaluate all applications for a job
      const applications = await Application.find({ 
        jobId,
        'evaluation.overallScore': { $exists: false } // Only unevaluated applications
      })

      const results = []
      let shortlistedCount = 0
      let rejectedCount = 0
      let underReviewCount = 0

      for (const application of applications) {
        try {
          const job = await Job.findById(application.jobId)
          if (!job) continue

          // Enhance projects with GitHub data if enabled
          let enhancedApplication = application
          if (settings.githubIntegration.enabled) {
            const githubService = new GitHubEnhancementService(settings.githubIntegration.token)
            const enhancedProjects = await githubService.enhanceProjectsWithGitHub(application.projects || [])
            enhancedApplication = {
              ...application,
              projects: enhancedProjects
            }
          }

          // Perform evaluation
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
          application.evaluation = evaluation
          application.status = evaluation.shortlistStatus === 'shortlisted' ? 'shortlisted' : 
                              evaluation.shortlistStatus === 'rejected' ? 'rejected' : 'under_review'
          
          if (evaluation.shortlistStatus === 'shortlisted') {
            application.shortlistedAt = new Date()
            shortlistedCount++
          } else if (evaluation.shortlistStatus === 'rejected') {
            rejectedCount++
          } else {
            underReviewCount++
          }
          
          application.reviewedAt = new Date()
          await application.save()

          results.push({
            applicationId: application._id,
            candidateId: application.candidateId,
            overallScore: evaluation.overallScore,
            shortlistStatus: evaluation.shortlistStatus,
            shortlistReason: evaluation.shortlistReason
          })
        } catch (error) {
          console.error(`Error evaluating application ${application._id}:`, error)
          results.push({
            applicationId: application._id,
            error: 'Evaluation failed'
          })
        }
      }

      // Update job statistics
      const job = await Job.findById(jobId)
      if (job) {
        job.shortlistedApplications = shortlistedCount
        await job.save()
      }

      return NextResponse.json({
        jobId,
        totalEvaluated: results.length,
        shortlisted: shortlistedCount,
        rejected: rejectedCount,
        underReview: underReviewCount,
        results
      })
    }
  } catch (error) {
    console.error('Error evaluating applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/applications/evaluate?jobId=xxx - Get evaluation results for a job
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Get all applications for the job with evaluation results
    const applications = await Application.find({ 
      jobId,
      'evaluation.overallScore': { $exists: true }
    }).sort({ 'evaluation.overallScore': -1 })

    const results = applications.map(app => ({
      applicationId: app._id,
      candidateId: app.candidateId,
      overallScore: app.evaluation.overallScore,
      shortlistStatus: app.evaluation.shortlistStatus,
      shortlistReason: app.evaluation.shortlistReason,
      strengths: app.evaluation.strengths,
      areasForImprovement: app.evaluation.areasForImprovement,
      projectScores: app.evaluation.projectScores,
      skillsMatch: app.evaluation.skillsMatch,
      experienceMatch: app.evaluation.experienceMatch,
      submittedAt: app.submittedAt,
      reviewedAt: app.reviewedAt
    }))

    // Calculate statistics
    const stats = {
      total: results.length,
      shortlisted: results.filter(r => r.shortlistStatus === 'shortlisted').length,
      rejected: results.filter(r => r.shortlistStatus === 'rejected').length,
      underReview: results.filter(r => r.shortlistStatus === 'under_review').length,
      averageScore: results.length > 0 ? 
        Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length) : 0
    }

    return NextResponse.json({
      jobId,
      stats,
      applications: results
    })
  } catch (error) {
    console.error('Error fetching evaluation results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
