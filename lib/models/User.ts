import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  clerkId: string
  email: string
  role: 'employer' | 'candidate'
  onboardingCompleted: boolean
  profile: {
    // Common fields
    firstName: string
    lastName: string
    profilePicture?: string
    bio?: string
    
    // Candidate specific fields
    candidateProfile?: {
      skills: string[]
      experience: string
      education: string
      portfolio?: string
      resume?: string
      resumeUrl?: string // S3 URL for uploaded resume
      availability: 'immediately' | '1-2 weeks' | '1 month' | 'flexible'
      preferredJobTypes: string[]
      salaryExpectation?: {
        min: number
        max: number
        currency: string
      }
      location: string
      timezone: string
      languages: string[]
      
      // Projects portfolio (automatically populated from job applications)
      projects?: Array<{
        id: string
        title: string
        description: string
        technologies: string[]
        githubUrl?: string
        liveUrl?: string
        screenshots?: string[]
        role: string
        duration: string
        teamSize: number
        challenges: string[]
        achievements: string[]
        complexity: 'simple' | 'medium' | 'complex' | 'enterprise'
        scale: 'small' | 'medium' | 'large'
        features: string[]
        addedAt: Date // When project was first added
      }>
    }
    
    // Employer specific fields
    employerProfile?: {
      companyName: string
      companySize: '1-10' | '11-50' | '51-200' | '201-500' | '500+'
      industry: string
      website?: string
      companyDescription: string
      hiringNeeds: string[]
      teamSize: string
      budget?: {
        min: number
        max: number
        currency: string
      }
      location: string
      timezone: string
      preferredWorkArrangement: 'remote' | 'hybrid' | 'onsite'
      companyLogo?: string
      subscription?: {
        type: 'basic' | 'premium'
        status: 'active' | 'inactive' | 'cancelled'
        stripeSessionId?: string
        stripeCustomerId?: string
        activatedAt?: Date
        expiresAt?: Date
      }
    }
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['employer', 'candidate'],
    required: true
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  profile: {
    firstName: {
      type: String,
      required: false,
      default: ''
    },
    lastName: {
      type: String,
      required: false,
      default: ''
    },
    profilePicture: String,
    bio: String,
    
    candidateProfile: {
      skills: [String],
      experience: String,
      education: String,
      portfolio: String,
      resume: String,
      resumeUrl: String, // S3 URL for uploaded resume
      availability: {
        type: String,
        enum: ['immediately', '1-2 weeks', '1 month', 'flexible']
      },
      preferredJobTypes: [String],
      salaryExpectation: {
        min: Number,
        max: Number,
        currency: {
          type: String,
          default: 'USD'
        }
      },
      location: String,
      timezone: String,
      languages: [String],
      
      // Projects portfolio
      projects: [{
        id: String,
        title: String,
        description: String,
        technologies: [String],
        githubUrl: String,
        liveUrl: String,
        screenshots: [String],
        role: String,
        duration: String,
        teamSize: Number,
        challenges: [String],
        achievements: [String],
        complexity: {
          type: String,
          enum: ['simple', 'medium', 'complex', 'enterprise']
        },
        scale: {
          type: String,
          enum: ['small', 'medium', 'large']
        },
        features: [String],
        addedAt: {
          type: Date,
          default: Date.now
        }
      }]
    },
    
    employerProfile: {
      companyName: String,
      companySize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '500+']
      },
      industry: String,
      website: String,
      companyDescription: String,
      hiringNeeds: [String],
      teamSize: String,
      budget: {
        min: Number,
        max: Number,
        currency: {
          type: String,
          default: 'USD'
        }
      },
      location: String,
      timezone: String,
      preferredWorkArrangement: {
        type: String,
        enum: ['remote', 'hybrid', 'onsite']
      },
      companyLogo: String,
      subscription: {
        type: {
          type: String,
          enum: ['basic', 'premium']
        },
        status: {
          type: String,
          enum: ['active', 'inactive', 'cancelled']
        },
        stripeSessionId: String,
        stripeCustomerId: String,
        activatedAt: Date,
        expiresAt: Date
      }
    }
  }
}, {
  timestamps: true
})

// Create indexes for better query performance
// Note: clerkId and email indexes are automatically created by unique: true
UserSchema.index({ role: 1 })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
