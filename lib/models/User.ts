import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  clerkId: string
  email: string
  role: 'employer' | 'candidate'
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
  profile: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    profilePicture: String,
    bio: String,
    
    candidateProfile: {
      skills: [String],
      experience: String,
      education: String,
      portfolio: String,
      resume: String,
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
      languages: [String]
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
