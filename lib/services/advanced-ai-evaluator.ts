/**
 * Advanced AI Evaluator with RAG (Retrieval-Augmented Generation)
 * Uses Meta-Llama-3-70B-Instruct via Hugging Face for deep candidate analysis
 */

import { IApplication } from '@/lib/models/Application'
import { IJob } from '@/lib/models/Job'
import { VectorEmbeddingService } from './vector-embeddings'
import { GitHubEnhancementService, EnhancedProject } from './github-enhancement'

export interface AdvancedEvaluationResult {
  // Semantic analysis
  semanticScore: number // 0-100 (how well projects match job)
  
  // Code quality
  technicalDepthScore: number // 0-100 (architecture, tests, docs)
  codeQualityScore: number // 0-100 (overall code quality)
  
  // Innovation
  innovationScore: number // 0-100 (novel approaches, technologies)
  
  // AI analysis
  aiRanking: 'top-tier' | 'strong' | 'good' | 'average' | 'below-average'
  aiAnalysis: string // Detailed AI feedback
  aiConfidence: number // 0-100 (how confident the AI is)
  
  // Project insights
  projectInsights: Array<{
    projectId: string
    projectTitle: string
    relevanceScore: number
    technicalScore: number
    highlights: string[]
  }>
  
  // Overall assessment
  overallRecommendation: 'strongly-recommend' | 'recommend' | 'consider' | 'not-recommended'
  strengths: string[]
  weaknesses: string[]
  keyTakeaways: string[]
}

export class AdvancedAIEvaluator {
  private vectorService: VectorEmbeddingService
  private githubService: GitHubEnhancementService
  private hfToken: string | undefined
  private model: string

  constructor(hfToken?: string, githubToken?: string) {
    this.vectorService = new VectorEmbeddingService(hfToken)
    this.githubService = new GitHubEnhancementService(githubToken)
    this.hfToken = hfToken || process.env.HF_TOKEN
    this.model = process.env.HF_MODEL || 'meta-llama/Meta-Llama-3-70B-Instruct'
  }

  isConfigured(): boolean {
    return !!this.hfToken
  }

  /**
   * Main evaluation method with RAG
   */
  async evaluateWithRAG(params: {
    job: IJob
    application: IApplication
    enhancedProjects: EnhancedProject[]
  }): Promise<AdvancedEvaluationResult | null> {
    if (!this.isConfigured()) {
      console.log('Advanced AI evaluation skipped: No HF token configured')
      return null
    }

    try {
      console.log('🚀 Starting advanced AI evaluation with RAG...')

      // STEP 1: Semantic Analysis (Vector Embeddings)
      const semanticAnalysis = await this.performSemanticAnalysis(
        params.job,
        params.enhancedProjects
      )

      // STEP 2: Technical Depth Analysis (Code Quality)
      const technicalAnalysis = this.analyzeTechnicalDepth(params.enhancedProjects)

      // STEP 3: Innovation Analysis
      const innovationScore = this.analyzeInnovation(params.enhancedProjects)

      // STEP 4: RAG-Powered AI Analysis
      const aiAnalysis = await this.performAIAnalysis(
        params.job,
        params.application,
        params.enhancedProjects,
        semanticAnalysis,
        technicalAnalysis
      )

      // STEP 5: Determine ranking and recommendation
      const ranking = this.determineRanking(
        semanticAnalysis.avgScore,
        technicalAnalysis.avgScore,
        innovationScore,
        aiAnalysis
      )

      const recommendation = this.determineRecommendation(ranking, semanticAnalysis.avgScore)

      return {
        semanticScore: Math.round(semanticAnalysis.avgScore),
        technicalDepthScore: Math.round(technicalAnalysis.avgScore),
        codeQualityScore: Math.round(technicalAnalysis.avgScore),
        innovationScore,
        aiRanking: ranking,
        aiAnalysis: aiAnalysis.analysis,
        aiConfidence: aiAnalysis.confidence,
        projectInsights: semanticAnalysis.insights,
        overallRecommendation: recommendation,
        strengths: aiAnalysis.strengths,
        weaknesses: aiAnalysis.weaknesses,
        keyTakeaways: aiAnalysis.keyTakeaways
      }
    } catch (error) {
      console.error('Advanced AI evaluation failed:', error)
      return null
    }
  }

  /**
   * Perform semantic analysis using vector embeddings
   */
  private async performSemanticAnalysis(
    job: IJob,
    projects: EnhancedProject[]
  ): Promise<{
    avgScore: number
    insights: Array<{
      projectId: string
      projectTitle: string
      relevanceScore: number
      technicalScore: number
      highlights: string[]
    }>
  }> {
    console.log('📊 Performing semantic analysis...')

    // Generate job embedding
    const jobEmbedding = await this.vectorService.generateJobEmbedding({
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills || [],
      preferredSkills: job.preferredSkills || [],
      requirements: job.requirements || [],
      category: job.category
    })

    if (!jobEmbedding) {
      console.log('Failed to generate job embedding, using fallback scores')
      return {
        avgScore: 50,
        insights: projects.map(p => ({
          projectId: p.githubUrl || p.title,
          projectTitle: p.title,
          relevanceScore: 50,
          technicalScore: p.codeQuality || 50,
          highlights: ['Semantic analysis unavailable']
        }))
      }
    }

    // Generate project embeddings and calculate similarities
    const insights = await Promise.all(
      projects.map(async (project) => {
        const projectEmbedding = await this.vectorService.generateProjectEmbedding({
          title: project.title,
          description: project.description,
          technologies: project.actualTechnologies || project.technologies,
          challenges: project.challenges,
          achievements: project.achievements,
          readmeContent: project.readmeContent,
          role: project.role,
          duration: project.duration
        })

        const relevanceScore = projectEmbedding
          ? this.vectorService.calculateSimilarity(jobEmbedding, projectEmbedding)
          : 50

        const technicalScore = this.calculateProjectTechnicalScore(project)

        const highlights = this.generateProjectHighlights(project, relevanceScore, technicalScore)

        return {
          projectId: project.githubUrl || project.title,
          projectTitle: project.title,
          relevanceScore: Math.round(relevanceScore),
          technicalScore: Math.round(technicalScore),
          highlights
        }
      })
    )

    const avgScore = insights.reduce((sum, i) => sum + i.relevanceScore, 0) / insights.length

    return { avgScore, insights }
  }

  /**
   * Analyze technical depth from code analysis
   */
  private analyzeTechnicalDepth(projects: EnhancedProject[]): {
    avgScore: number
    breakdown: {
      architecture: number
      documentation: number
      testing: number
      complexity: number
    }
  } {
    console.log('🔧 Analyzing technical depth...')

    if (projects.length === 0) {
      return {
        avgScore: 0,
        breakdown: { architecture: 0, documentation: 0, testing: 0, complexity: 0 }
      }
    }

    const scores = projects.map(project => {
      const architectureScore = project.architectureScore || 50
      const documentationScore = project.documentationScore || 50
      const testingScore = project.hasTests ? 80 : 20
      const complexityScore = this.getComplexityScore(project.projectComplexity || project.complexity)

      return {
        architecture: architectureScore,
        documentation: documentationScore,
        testing: testingScore,
        complexity: complexityScore,
        overall: (architectureScore + documentationScore + testingScore + complexityScore) / 4
      }
    })

    const avgArchitecture = scores.reduce((sum, s) => sum + s.architecture, 0) / scores.length
    const avgDocumentation = scores.reduce((sum, s) => sum + s.documentation, 0) / scores.length
    const avgTesting = scores.reduce((sum, s) => sum + s.testing, 0) / scores.length
    const avgComplexity = scores.reduce((sum, s) => sum + s.complexity, 0) / scores.length
    const avgOverall = scores.reduce((sum, s) => sum + s.overall, 0) / scores.length

    return {
      avgScore: avgOverall,
      breakdown: {
        architecture: Math.round(avgArchitecture),
        documentation: Math.round(avgDocumentation),
        testing: Math.round(avgTesting),
        complexity: Math.round(avgComplexity)
      }
    }
  }

  /**
   * Analyze innovation and novel approaches
   */
  private analyzeInnovation(projects: EnhancedProject[]): number {
    console.log('💡 Analyzing innovation...')

    let score = 50 // Base score

    const innovativeKeywords = [
      'ai', 'machine learning', 'ml', 'deep learning', 'neural',
      'blockchain', 'web3', 'smart contract', 'cryptocurrency',
      'microservices', 'kubernetes', 'docker', 'serverless',
      'real-time', 'websocket', 'graphql', 'grpc',
      'rust', 'go', 'elixir', 'typescript', 'webassembly',
      'cloud-native', 'distributed', 'scalable', 'high-performance'
    ]

    projects.forEach(project => {
      const projectText = `
        ${project.title} 
        ${project.description} 
        ${(project.actualTechnologies || project.technologies).join(' ')}
        ${project.readmeContent || ''}
      `.toLowerCase()

      // Count innovative keywords
      let keywordMatches = 0
      innovativeKeywords.forEach(keyword => {
        if (projectText.includes(keyword)) {
          keywordMatches++
        }
      })

      // Bonus for multiple innovative technologies
      if (keywordMatches >= 3) score += 15
      else if (keywordMatches >= 1) score += 8

      // Bonus for complex projects
      if (project.projectComplexity === 'complex' || project.projectComplexity === 'enterprise') {
        score += 10
      }

      // Bonus for CI/CD (shows modern practices)
      if (project.hasCICD) score += 5

      // Bonus for active maintenance
      if (project.isActive && project.hasRecentActivity) score += 5
    })

    return Math.min(100, Math.round(score))
  }

  /**
   * Perform AI analysis using Llama-3-70B with RAG
   */
  private async performAIAnalysis(
    job: IJob,
    application: IApplication,
    projects: EnhancedProject[],
    semanticAnalysis: any,
    technicalAnalysis: any
  ): Promise<{
    analysis: string
    confidence: number
    strengths: string[]
    weaknesses: string[]
    keyTakeaways: string[]
  }> {
    console.log('🤖 Performing AI analysis with Llama-3-70B...')

    const context = this.buildRAGContext(job, application, projects, semanticAnalysis, technicalAnalysis)

    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${this.model}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.hfToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: context,
            parameters: {
              max_new_tokens: 800,
              temperature: 0.3, // Low temperature for analytical, consistent responses
              top_p: 0.9,
              return_full_text: false
            }
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Llama AI API error ${response.status}: ${errorText}`)
        throw new Error(`AI analysis failed: ${response.status}`)
      }

      const data = await response.json()
      const aiText = Array.isArray(data) ? data[0]?.generated_text || '' : data?.generated_text || ''

      console.log('AI response received:', aiText.substring(0, 200) + '...')

      // Parse AI response
      const parsed = this.parseAIResponse(aiText)

      return {
        analysis: parsed.analysis || aiText,
        confidence: parsed.confidence || 75,
        strengths: parsed.strengths || ['Strong technical background'],
        weaknesses: parsed.weaknesses || ['Could provide more details'],
        keyTakeaways: parsed.keyTakeaways || ['Candidate shows promise']
      }
    } catch (error) {
      console.error('AI analysis failed:', error)
      // Return fallback analysis
      return {
        analysis: 'AI analysis unavailable. Using rule-based evaluation.',
        confidence: 50,
        strengths: ['Technical skills demonstrated'],
        weaknesses: ['Limited data for comprehensive analysis'],
        keyTakeaways: ['Requires manual review']
      }
    }
  }

  /**
   * Build RAG context for AI analysis
   */
  private buildRAGContext(
    job: IJob,
    application: IApplication,
    projects: EnhancedProject[],
    semanticAnalysis: any,
    technicalAnalysis: any
  ): string {
    return `You are an expert technical recruiter analyzing a candidate for a software engineering position. Provide a comprehensive, data-driven assessment.

# JOB REQUIREMENTS
Role: ${job.title}
Category: ${job.category}
Experience Level: ${job.experience?.level || 'mid'}
Required Skills: ${(job.requiredSkills || []).join(', ')}
Preferred Skills: ${(job.preferredSkills || []).join(', ')}
Description: ${job.description.substring(0, 300)}...

# CANDIDATE OVERVIEW
Total Experience: ${application.experience?.totalYears || 0} years
Technical Skills: ${(application.skills?.technical || []).map((s: any) => s.name || s).join(', ')}
Projects Submitted: ${projects.length}

# PROJECT ANALYSIS (${projects.length} projects)

${projects.map((proj, idx) => `
## Project ${idx + 1}: ${proj.title}
- **Relevance Score**: ${semanticAnalysis.insights[idx]?.relevanceScore || 50}/100
- **Technical Score**: ${semanticAnalysis.insights[idx]?.technicalScore || 50}/100
- **Technologies**: ${(proj.actualTechnologies || proj.technologies).join(', ')}
- **Complexity**: ${proj.projectComplexity || proj.complexity}
- **GitHub Stats**: ⭐${proj.stars || 0} stars | 🍴${proj.forks || 0} forks | 💻${proj.commitCount || 0} commits
- **Code Quality**: ${proj.codeQuality || 50}/100
- **Architecture**: ${proj.architectureScore || 50}/100 (Tests: ${proj.hasTests ? '✅' : '❌'}, CI/CD: ${proj.hasCICD ? '✅' : '❌'})
- **Documentation**: ${proj.documentationScore || 50}/100
- **Status**: ${proj.isActive ? '🟢 Active' : '🔴 Inactive'} (Last: ${proj.lastActivity ? new Date(proj.lastActivity).toLocaleDateString() : 'N/A'})
- **Description**: ${proj.description.substring(0, 150)}...
${proj.achievements && proj.achievements.length > 0 ? `- **Achievements**: ${proj.achievements.join('. ')}` : ''}
`).join('\n')}

# TECHNICAL ANALYSIS SUMMARY
- Overall Semantic Match: ${Math.round(semanticAnalysis.avgScore)}/100
- Code Quality Average: ${Math.round(technicalAnalysis.avgScore)}/100
- Architecture: ${technicalAnalysis.breakdown.architecture}/100
- Documentation: ${technicalAnalysis.breakdown.documentation}/100
- Testing Practices: ${technicalAnalysis.breakdown.testing}/100

# EVALUATION TASK
Analyze this candidate and provide your assessment in the following JSON format:
{
  "ranking": "top-tier|strong|good|average|below-average",
  "confidence": 0-100,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "keyTakeaways": ["takeaway1", "takeaway2", "takeaway3"],
  "summary": "2-3 sentence overall assessment"
}

Focus on:
1. How well do the projects align with job requirements?
2. Quality of code architecture and engineering practices
3. Innovation and problem-solving demonstrated
4. Is this candidate in the top 5% (top-tier), top 20% (strong), or average?

Return ONLY valid JSON.`
  }

  /**
   * Parse AI response (handles both JSON and text responses)
   */
  private parseAIResponse(aiText: string): any {
    // Try to extract JSON
    const jsonMatch = aiText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const json = JSON.parse(jsonMatch[0])
        return {
          analysis: json.summary || aiText,
          confidence: json.confidence || 75,
          strengths: Array.isArray(json.strengths) ? json.strengths : ['Strong technical skills'],
          weaknesses: Array.isArray(json.weaknesses) ? json.weaknesses : ['Needs more details'],
          keyTakeaways: Array.isArray(json.keyTakeaways) ? json.keyTakeaways : ['Shows potential']
        }
      } catch {
        // JSON parsing failed, fall through
      }
    }

    // Fallback: extract from text
    return {
      analysis: aiText,
      confidence: 70,
      strengths: this.extractBulletPoints(aiText, ['strength', 'excellent', 'good', 'strong']),
      weaknesses: this.extractBulletPoints(aiText, ['weakness', 'lack', 'need', 'limited']),
      keyTakeaways: [aiText.split('.')[0].trim()]
    }
  }

  /**
   * Helper: Extract bullet points from text
   */
  private extractBulletPoints(text: string, keywords: string[]): string[] {
    const sentences = text.split(/[.!?]/).filter(s => s.trim())
    const points: string[] = []

    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase()
      if (keywords.some(keyword => lowerSentence.includes(keyword))) {
        points.push(sentence.trim())
      }
    })

    return points.slice(0, 3) // Limit to 3 points
  }

  /**
   * Determine AI ranking
   */
  private determineRanking(
    semanticScore: number,
    technicalScore: number,
    innovationScore: number,
    aiAnalysis: any
  ): 'top-tier' | 'strong' | 'good' | 'average' | 'below-average' {
    // Check AI's own ranking first
    const aiText = aiAnalysis.analysis?.toLowerCase() || ''
    if (aiText.includes('top-tier') || aiText.includes('top 5%')) return 'top-tier'
    if (aiText.includes('strong') || aiText.includes('top 20%')) return 'strong'

    // Calculate composite score
    const composite = (semanticScore * 0.4) + (technicalScore * 0.4) + (innovationScore * 0.2)

    if (composite >= 85 && technicalScore >= 80) return 'top-tier'
    if (composite >= 75) return 'strong'
    if (composite >= 60) return 'good'
    if (composite >= 45) return 'average'
    return 'below-average'
  }

  /**
   * Determine recommendation
   */
  private determineRecommendation(
    ranking: string,
    semanticScore: number
  ): 'strongly-recommend' | 'recommend' | 'consider' | 'not-recommended' {
    if (ranking === 'top-tier' && semanticScore >= 80) return 'strongly-recommend'
    if (ranking === 'top-tier' || ranking === 'strong') return 'recommend'
    if (ranking === 'good') return 'consider'
    return 'not-recommended'
  }

  /**
   * Calculate project technical score
   */
  private calculateProjectTechnicalScore(project: EnhancedProject): number {
    let score = 50 // Base score

    // Code quality
    score += (project.codeQuality || 0) * 0.2

    // Architecture
    score += (project.architectureScore || 0) * 0.2

    // Documentation
    score += (project.documentationScore || 0) * 0.15

    // Testing
    if (project.hasTests) score += 15

    // CI/CD
    if (project.hasCICD) score += 10

    // Activity
    if (project.isActive && project.hasRecentActivity) score += 10

    // Complexity
    score += this.getComplexityScore(project.projectComplexity || project.complexity) * 0.2

    return Math.min(100, score)
  }

  /**
   * Get complexity score
   */
  private getComplexityScore(complexity: string): number {
    const scores: Record<string, number> = {
      'simple': 40,
      'medium': 70,
      'complex': 90,
      'enterprise': 100
    }
    return scores[complexity] || 60
  }

  /**
   * Generate project highlights
   */
  private generateProjectHighlights(
    project: EnhancedProject,
    relevanceScore: number,
    technicalScore: number
  ): string[] {
    const highlights: string[] = []

    if (relevanceScore >= 80) highlights.push('Highly relevant to job requirements')
    if (technicalScore >= 80) highlights.push('Excellent code quality and architecture')
    if (project.hasTests) highlights.push('Includes comprehensive testing')
    if (project.hasCICD) highlights.push('Has CI/CD pipeline')
    if (project.stars && project.stars > 10) highlights.push(`Popular project (${project.stars} stars)`)
    if (project.isActive && project.hasRecentActivity) highlights.push('Actively maintained')

    return highlights.length > 0 ? highlights : ['Solid project demonstration']
  }
}

