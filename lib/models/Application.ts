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
    projectScores: {
      projectId: string
      technicalScore: number // 0-100
      complexityScore: number // 0-100
      innovationScore: number // 0-100
      qualityScore: number // 0-100
      relevanceScore: number // 0-100
      overallProjectScore: number // 0-100
      feedback: string
    }[]
    skillsMatch: {
      requiredSkills: {
        skill: string
        required: boolean
        candidateLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
        matchScore: number // 0-100
      }[]
      overallSkillsScore: number // 0-100
    }
    experienceMatch: {
      yearsMatch: number // 0-100
      levelMatch: number // 0-100
      relevanceMatch: number // 0-100
      overallExperienceScore: number // 0-100
    }
    overallScore: number // 0-100
    shortlistStatus: 'pending' | 'shortlisted' | 'rejected' | 'under_review'
    shortlistReason: string
    strengths: string[]
    areasForImprovement: string[]
    recommendedFor: string[] // Job types/roles this candidate is good for
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
    required: true
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
    projectScores: [{
      projectId: String,
      technicalScore: {
        type: Number,
        min: 0,
        max: 100
      },
      complexityScore: {
        type: Number,
        min: 0,
        max: 100
      },
      innovationScore: {
        type: Number,
        min: 0,
        max: 100
      },
      qualityScore: {
        type: Number,
        min: 0,
        max: 100
      },
      relevanceScore: {
        type: Number,
        min: 0,
        max: 100
      },
      overallProjectScore: {
        type: Number,
        min: 0,
        max: 100
      },
      feedback: String
    }],
    skillsMatch: {
      requiredSkills: [{
        skill: String,
        required: Boolean,
        candidateLevel: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert']
        },
        matchScore: {
          type: Number,
          min: 0,
          max: 100
        }
      }],
      overallSkillsScore: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    experienceMatch: {
      yearsMatch: {
        type: Number,
        min: 0,
        max: 100
      },
      levelMatch: {
        type: Number,
        min: 0,
        max: 100
      },
      relevanceMatch: {
        type: Number,
        min: 0,
        max: 100
      },
      overallExperienceScore: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    shortlistStatus: {
      type: String,
      enum: ['pending', 'shortlisted', 'rejected', 'under_review'],
      default: 'pending'
    },
    shortlistReason: String,
    strengths: [String],
    areasForImprovement: [String],
    recommendedFor: [String]
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
ApplicationSchema.index({ greenhouseCandidateId: 1 })
ApplicationSchema.index({ status: 1 })

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema)
