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

    // Build query - ONLY show jobs that are active AND paid
    const query: any = { 
      status: 'active',
      paymentStatus: 'paid'  // Critical: Only show paid jobs
    }
    
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
      companyName,
      companyLogo
    } = body

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Validate payment-related fields
    const planType = body.planType
    if (!planType || (planType !== 'basic' && planType !== 'premium')) {
      return NextResponse.json(
        { error: 'Valid plan type (basic or premium) is required' },
        { status: 400 }
      )
    }

    // Check if this employer is eligible for free jobs
    const existingJobsCount = await Job.countDocuments({ 
      companyId: userId
    })
    
    const isFreeJob = existingJobsCount < 20
    const finalPlanType = isFreeJob ? 'basic' : planType // Free jobs are always basic plan

    // Create new job with appropriate payment status
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
      companyLogo: companyLogo || '',
      planType: finalPlanType,
      paymentStatus: isFreeJob ? 'paid' : 'pending',  // Free jobs are automatically paid
      status: isFreeJob ? 'active' : 'paused',  // Free jobs are immediately active
      postedAt: new Date()
    })

    const savedJob = await newJob.save()

    return NextResponse.json({ 
      job: savedJob,
      isFreeJob,
      freeJobsRemaining: Math.max(0, 20 - (existingJobsCount + 1))
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
