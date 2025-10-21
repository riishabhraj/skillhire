"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'

interface PaymentButtonProps {
  planType: 'basic' | 'premium'
  jobId: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function PaymentButton({ 
  planType, 
  jobId, 
  onSuccess, 
  onError 
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
          jobId,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirect to Lemon Squeezy checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Payment error:', error)
      onError?.(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  const planDetails = {
    basic: {
      price: '$99',
      name: 'Basic Plan',
      description: 'Job posting with project-based evaluation'
    },
    premium: {
      price: '$128',
      name: 'Premium Plan',
      description: 'Job posting with company logo display and priority features'
    }
  }

  const plan = planDetails[planType]

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        <p className="text-2xl font-bold text-primary">{plan.price}</p>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </div>
      
      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay with Lemon Squeezy
          </>
        )}
      </Button>
    </div>
  )
}
