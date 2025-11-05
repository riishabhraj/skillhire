/**
 * Vector Embeddings Service using Hugging Face
 * Uses sentence-transformers for semantic similarity
 */

export interface ProjectEmbeddingInput {
  title: string
  description: string
  technologies: string[]
  challenges?: string[]
  achievements?: string[]
  readmeContent?: string
  role?: string
  duration?: string
}

export interface JobEmbeddingInput {
  title: string
  description: string
  requiredSkills: string[]
  preferredSkills?: string[]
  requirements?: string[]
  category?: string
}

export class VectorEmbeddingService {
  private endpoint: string
  private token: string | undefined
  private model: string

  constructor(token?: string) {
    // Use a free, high-quality embedding model from Hugging Face
    this.model = 'sentence-transformers/all-MiniLM-L6-v2' // Fast, free, 384 dimensions
    this.endpoint = `https://api-inference.huggingface.co/pipeline/feature-extraction/${this.model}`
    this.token = token || process.env.HF_TOKEN
  }

  isConfigured(): boolean {
    return !!this.token
  }

  /**
   * Generate embedding for a project
   */
  async generateProjectEmbedding(project: ProjectEmbeddingInput): Promise<number[] | null> {
    if (!this.isConfigured()) {
      console.log('Vector embeddings skipped: No HF token configured')
      return null
    }

    const projectContext = this.buildProjectContext(project)
    return await this.generateEmbedding(projectContext)
  }

  /**
   * Generate embedding for a job
   */
  async generateJobEmbedding(job: JobEmbeddingInput): Promise<number[] | null> {
    if (!this.isConfigured()) {
      console.log('Vector embeddings skipped: No HF token configured')
      return null
    }

    const jobContext = this.buildJobContext(job)
    return await this.generateEmbedding(jobContext)
  }

  /**
   * Calculate semantic similarity between two embeddings (cosine similarity)
   * Returns a score from 0-100
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
      return 0
    }

    // Cosine similarity
    const dotProduct = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0)
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0))
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0))
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0
    
    const similarity = dotProduct / (magnitude1 * magnitude2)
    // Convert from [-1, 1] to [0, 100]
    return ((similarity + 1) / 2) * 100
  }

  /**
   * Find best matching projects for a job
   */
  async findBestMatches(
    jobEmbedding: number[],
    projectEmbeddings: Array<{ embedding: number[], projectId: string, title: string }>
  ): Promise<Array<{ projectId: string, title: string, score: number }>> {
    const matches = projectEmbeddings.map(proj => ({
      projectId: proj.projectId,
      title: proj.title,
      score: this.calculateSimilarity(jobEmbedding, proj.embedding)
    }))

    // Sort by score descending
    return matches.sort((a, b) => b.score - a.score)
  }

  /**
   * Generate embedding using Hugging Face API
   */
  private async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: text,
          options: {
            wait_for_model: true
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`HF Embeddings API error ${response.status}: ${errorText}`)
        return null
      }

      const embedding = await response.json()
      
      // Handle different response formats
      if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
        return embedding[0] // Nested array format
      } else if (Array.isArray(embedding)) {
        return embedding // Direct array format
      }
      
      console.error('Unexpected embedding format:', embedding)
      return null
    } catch (error) {
      console.error('Failed to generate embedding:', error)
      return null
    }
  }

  /**
   * Build context string for project
   */
  private buildProjectContext(project: ProjectEmbeddingInput): string {
    const parts = [
      `Title: ${project.title}`,
      `Description: ${project.description}`,
      `Technologies: ${project.technologies.join(', ')}`,
    ]

    if (project.role) {
      parts.push(`Role: ${project.role}`)
    }

    if (project.duration) {
      parts.push(`Duration: ${project.duration}`)
    }

    if (project.challenges && project.challenges.length > 0) {
      parts.push(`Challenges: ${project.challenges.join('. ')}`)
    }

    if (project.achievements && project.achievements.length > 0) {
      parts.push(`Achievements: ${project.achievements.join('. ')}`)
    }

    if (project.readmeContent) {
      // Limit README to first 500 chars to avoid token limits
      parts.push(`README: ${project.readmeContent.substring(0, 500)}`)
    }

    return parts.join('\n')
  }

  /**
   * Build context string for job
   */
  private buildJobContext(job: JobEmbeddingInput): string {
    const parts = [
      `Job Title: ${job.title}`,
      `Description: ${job.description}`,
      `Required Skills: ${job.requiredSkills.join(', ')}`,
    ]

    if (job.preferredSkills && job.preferredSkills.length > 0) {
      parts.push(`Preferred Skills: ${job.preferredSkills.join(', ')}`)
    }

    if (job.requirements && job.requirements.length > 0) {
      parts.push(`Requirements: ${job.requirements.join('. ')}`)
    }

    if (job.category) {
      parts.push(`Category: ${job.category}`)
    }

    return parts.join('\n')
  }

  /**
   * Batch generate embeddings for multiple items
   */
  async batchGenerateEmbeddings(texts: string[]): Promise<(number[] | null)[]> {
    return await Promise.all(texts.map(text => this.generateEmbedding(text)))
  }
}

