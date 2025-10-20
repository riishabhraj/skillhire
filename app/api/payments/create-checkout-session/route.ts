import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planType, jobId } = await request.json()

    if (!planType || !jobId) {
      return NextResponse.json(
        { error: 'Plan type and job ID are required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Get user details
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Define pricing
    const pricing = {
      basic: {
        price: 9900, // $99.00 in cents
        name: 'Basic Job Posting',
        description: 'Post your job with project-based evaluation'
      },
      premium: {
        price: 12800, // $128.00 in cents
        name: 'Premium Job Posting',
        description: 'Post your job with company logo display and priority features'
      }
    }

    const selectedPlan = pricing[planType as keyof typeof pricing]
    if (!selectedPlan) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPlan.name,
              description: selectedPlan.description,
            },
            unit_amount: selectedPlan.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/employer/dashboard?payment=success&jobId=${jobId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/employer/post-job?payment=cancelled`,
      metadata: {
        userId,
        jobId,
        planType,
      },
      customer_email: user.email,
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
