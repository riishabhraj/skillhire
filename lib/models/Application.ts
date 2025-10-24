import mongoose, { Document, Schema } from 'mongoose'

export interface IApplication extends Document {
  candidateId: string
  jobId: string
  coverLetter: string
  resume: string
  
  // Project portfolio
  projects: {
    id: string
    title: string
    description: string
    technologies: string[]
    githubUrl?: string
    liveUrl?: string
    screenshots: string[]
    role: string
    duration: string
    teamSize: number
    challenges: string[]
    achievements: string[]
    complexity: 'simple' | 'medium' | 'complex' | 'enterprise'
    scale: 'small' | 'medium' | 'large'
    features: string[] // e.g., ['authentication', 'database', 'api', 'payment']
  }[]
  
  // Skills assessment
  skills: {
    technical: {
      name: string
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
      projects: string[] // Project IDs that demonstrate this skill
      certifications?: string[]
      yearsOfExperience: number
    }[]
    soft: {
      name: string
      examples: string[]
      references?: string[]
    }[]
  }
  
  // Experience details
  experience: {
    totalYears: number
    relevantYears: number
    previousRoles: {
      title: string
      company: string
      duration: string
      responsibilities: string[]
      achievements: string[]
    }[]
  }
  
  // Evaluation results
  evaluation: {
    overallScore: number // 0-100
    projectScore: number // 0-100
    experienceScore: number // 0-100
    skillsScore: number // 0-100
    shortlistStatus: 'shortlisted' | 'under_review' | 'rejected'
    feedback: string
    detailedFeedback?: {
      projectFeedback: string
      experienceFeedback: string
      skillsFeedback: string
      recommendations: string[]
    }
  }
  
  // Greenhouse integration
  greenhouseCandidateId?: string
  greenhouseApplicationId?: string
  greenhouseStatus?: string
  
  status: 'submitted' | 'under_review' | 'shortlisted' | 'interview' | 'rejected' | 'hired'
  submittedAt: Date
  reviewedAt?: Date
  shortlistedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ApplicationSchema = new Schema<IApplication>({
  candidateId: {
    type: String,
    required: true,
    ref: 'User'
  },
  jobId: {
    type: String,
    required: true,
    ref: 'Job'
  },
  coverLetter: {
    type: String,
    required: false,
    default: ''
  },
  resume: {
    type: String,
    required: false
  },
  
  // Project portfolio
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
    features: [String]
  }],
  
  // Skills assessment
  skills: {
    technical: [{
      name: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert']
      },
      projects: [String],
      certifications: [String],
      yearsOfExperience: Number
    }],
    soft: [{
      name: String,
      examples: [String],
      references: [String]
    }]
  },
  
  // Experience details
  experience: {
    totalYears: Number,
    relevantYears: Number,
    previousRoles: [{
      title: String,
      company: String,
      duration: String,
      responsibilities: [String],
      achievements: [String]
    }]
  },
  
  // Evaluation results
  evaluation: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    projectScore: {
      type: Number,
      min: 0,
      max: 100
    },
    experienceScore: {
      type: Number,
      min: 0,
      max: 100
    },
    skillsScore: {
      type: Number,
      min: 0,
      max: 100
    },
    shortlistStatus: {
      type: String,
      enum: ['shortlisted', 'under_review', 'rejected'],
      default: 'under_review'
    },
    feedback: String,
    detailedFeedback: {
      projectFeedback: String,
      experienceFeedback: String,
      skillsFeedback: String,
      recommendations: [String]
    }
  },
  
  // Greenhouse integration
  greenhouseCandidateId: String,
  greenhouseApplicationId: String,
  greenhouseStatus: String,
  
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'shortlisted', 'interview', 'rejected', 'hired'],
    default: 'submitted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  shortlistedAt: Date
}, {
  timestamps: true
})

// Indexes for better query performance
ApplicationSchema.index({ candidateId: 1 })
ApplicationSchema.index({ jobId: 1 })
ApplicationSchema.index({ 'evaluation.overallScore': -1 })
ApplicationSchema.index({ 'evaluation.shortlistStatus': 1 })
ApplicationSchema.index({ status: 1 })

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema)
