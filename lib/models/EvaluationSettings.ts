import mongoose, { Document, Schema } from 'mongoose'

export interface IEvaluationSettings extends Document {
  companyId: string
  projectWeight: number // 0-1, priority for project evaluation
  experienceWeight: number // 0-1, weight for experience
  skillsWeight: number // 0-1, weight for skills matching
  minimumProjectScore: number // 0-100, minimum project score to consider
  enableAIAnalysis: boolean
  githubIntegration: {
    enabled: boolean
    token?: string
    minimumStars: number
    minimumCommits: number
    minimumRepositoryAge: number // months
    requireActiveMaintenance: boolean
  }
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

const EvaluationSettingsSchema = new Schema<IEvaluationSettings>({
  companyId: {
    type: String,
    required: true,
    unique: true,
    ref: 'User'
  },
  projectWeight: {
    type: Number,
    default: 0.5,
    min: 0,
    max: 1
  },
  experienceWeight: {
    type: Number,
    default: 0.3,
    min: 0,
    max: 1
  },
  skillsWeight: {
    type: Number,
    default: 0.2,
    min: 0,
    max: 1
  },
  minimumProjectScore: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  enableAIAnalysis: {
    type: Boolean,
    default: true
  },
  githubIntegration: {
    enabled: {
      type: Boolean,
      default: false
    },
    token: {
      type: String,
      required: false
    },
    minimumStars: {
      type: Number,
      default: 0
    },
    minimumCommits: {
      type: Number,
      default: 0
    },
    minimumRepositoryAge: {
      type: Number,
      default: 0 // months
    },
    requireActiveMaintenance: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
})

export default mongoose.models.EvaluationSettings || mongoose.model<IEvaluationSettings>('EvaluationSettings', EvaluationSettingsSchema)
