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

    // Prepare customer name
    const firstName = user.profile?.firstName || ''
    const lastName = user.profile?.lastName || ''
    const customerName = `${firstName} ${lastName}`.trim() || user.profile?.employerProfile?.companyName || user.email.split('@')[0]

    console.log('Creating checkout for:', { email: user.email, name: customerName, variantId })

    // Create Lemon Squeezy checkout session
    const checkout = await createCheckout(LEMONSQUEEZY_STORE_ID, variantId, {
      checkoutData: {
        email: user.email,
        name: customerName,
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
      console.error('Lemon Squeezy checkout error:', JSON.stringify(checkout.error, null, 2))
      return NextResponse.json(
        { error: 'Failed to create checkout session', details: checkout.error },
        { status: 500 }
      )
    }

    console.log('✅ Checkout created successfully:', checkout.data?.data.attributes.url)
    return NextResponse.json({ checkoutUrl: checkout.data?.data.attributes.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    console.error('Error details:', error.cause || error.message)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
