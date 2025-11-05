import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Application from '@/lib/models/Application'
import User from '@/lib/models/User'

export async function GET() {
  try {
    await connectDB()

    // Fetch all candidates with projects in their profile
    const candidatesWithProjects = await User.find({
      role: 'candidate',
      'profile.candidateProfile.projects.0': { $exists: true }
    })
      .select('clerkId profile.firstName profile.lastName profile.candidateProfile.projects')
      .lean()

    console.log(`📁 Found ${candidatesWithProjects.length} candidates with profile projects`)

    // Flatten all projects from candidate profiles
    const allProjects = candidatesWithProjects.flatMap(candidate => {
      const projects = candidate.profile?.candidateProfile?.projects || []
      const candidateName = `${candidate.profile?.firstName || ''} ${candidate.profile?.lastName || ''}`.trim() || 'Anonymous'
      
      return projects.map((project: any) => ({
        ...project,
        candidateId: candidate.clerkId,
        candidateName
      }))
    })

    // Deduplicate projects by ID (in case of any duplicates)
    const uniqueProjects = Array.from(
      new Map(allProjects.map(project => [project.id, project])).values()
    )

    // Sort projects by complexity and then by title
    const complexityOrder = { enterprise: 0, complex: 1, medium: 2, simple: 3 }
    const sortedProjects = uniqueProjects.sort((a: any, b: any) => {
      const complexityDiff = (complexityOrder[a.complexity as keyof typeof complexityOrder] || 4) - 
                             (complexityOrder[b.complexity as keyof typeof complexityOrder] || 4)
      if (complexityDiff !== 0) return complexityDiff
      return a.title.localeCompare(b.title)
    })

    console.log(`✅ Returning ${sortedProjects.length} unique projects`)

    return NextResponse.json({
      success: true,
      projects: sortedProjects,
      total: sortedProjects.length
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

