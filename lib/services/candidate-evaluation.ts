import { IApplication } from '@/lib/models/Application'
import { IJob } from '@/lib/models/Job'

export interface EvaluationCriteria {
  projectWeight: number // 0.0 to 1.0
  experienceWeight: number // 0.0 to 1.0
  skillsWeight: number // 0.0 to 1.0
  minimumProjectScore: number // 0 to 100
  enableAIAnalysis: boolean
}

export interface EvaluationResult {
  overallScore: number // 0 to 100
  projectScore: number // 0 to 100
  experienceScore: number // 0 to 100
  skillsScore: number // 0 to 100
  shortlistStatus: 'shortlisted' | 'under_review' | 'rejected'
  feedback: string
  detailedFeedback: {
    projectFeedback: string
    experienceFeedback: string
    skillsFeedback: string
    recommendations: string[]
  }
}

export class CandidateEvaluationService {
  /**
   * Evaluate a candidate's application against job requirements
   */
  async evaluateCandidate(
    application: IApplication,
    job: IJob,
    criteria: EvaluationCriteria
  ): Promise<EvaluationResult> {
    const projectScore = await this.evaluateProjects(application, job, criteria)
    const experienceScore = await this.evaluateExperience(application, job)
    const skillsScore = await this.evaluateSkills(application, job)

    // Calculate weighted overall score
    const overallScore = Math.round(
      projectScore * criteria.projectWeight +
      experienceScore * criteria.experienceWeight +
      skillsScore * criteria.skillsWeight
    )

    // Determine shortlist status
    const shortlistStatus = this.determineShortlistStatus(
      overallScore,
      projectScore,
      criteria
    )

    // Generate feedback
    const feedback = this.generateFeedback(
      overallScore,
      projectScore,
      experienceScore,
      skillsScore,
      shortlistStatus
    )

    const detailedFeedback = this.generateDetailedFeedback(
      application,
      job,
      projectScore,
      experienceScore,
      skillsScore
    )

    return {
      overallScore,
      projectScore,
      experienceScore,
      skillsScore,
      shortlistStatus,
      feedback,
      detailedFeedback
    }
  }

  /**
   * Evaluate candidate's projects (highest priority)
   */
  private async evaluateProjects(
    application: IApplication,
    job: IJob,
    criteria: EvaluationCriteria
  ): Promise<number> {
    const projects = application.projects || []
    
    if (projects.length === 0) {
      return 0
    }

    let totalScore = 0
    let projectCount = 0

    for (const project of projects) {
      let projectScore = 0

      // 1. Technology Stack Match (30% weight)
      const techScore = this.evaluateTechnologyMatch(project, job)
      projectScore += techScore * 0.3

      // 2. Project Complexity (25% weight)
      const complexityScore = this.evaluateProjectComplexity(project, job)
      projectScore += complexityScore * 0.25

      // 3. Project Relevance (20% weight)
      const relevanceScore = this.evaluateProjectRelevance(project, job)
      projectScore += relevanceScore * 0.2

      // 4. Project Quality Indicators (15% weight)
      const qualityScore = this.evaluateProjectQuality(project)
      projectScore += qualityScore * 0.15

      // 5. Innovation and Problem Solving (10% weight)
      const innovationScore = this.evaluateInnovation(project)
      projectScore += innovationScore * 0.1

      totalScore += projectScore
      projectCount++
    }

    return Math.round(totalScore / projectCount)
  }

  /**
   * Evaluate technology stack match
   */
  private evaluateTechnologyMatch(project: any, job: IJob): number {
    const projectTechs = project.technologies || []
    const requiredTechs = job.projectEvaluationCriteria?.requiredTechnologies || []
    const preferredTechs = job.preferredSkills || []

    if (requiredTechs.length === 0) {
      return 80 // Default score if no specific tech requirements
    }

    let score = 0
    let matchedRequired = 0
    let matchedPreferred = 0

    // Check required technologies
    for (const requiredTech of requiredTechs) {
      const isMatched = projectTechs.some((tech: string) =>
        this.technologiesMatch(tech, requiredTech)
      )
      if (isMatched) {
        matchedRequired++
        score += 100 / requiredTechs.length
      }
    }

    // Bonus for preferred technologies
    for (const preferredTech of preferredTechs) {
      const isMatched = projectTechs.some((tech: string) =>
        this.technologiesMatch(tech, preferredTech)
      )
      if (isMatched) {
        matchedPreferred++
        score += 10 // Small bonus for preferred techs
      }
    }

    return Math.min(100, score)
  }

  /**
   * Evaluate project complexity
   */
  private evaluateProjectComplexity(project: any, job: IJob): number {
    const projectComplexity = project.complexity || 'medium'
    const requiredComplexity = job.projectEvaluationCriteria?.minimumProjectComplexity || 'medium'
    
    const complexityLevels = {
      'simple': 1,
      'medium': 2,
      'complex': 3,
      'enterprise': 4
    }

    const projectLevel = complexityLevels[projectComplexity as keyof typeof complexityLevels] || 2
    const requiredLevel = complexityLevels[requiredComplexity as keyof typeof complexityLevels] || 2

    if (projectLevel >= requiredLevel) {
      return 100
    } else if (projectLevel === requiredLevel - 1) {
      return 70
    } else {
      return 40
    }
  }

  /**
   * Evaluate project relevance to job
   */
  private evaluateProjectRelevance(project: any, job: IJob): number {
    const requiredTypes = job.projectEvaluationCriteria?.requiredProjectTypes || []
    const projectTitle = (project.title || '').toLowerCase()
    const projectDescription = (project.description || '').toLowerCase()
    const jobTitle = job.title.toLowerCase()
    const jobDescription = job.description.toLowerCase()

    let relevanceScore = 50 // Base score

    // Check if project type matches required types
    if (requiredTypes.length > 0) {
      const hasMatchingType = requiredTypes.some(type =>
        projectTitle.includes(type.toLowerCase()) ||
        projectDescription.includes(type.toLowerCase())
      )
      if (hasMatchingType) {
        relevanceScore += 30
      }
    }

    // Check for keyword matches
    const jobKeywords = this.extractKeywords(jobTitle + ' ' + jobDescription)
    const projectKeywords = this.extractKeywords(projectTitle + ' ' + projectDescription)
    
    const matchingKeywords = jobKeywords.filter(keyword =>
      projectKeywords.includes(keyword)
    )

    relevanceScore += Math.min(20, matchingKeywords.length * 5)

    return Math.min(100, relevanceScore)
  }

  /**
   * Evaluate project quality indicators
   */
  private evaluateProjectQuality(project: any): number {
    let score = 0

    // GitHub URL (20 points)
    if (project.githubUrl && project.githubUrl.includes('github.com')) {
      score += 20
    }

    // Live URL (20 points)
    if (project.liveUrl && project.liveUrl.startsWith('http')) {
      score += 20
    }

    // Detailed description (20 points)
    if (project.description && project.description.length > 100) {
      score += 20
    }

    // Challenges mentioned (20 points)
    if (project.challenges && project.challenges.length > 0) {
      score += 20
    }

    // Achievements mentioned (20 points)
    if (project.achievements && project.achievements.length > 0) {
      score += 20
    }

    return Math.min(100, score)
  }

  /**
   * Evaluate innovation and problem solving
   */
  private evaluateInnovation(project: any): number {
    let score = 50 // Base score

    // Check for innovative features
    const features = project.features || []
    const innovativeKeywords = ['ai', 'machine learning', 'blockchain', 'real-time', 'scalable', 'optimization', 'automation']
    
    const hasInnovativeFeatures = features.some((feature: string) =>
      innovativeKeywords.some(keyword => feature.toLowerCase().includes(keyword))
    )

    if (hasInnovativeFeatures) {
      score += 30
    }

    // Check for complex challenges
    const challenges = project.challenges || []
    if (challenges.length > 2) {
      score += 20
    }

    return Math.min(100, score)
  }

  /**
   * Evaluate candidate's experience
   */
  private async evaluateExperience(application: IApplication, job: IJob): Promise<number> {
    const experience = application.experience || {}
    const jobExperience = job.experience || { min: 0, max: 10, level: 'mid' }

    let score = 0

    // Years of experience match
    const candidateYears = experience.totalYears || 0
    const requiredMin = jobExperience.min || 0
    const requiredMax = jobExperience.max || 10

    if (candidateYears >= requiredMin && candidateYears <= requiredMax) {
      score += 60
    } else if (candidateYears > requiredMax) {
      score += 50 // Overqualified but still good
    } else if (candidateYears >= requiredMin * 0.7) {
      score += 40 // Close to minimum
    } else {
      score += 20 // Below minimum
    }

    // Experience level match
    const candidateLevel = this.determineExperienceLevel(candidateYears, experience.previousRoles || [])
    const requiredLevel = jobExperience.level || 'mid'

    if (candidateLevel === requiredLevel) {
      score += 40
    } else if (this.isLevelHigher(candidateLevel, requiredLevel)) {
      score += 30 // Higher level is acceptable
    } else {
      score += 20 // Lower level
    }

    return Math.min(100, score)
  }

  /**
   * Evaluate candidate's skills
   */
  private async evaluateSkills(application: IApplication, job: IJob): Promise<number> {
    const candidateSkills = application.skills?.technical || []
    const requiredSkills = job.requiredSkills || []
    const preferredSkills = job.preferredSkills || []

    if (requiredSkills.length === 0) {
      return 80 // Default score if no specific skill requirements
    }

    let score = 0
    let matchedRequired = 0
    let matchedPreferred = 0

    // Check required skills
    for (const requiredSkill of requiredSkills) {
      const isMatched = candidateSkills.some((skill: any) =>
        this.skillsMatch(skill.name || skill, requiredSkill)
      )
      if (isMatched) {
        matchedRequired++
        score += 100 / requiredSkills.length
      }
    }

    // Bonus for preferred skills
    for (const preferredSkill of preferredSkills) {
      const isMatched = candidateSkills.some((skill: any) =>
        this.skillsMatch(skill.name || skill, preferredSkill)
      )
      if (isMatched) {
        matchedPreferred++
        score += 10 // Small bonus for preferred skills
      }
    }

    return Math.min(100, score)
  }

  /**
   * Determine shortlist status based on scores
   */
  private determineShortlistStatus(
    overallScore: number,
    projectScore: number,
    criteria: EvaluationCriteria
  ): 'shortlisted' | 'under_review' | 'rejected' {
    if (projectScore < criteria.minimumProjectScore) {
      return 'rejected'
    }

    if (overallScore >= 80) {
      return 'shortlisted'
    } else if (overallScore >= 60) {
      return 'under_review'
    } else {
      return 'rejected'
    }
  }

  /**
   * Generate overall feedback
   */
  private generateFeedback(
    overallScore: number,
    projectScore: number,
    experienceScore: number,
    skillsScore: number,
    status: string
  ): string {
    const feedback = []

    if (status === 'shortlisted') {
      feedback.push('Excellent candidate with strong project portfolio and relevant experience.')
    } else if (status === 'under_review') {
      feedback.push('Good candidate with potential. Requires further review.')
    } else {
      feedback.push('Candidate does not meet minimum requirements.')
    }

    if (projectScore >= 80) {
      feedback.push('Outstanding project portfolio.')
    } else if (projectScore >= 60) {
      feedback.push('Good project portfolio with room for improvement.')
    } else {
      feedback.push('Project portfolio needs strengthening.')
    }

    return feedback.join(' ')
  }

  /**
   * Generate detailed feedback
   */
  private generateDetailedFeedback(
    application: IApplication,
    job: IJob,
    projectScore: number,
    experienceScore: number,
    skillsScore: number
  ): any {
    return {
      projectFeedback: this.generateProjectFeedback(application, job, projectScore),
      experienceFeedback: this.generateExperienceFeedback(application, job, experienceScore),
      skillsFeedback: this.generateSkillsFeedback(application, job, skillsScore),
      recommendations: this.generateRecommendations(application, job, projectScore, experienceScore, skillsScore)
    }
  }

  private generateProjectFeedback(application: IApplication, job: IJob, score: number): string {
    if (score >= 80) {
      return 'Excellent project portfolio with strong technical implementation and relevant technologies.'
    } else if (score >= 60) {
      return 'Good project portfolio with some relevant technologies and decent complexity.'
    } else {
      return 'Project portfolio needs improvement in technology stack, complexity, or relevance to the role.'
    }
  }

  private generateExperienceFeedback(application: IApplication, job: IJob, score: number): string {
    if (score >= 80) {
      return 'Strong experience level that matches the job requirements perfectly.'
    } else if (score >= 60) {
      return 'Good experience level with some alignment to job requirements.'
    } else {
      return 'Experience level may not fully meet the job requirements.'
    }
  }

  private generateSkillsFeedback(application: IApplication, job: IJob, score: number): string {
    if (score >= 80) {
      return 'Excellent skills match with most required technologies covered.'
    } else if (score >= 60) {
      return 'Good skills match with some required technologies covered.'
    } else {
      return 'Skills need improvement to meet job requirements.'
    }
  }

  private generateRecommendations(
    application: IApplication,
    job: IJob,
    projectScore: number,
    experienceScore: number,
    skillsScore: number
  ): string[] {
    const recommendations = []

    if (projectScore < 70) {
      recommendations.push('Add more projects that demonstrate the required technologies')
      recommendations.push('Include live demos and GitHub repositories for projects')
    }

    if (experienceScore < 70) {
      recommendations.push('Gain more experience in the relevant domain')
      recommendations.push('Highlight relevant experience in previous roles')
    }

    if (skillsScore < 70) {
      recommendations.push('Learn the required technologies mentioned in the job posting')
      recommendations.push('Add projects that showcase these skills')
    }

    return recommendations
  }

  // Helper methods
  private technologiesMatch(tech1: string, tech2: string): boolean {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '')
    return normalize(tech1) === normalize(tech2) || 
           normalize(tech1).includes(normalize(tech2)) ||
           normalize(tech2).includes(normalize(tech1))
  }

  private skillsMatch(skill1: string, skill2: string): boolean {
    return this.technologiesMatch(skill1, skill2)
  }

  private extractKeywords(text: string): string[] {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
  }

  private determineExperienceLevel(years: number, roles: any[]): string {
    if (years >= 8) return 'lead'
    if (years >= 5) return 'senior'
    if (years >= 2) return 'mid'
    return 'junior'
  }

  private isLevelHigher(level1: string, level2: string): boolean {
    const levels = { 'junior': 1, 'mid': 2, 'senior': 3, 'lead': 4 }
    return levels[level1 as keyof typeof levels] > levels[level2 as keyof typeof levels]
  }
}