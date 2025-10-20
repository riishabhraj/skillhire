import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Payment from '@/lib/models/Payment'

// POST /api/payments/create-checkout - Create Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { jobId, planType, amount } = body

    if (!jobId || !planType || !amount) {
      return NextResponse.json(
        { error: 'Job ID, plan type, and amount are required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Create payment record
    const payment = new Payment({
      userId,
      jobId,
      planType,
      amount,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'stripe'
    })

    await payment.save()

    // In a real implementation, you would:
    // 1. Create a Stripe checkout session
    // 2. Return the checkout URL
    // 3. Handle webhooks for payment confirmation

    // For now, we'll simulate a successful payment
    const checkoutUrl = `https://checkout.stripe.com/pay/cs_test_${Date.now()}`

    return NextResponse.json({
      paymentId: payment._id,
      checkoutUrl,
      message: 'Checkout session created successfully'
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
