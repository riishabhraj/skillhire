/**
 * Utility functions for managing evaluation visibility to candidates
 */

export interface ApplicationWithVisibility {
  status: string
  internalStatus?: string
  evaluationVisibleAt?: Date
  evaluation?: any
  reviewedAt?: Date
}

/**
 * Check if evaluation results should be visible to the candidate
 * @param application - The application object
 * @returns boolean indicating if evaluation is visible
 */
export function isEvaluationVisible(application: ApplicationWithVisibility): boolean {
  if (!application.evaluationVisibleAt) {
    return false
  }
  
  return new Date() >= application.evaluationVisibleAt
}

/**
 * Get the candidate-facing status of an application
 * @param application - The application object
 * @returns The status that should be shown to the candidate
 */
export function getCandidateStatus(application: ApplicationWithVisibility): string {
  if (isEvaluationVisible(application)) {
    return application.internalStatus || application.status
  }
  
  return 'under_review'
}

/**
 * Get the candidate-facing evaluation results
 * @param application - The application object
 * @returns The evaluation object that should be shown to the candidate, or null if not visible
 */
export function getCandidateEvaluation(application: ApplicationWithVisibility): any | null {
  if (isEvaluationVisible(application)) {
    return application.evaluation
  }
  
  return null
}

/**
 * Get the time remaining until evaluation becomes visible
 * @param application - The application object
 * @returns Time remaining in hours, or 0 if already visible
 */
export function getTimeUntilVisible(application: ApplicationWithVisibility): number {
  if (!application.evaluationVisibleAt) {
    return 0
  }
  
  const now = new Date()
  const visibleAt = application.evaluationVisibleAt
  
  if (now >= visibleAt) {
    return 0
  }
  
  const diffMs = visibleAt.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60)) // Convert to hours
}
