# Lemon Squeezy Payment Integration Setup Guide

This guide will walk you through setting up Lemon Squeezy for payment processing in SkillHire.

## Why Lemon Squeezy?

✅ **Platform-Friendly**: You handle all payments centrally - employers don't need individual accounts  
✅ **Tax Compliance**: Automatically handles VAT, sales tax, and compliance  
✅ **Simpler Setup**: One merchant account for your entire platform  
✅ **Better for SaaS**: Designed specifically for digital products and services  
✅ **No Individual Onboarding**: Employers just pay - no complex business verification  

## Setup Steps

### 1. Create a Lemon Squeezy Account

1. Go to [Lemon Squeezy](https://www.lemonsqueezy.com/)
2. Sign up for an account
3. Complete your business profile
4. Add your bank account for payouts

### 2. Create Your Products

You need to create two products for your job posting plans:

#### Basic Plan ($99)
1. Go to **Products** → **New Product**
2. Name: `Basic Job Posting`
3. Description: `Post your job with project-based evaluation`
4. Price: `$99.00`
5. Type: `Single Payment`
6. Save and note the **Variant ID** (you'll need this)

#### Premium Plan ($128)
1. Go to **Products** → **New Product**
2. Name: `Premium Job Posting`
3. Description: `Post your job with company logo display and priority features`
4. Price: `$128.00`
5. Type: `Single Payment`
6. Save and note the **Variant ID** (you'll need this)

### 3. Get Your API Credentials

1. Go to **Settings** → **API**
2. Click **Create API Key**
3. Name it `SkillHire Production` (or similar)
4. Copy the API key (you'll only see this once!)
5. Note your **Store ID** from the dashboard

### 4. Set Up Webhook

1. Go to **Settings** → **Webhooks**
2. Click **Add Endpoint**
3. Enter your webhook URL:
   - Development: `http://localhost:3000/api/webhooks/lemonsqueezy`
   - Production: `https://yourdomain.com/api/webhooks/lemonsqueezy`
4. Select events to listen for:
   - ✅ `order_created`
   - ✅ `subscription_payment_success` (if using subscriptions)
5. Copy the **Signing Secret** (you'll need this)

### 5. Update Environment Variables

Add these variables to your `.env.local` file:

```env
# Lemon Squeezy Configuration
LEMONSQUEEZY_API_KEY=your_api_key_here
LEMONSQUEEZY_STORE_ID=your_store_id_here
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_signing_secret_here
LEMONSQUEEZY_BASIC_VARIANT_ID=your_basic_plan_variant_id_here
LEMONSQUEEZY_PREMIUM_VARIANT_ID=your_premium_plan_variant_id_here
NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=your_store_id_here
```

### 6. Test the Integration

#### Test Mode
1. In Lemon Squeezy dashboard, enable **Test Mode**
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any 3-digit CVC

#### Test Flow
1. Go to `/employer/post-job`
2. Fill in job details
3. Select a plan (Basic or Premium)
4. Click "Pay with Lemon Squeezy"
5. Complete payment with test card
6. Verify job status changes to "active" in database
7. Check webhook received in Lemon Squeezy dashboard

### 7. Go Live

1. Disable **Test Mode** in Lemon Squeezy dashboard
2. Update your webhook URL to production
3. Verify all environment variables are set in production
4. Test with a real payment (you can refund it later)

## Payment Flow

```
1. Employer creates job → Job saved with status "pending"
2. Employer selects plan → Redirected to Lemon Squeezy checkout
3. Employer completes payment → Lemon Squeezy processes payment
4. Webhook received → Job status updated to "active"
5. Employer dashboard updated → Job is now live
```

## Webhook Events

Your webhook handler (`/api/webhooks/lemonsqueezy`) listens for:

- **order_created**: When a payment is completed
  - Updates job `paymentStatus` to `'paid'`
  - Updates job `status` to `'active'`
  - Records `lemonSqueezyOrderId` and `paidAt` timestamp

## Pricing Strategy

### Current Pricing
- **Basic Plan**: $99/job
  - Job posting with project-based evaluation
  - Standard listing
  
- **Premium Plan**: $128/job
  - Everything in Basic
  - Company logo display
  - Priority placement (coming soon)
  - Featured listing (coming soon)

### Revenue Model
You keep 100% of what you charge minus Lemon Squeezy's fee (~5% + payment processing).

Example:
- Employer pays $99 for Basic plan
- Lemon Squeezy fee: ~$5
- You receive: ~$94
- Your platform handles everything!

## Support & Troubleshooting

### Common Issues

**1. Checkout URL not working**
- Verify your API key is correct
- Check that variant IDs are correct
- Ensure store ID matches your account

**2. Webhook not received**
- Check webhook URL is accessible (use ngrok for local testing)
- Verify signing secret is correct
- Check Lemon Squeezy dashboard for webhook delivery logs

**3. Payment successful but job not activated**
- Check webhook logs in your application
- Verify database connection
- Check that `jobId` is being passed correctly in custom data

### Testing Webhooks Locally

Use [ngrok](https://ngrok.com/) to expose your local server:

```bash
ngrok http 3000
```

Then update your Lemon Squeezy webhook URL to:
```
https://your-ngrok-url.ngrok.io/api/webhooks/lemonsqueezy
```

## Security Considerations

1. **Webhook Verification**: Always verify webhook signatures
2. **API Key Security**: Never commit your API key to version control
3. **HTTPS Only**: Use HTTPS in production for webhook endpoints
4. **Rate Limiting**: Consider adding rate limiting to your webhook endpoint

## Next Steps

After payment integration is working:

1. **Add refund handling** for cancelled jobs
2. **Implement subscription plans** for unlimited job postings
3. **Add email notifications** for payment confirmations
4. **Create invoices** using Lemon Squeezy's invoice API
5. **Add usage analytics** to track revenue and conversions

## Resources

- [Lemon Squeezy Documentation](https://docs.lemonsqueezy.com/)
- [Lemon Squeezy API Reference](https://docs.lemonsqueezy.com/api)
- [Webhook Events Reference](https://docs.lemonsqueezy.com/api/webhooks)
- [Lemon Squeezy Support](https://www.lemonsqueezy.com/help)

---

**Need Help?** Check the Lemon Squeezy dashboard for detailed webhook logs and payment history.

