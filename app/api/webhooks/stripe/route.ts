import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'
import Payment from '@/lib/models/Payment'
import Job from '@/lib/models/Job'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    )

    console.log('Received Stripe webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
    await connectDB()

    const { userId, jobId, planType } = session.metadata

    console.log('Processing checkout session completed:', {
      sessionId: session.id,
      userId,
      jobId,
      planType,
      amount: session.amount_total
    })

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { stripeSessionId: session.id },
      {
        status: 'completed',
        stripePaymentIntentId: session.payment_intent,
        stripeCustomerId: session.customer,
        paidAt: new Date(),
        transactionId: session.payment_intent
      },
      { new: true }
    )

    if (!payment) {
      console.error('Payment record not found for session:', session.id)
      return
    }

    // Update user subscription status
    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        'employerProfile.subscription': {
          type: planType,
          status: 'active',
          stripeSessionId: session.id,
          stripeCustomerId: session.customer,
          activatedAt: new Date()
        }
      }
    )

    // Update job status to active
    if (jobId) {
      await Job.findByIdAndUpdate(jobId, {
        status: 'active',
        paymentStatus: 'completed',
        activatedAt: new Date()
      })
    }

    console.log('✅ Successfully processed payment completion:', {
      paymentId: payment._id,
      userId,
      jobId,
      planType
    })

  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    await connectDB()

    console.log('Payment intent succeeded:', paymentIntent.id)

    // Update payment record if it exists
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      {
        status: 'completed',
        paidAt: new Date(),
        transactionId: paymentIntent.id
      }
    )

  } catch (error) {
    console.error('Error handling payment intent succeeded:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    await connectDB()

    console.log('Payment intent failed:', paymentIntent.id)

    // Update payment record if it exists
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      {
        status: 'failed'
      }
    )

  } catch (error) {
    console.error('Error handling payment intent failed:', error)
  }
}
