import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import connectDB from '@/lib/mongodb'
import Job from '@/lib/models/Job'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    await connectDB()

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const { userId, jobId, planType } = session.metadata

      // Update job with payment status
      await Job.findByIdAndUpdate(jobId, {
        paymentStatus: 'paid',
        planType,
        stripeSessionId: session.id,
        paidAt: new Date(),
      })

      console.log(`Payment successful for job ${jobId} by user ${userId}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
