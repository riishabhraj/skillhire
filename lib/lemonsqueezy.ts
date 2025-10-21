import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

// Configure Lemon Squeezy
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  onError: (error) => {
    console.error('Lemon Squeezy API Error:', error)
    throw error
  }
})

export const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!
export const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!

// Product variant IDs (you'll get these from Lemon Squeezy dashboard)
export const PRODUCT_VARIANTS = {
  basic: process.env.LEMONSQUEEZY_BASIC_VARIANT_ID || '',
  premium: process.env.LEMONSQUEEZY_PREMIUM_VARIANT_ID || ''
}

