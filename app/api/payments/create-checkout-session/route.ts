import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
import { LEMONSQUEEZY_STORE_ID, PRODUCT_VARIANTS } from '@/lib/lemonsqueezy'
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

    // Get the variant ID for the selected plan
    const variantId = planType === 'basic' ? PRODUCT_VARIANTS.basic : PRODUCT_VARIANTS.premium

    if (!variantId) {
      return NextResponse.json(
        { error: 'Product variant not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Create Lemon Squeezy checkout session
    const checkout = await createCheckout(LEMONSQUEEZY_STORE_ID, variantId, {
      checkoutData: {
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        custom: {
          jobId,
          userId,
          planType
        }
      },
      checkoutOptions: {
        embed: false,
        media: false,
        logo: true,
        desc: true,
        discount: true,
        dark: false,
        subscriptionPreview: false,
        buttonColor: '#6366f1'
      },
      expiresAt: null,
      preview: false,
      testMode: process.env.NODE_ENV === 'development'
    })

    if (checkout.error) {
      console.error('Lemon Squeezy checkout error:', checkout.error)
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ checkoutUrl: checkout.data?.data.attributes.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
