import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { LEMONSQUEEZY_WEBHOOK_SECRET } from '@/lib/lemonsqueezy'
import connectDB from '@/lib/mongodb'
import Job from '@/lib/models/Job'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
    }

    // Verify webhook signature
    const hmac = crypto.createHmac('sha256', LEMONSQUEEZY_WEBHOOK_SECRET)
    const digest = hmac.update(body).digest('hex')

    if (signature !== digest) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)

    // Handle order_created event
    if (event.meta.event_name === 'order_created') {
      const order = event.data
      const customData = order.attributes.first_order_item?.product_id ? 
        JSON.parse(order.attributes.custom_data || '{}') : 
        {}

      const { jobId, userId, planType } = customData

      if (!jobId || !userId || !planType) {
        console.error('Missing metadata in Lemon Squeezy order:', customData)
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      await connectDB()

      try {
        await Job.findByIdAndUpdate(jobId, {
          paymentStatus: 'paid',
          planType,
          lemonSqueezyOrderId: order.id,
          paidAt: new Date(),
          status: 'active'
        })

        console.log(`Job ${jobId} payment confirmed and status updated to 'paid'.`)
      } catch (dbError) {
        console.error(`Error updating job ${jobId} after Lemon Squeezy webhook:`, dbError)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }
    }

    // Handle subscription_payment_success event (if using subscriptions)
    if (event.meta.event_name === 'subscription_payment_success') {
      console.log('Subscription payment successful:', event.data.id)
      // Add logic here if you implement subscription-based plans
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

