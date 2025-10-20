import mongoose, { Schema, Document, Model } from 'mongoose'

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type PaymentMethod = 'stripe' | 'paypal' | 'bank_transfer'
export type PlanType = 'basic' | 'professional' | 'enterprise'

export interface IPayment extends Document {
  userId: string // Clerk user ID
  jobId: string // Reference to the job being paid for
  planType: PlanType
  amount: number
  currency: string
  status: PaymentStatus
  paymentMethod: PaymentMethod
  stripePaymentIntentId?: string
  stripeSessionId?: string
  transactionId?: string
  paidAt?: Date
  refundedAt?: Date
  refundAmount?: number
  metadata?: {
    jobTitle?: string
    companyName?: string
    features?: string[]
  }
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    jobId: { type: String, required: true },
    planType: { 
      type: String, 
      required: true, 
      enum: ['basic', 'professional', 'enterprise'] 
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { 
      type: String, 
      required: true, 
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentMethod: { 
      type: String, 
      required: true, 
      enum: ['stripe', 'paypal', 'bank_transfer'] 
    },
    stripePaymentIntentId: { type: String },
    stripeSessionId: { type: String },
    transactionId: { type: String },
    paidAt: { type: Date },
    refundedAt: { type: Date },
    refundAmount: { type: Number },
    metadata: {
      jobTitle: { type: String },
      companyName: { type: String },
      features: [{ type: String }]
    }
  },
  { timestamps: true }
)

// Index for efficient queries
PaymentSchema.index({ userId: 1, status: 1 })
PaymentSchema.index({ jobId: 1 })
PaymentSchema.index({ stripePaymentIntentId: 1 })
PaymentSchema.index({ stripeSessionId: 1 })

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)

export default Payment
