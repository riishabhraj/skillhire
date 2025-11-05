import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export const getStripe = () => {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2025-09-30.clover',
    })
  }
  return stripeInstance
}

// For backward compatibility, create a getter
export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    return getStripe()[prop as keyof Stripe]
  }
})

export const STRIPE_CONFIG = {
  get publishableKey() {
    return process.env.STRIPE_PUBLISHABLE_KEY || ''
  },
  get secretKey() {
    return process.env.STRIPE_SECRET_KEY || ''
  },
  get webhookSecret() {
    return process.env.STRIPE_WEBHOOK_SECRET || ''
  },
  products: {
    get basic() {
      return process.env.STRIPE_BASIC_PRODUCT_ID || ''
    },
    get premium() {
      return process.env.STRIPE_PREMIUM_PRODUCT_ID || ''
    },
  },
  prices: {
    basic: 9900, // $99.00 in cents
    premium: 12800, // $128.00 in cents
  }
}
