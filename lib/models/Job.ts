import mongoose, { Document, Schema } from 'mongoose'

export interface IJob extends Document {
  title: string
  companyId: string
  companyName: string
  companyLogo?: string
  description: string
  requirements: string[]
  preferredSkills: string[]
  requiredSkills: string[]
  experience: {
    min: number
    max: number
    level: 'junior' | 'mid' | 'senior' | 'lead'
  }
  location: string
  remote: boolean
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship'
  salary?: {
    min: number
    max: number
    currency: string
  }
  benefits: string[]
  category: string
  tags: string[]
  
  // Greenhouse specific fields
  greenhouseJobId?: string
  greenhouseUrl?: string
  
  // Project evaluation criteria
  projectEvaluationCriteria: {
    requiredProjectTypes: string[] // e.g., ['web-app', 'mobile-app', 'api']
    minimumProjectComplexity: 'simple' | 'medium' | 'complex' | 'enterprise'
    requiredTechnologies: string[]
    preferredProjectFeatures: string[] // e.g., ['authentication', 'database', 'api']
    projectScale: 'small' | 'medium' | 'large'
  }
  
  // Application tracking
  applications: string[] // Array of application IDs
  totalApplications: number
  shortlistedApplications: number
  
  // Career site integration
  careerSiteUrl?: string // URL to company's career site
  useCareerSite: boolean // Whether to redirect to career site or use platform
  
  // Payment fields
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  planType: 'basic' | 'premium'
  stripeSessionId?: string
  stripePaymentIntentId?: string
  paidAt?: Date
  activatedAt?: Date
  
  status: 'active' | 'paused' | 'closed'
  postedAt: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const JobSchema = new Schema<IJob>({
  title: {
    type: String,
    required: true
  },
  companyId: {
    type: String,
    required: true,
    ref: 'User'
  },
  companyName: {
    type: String,
    required: true
  },
  companyLogo: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  preferredSkills: [String],
  requiredSkills: [String],
  experience: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 10
    },
    level: {
      type: String,
      enum: ['junior', 'mid', 'senior', 'lead'],
      required: true
    }
  },
  location: {
    type: String,
    required: true
  },
  remote: {
    type: Boolean,
    default: false
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    required: true
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  benefits: [String],
  category: {
    type: String,
    required: true
  },
  tags: [String],
  
  // Greenhouse fields
  greenhouseJobId: String,
  greenhouseUrl: String,
  
  // Project evaluation criteria
  projectEvaluationCriteria: {
    requiredProjectTypes: [String],
    minimumProjectComplexity: {
      type: String,
      enum: ['simple', 'medium', 'complex', 'enterprise'],
      default: 'medium'
    },
    requiredTechnologies: [String],
    preferredProjectFeatures: [String],
    projectScale: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    }
  },
  
  // Application tracking
  applications: [{
    type: Schema.Types.ObjectId,
    ref: 'Application'
  }],
  totalApplications: {
    type: Number,
    default: 0
  },
  shortlistedApplications: {
    type: Number,
    default: 0
  },
  
  // Career site integration
  careerSiteUrl: String,
  useCareerSite: {
    type: Boolean,
    default: false
  },
  
  // Payment fields
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  planType: {
    type: String,
    enum: ['basic', 'premium'],
    required: true
  },
  stripeSessionId: String,
  stripePaymentIntentId: String,
  paidAt: Date,
  activatedAt: Date,
  
  status: {
    type: String,
    enum: ['active', 'paused', 'closed'],
    default: 'active'
  },
  postedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
}, {
  timestamps: true
})

// Indexes for better query performance
JobSchema.index({ companyId: 1 })
JobSchema.index({ greenhouseJobId: 1 })
JobSchema.index({ status: 1 })
JobSchema.index({ category: 1 })
JobSchema.index({ tags: 1 })
JobSchema.index({ 'projectEvaluationCriteria.requiredTechnologies': 1 })

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema)
