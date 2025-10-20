import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import EvaluationSettings from '@/lib/models/EvaluationSettings'
import { GitHubEnhancementService } from '@/lib/services/github-enhancement'

// GET /api/settings - Get evaluation settings
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

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

    // Don't return the token for security
    const safeSettings = {
      ...settings.toObject(),
      githubIntegration: {
        ...settings.githubIntegration,
        token: settings.githubIntegration.token ? '***' : undefined
      }
    }

    return NextResponse.json(safeSettings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/settings - Update evaluation settings
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      projectWeight,
      experienceWeight,
      skillsWeight,
      minimumProjectScore,
      enableAIAnalysis,
      githubIntegration
    } = body

    await connectDB()

    // Validate weights sum to 1
    if (projectWeight + experienceWeight + skillsWeight !== 1) {
      return NextResponse.json(
        { error: 'Project, experience, and skills weights must sum to 1.0' },
        { status: 400 }
      )
    }

    // Test GitHub connection if token is provided
    if (githubIntegration?.enabled && githubIntegration?.token) {
      const githubService = new GitHubEnhancementService(githubIntegration.token)
      const isConnected = await githubService.testConnection()
      
      if (!isConnected) {
        return NextResponse.json(
          { error: 'Invalid GitHub token. Please check your credentials.' },
          { status: 400 }
        )
      }
    }

    let settings = await EvaluationSettings.findOne({ companyId: userId })
    
    if (!settings) {
      // Create new settings
      settings = new EvaluationSettings({
        companyId: userId,
        projectWeight: projectWeight || 0.5,
        experienceWeight: experienceWeight || 0.3,
        skillsWeight: skillsWeight || 0.2,
        minimumProjectScore: minimumProjectScore || 70,
        enableAIAnalysis: enableAIAnalysis !== undefined ? enableAIAnalysis : true,
        githubIntegration: githubIntegration || {
          enabled: false,
          minimumStars: 0,
          minimumCommits: 0,
          minimumRepositoryAge: 0,
          requireActiveMaintenance: false
        },
        status: 'active'
      })
    } else {
      // Update existing settings
      settings.projectWeight = projectWeight ?? settings.projectWeight
      settings.experienceWeight = experienceWeight ?? settings.experienceWeight
      settings.skillsWeight = skillsWeight ?? settings.skillsWeight
      settings.minimumProjectScore = minimumProjectScore ?? settings.minimumProjectScore
      settings.enableAIAnalysis = enableAIAnalysis !== undefined ? enableAIAnalysis : settings.enableAIAnalysis
      
      if (githubIntegration) {
        settings.githubIntegration = {
          ...settings.githubIntegration,
          ...githubIntegration
        }
      }
    }

    await settings.save()

    // Don't return the token for security
    const safeSettings = {
      ...settings.toObject(),
      githubIntegration: {
        ...settings.githubIntegration,
        token: settings.githubIntegration.token ? '***' : undefined
      }
    }

    return NextResponse.json(safeSettings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/settings/test-github - Test GitHub connection
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token is required' },
        { status: 400 }
      )
    }

    const githubService = new GitHubEnhancementService(token)
    const isConnected = await githubService.testConnection()

    if (isConnected) {
      return NextResponse.json({ 
        success: true, 
        message: 'GitHub connection successful' 
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to connect to GitHub. Please check your token.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error testing GitHub connection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
