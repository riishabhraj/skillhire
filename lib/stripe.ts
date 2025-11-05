import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
})

export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  products: {
    basic: process.env.STRIPE_BASIC_PRODUCT_ID || '',
    premium: process.env.STRIPE_PREMIUM_PRODUCT_ID || '',
  },
  prices: {
    basic: 9900, // $99.00 in cents
    premium: 12800, // $128.00 in cents
  }
}
