import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Payment from '@/lib/models/Payment'

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

    // Get the product ID and price for the selected plan
    const productId = planType === 'basic' ? STRIPE_CONFIG.products.basic : STRIPE_CONFIG.products.premium
    const price = planType === 'basic' ? STRIPE_CONFIG.prices.basic : STRIPE_CONFIG.prices.premium

    if (!productId) {
      return NextResponse.json(
        { error: 'Product not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Prepare customer name
    const firstName = user.profile?.firstName || ''
    const lastName = user.profile?.lastName || ''
    const customerName = `${firstName} ${lastName}`.trim() || user.profile?.employerProfile?.companyName || user.email.split('@')[0]

    console.log('Creating Stripe checkout for:', { email: user.email, name: customerName, productId, price })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product: productId,
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/employer/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/employer/post-job?payment=cancelled`,
      customer_email: user.email,
      metadata: {
        userId,
        jobId,
        planType,
        customerName
      }
    })

    // Create payment record
    const payment = new Payment({
      userId,
      jobId,
      planType,
      amount: price / 100, // Convert cents to dollars
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'stripe',
      stripeSessionId: session.id
    })

    await payment.save()

    console.log('✅ Stripe checkout created successfully:', session.url)
    return NextResponse.json({ 
      checkoutUrl: session.url,
      sessionId: session.id,
      paymentId: payment._id
    })
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
