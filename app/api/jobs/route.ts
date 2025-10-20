import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Job from '@/lib/models/Job'

// GET /api/jobs - Get all jobs (public endpoint for job discovery)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const remote = searchParams.get('remote')
    const jobType = searchParams.get('jobType')

    await connectDB()

    // Build query
    const query: any = { status: 'active' }
    
    if (category) {
      query.category = category
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }
    
    if (remote === 'true') {
      query.remote = true
    }
    
    if (jobType) {
      query.jobType = jobType
    }

    // Execute query with pagination
    const skip = (page - 1) * limit
    const jobs = await Job.find(query)
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-applications') // Don't include application details in public listing

    const total = await Job.countDocuments(query)

    console.log('API: Found jobs:', jobs.length)
    console.log('API: Job IDs:', jobs.map(job => ({ id: job._id, title: job.title })))

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/jobs - Create a new job (employer only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      requirements,
      preferredSkills,
      requiredSkills,
      experience,
      location,
      remote,
      jobType,
      salary,
      benefits,
      category,
      tags,
      projectEvaluationCriteria,
      careerSiteUrl,
      useCareerSite,
      companyId,
      companyName
    } = body

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Create new job
    const newJob = new Job({
      title,
      description,
      requirements: requirements || [],
      preferredSkills: preferredSkills || [],
      requiredSkills: requiredSkills || [],
      experience: experience || { min: 0, max: 10, level: 'mid' },
      location: location || 'Remote',
      remote: remote !== undefined ? remote : true,
      jobType: jobType || 'full-time',
      salary: salary || { min: 0, max: 0, currency: 'USD' },
      benefits: benefits || [],
      category,
      tags: tags || [],
      projectEvaluationCriteria: projectEvaluationCriteria || {
        requiredProjectTypes: [],
        minimumProjectComplexity: 'medium',
        requiredTechnologies: [],
        preferredProjectFeatures: [],
        projectScale: 'medium'
      },
      careerSiteUrl: careerSiteUrl || '',
      useCareerSite: useCareerSite || false,
      companyId: companyId || userId,
      companyName: companyName || 'Your Company',
      status: 'active',
      postedAt: new Date()
    })

    const savedJob = await newJob.save()

    return NextResponse.json({ job: savedJob }, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
