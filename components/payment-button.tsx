'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { stripePromise } from '@/lib/stripe-client'
import { Loader2 } from 'lucide-react'

interface PaymentButtonProps {
  planType: 'basic' | 'premium'
  jobId: string
  className?: string
  children?: React.ReactNode
}

export function PaymentButton({ planType, jobId, className, children }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, jobId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed')
      }

      // Redirect to Stripe checkout
      window.location.href = data.checkoutUrl

    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handlePayment} 
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        children || `Pay $${planType === 'basic' ? '99' : '128'}`
      )}
    </Button>
  )
}