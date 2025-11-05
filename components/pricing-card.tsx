'use client'

import { PaymentButton } from '@/components/payment-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

interface PricingCardProps {
  planType: 'basic' | 'premium'
  jobId: string
}

export function PricingCard({ planType, jobId }: PricingCardProps) {
  const isPremium = planType === 'premium'
  const price = isPremium ? 128 : 99
  
  const features = isPremium ? [
    'Unlimited job postings',
    'Advanced candidate filtering',
    'Priority support',
    'Company logo display',
    'Analytics dashboard',
    'Custom branding'
  ] : [
    'Up to 5 job postings',
    'Basic candidate filtering',
    'Email support',
    'Standard features'
  ]

  return (
    <Card className={`relative ${isPremium ? 'border-primary shadow-lg' : ''}`}>
      {isPremium && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {isPremium ? 'Premium' : 'Basic'} Plan
        </CardTitle>
        <CardDescription>
          {isPremium ? 'For growing companies' : 'Perfect for startups'}
        </CardDescription>
        <div className="text-4xl font-bold text-primary">
          ${price}
          <span className="text-lg text-muted-foreground">/job</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <PaymentButton 
          planType={planType} 
          jobId={jobId}
          className="w-full"
        >
          Choose {isPremium ? 'Premium' : 'Basic'}
        </PaymentButton>
      </CardContent>
    </Card>
  )
}
