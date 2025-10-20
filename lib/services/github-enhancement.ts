import { IApplication } from '@/lib/models/Application'
import { IJob } from '@/lib/models/Job'

export interface GitHubRepositoryData {
  id: number
  name: string
  full_name: string
  description: string
  language: string
  languages_url: string
  stargazers_count: number
  forks_count: number
  size: number
  created_at: string
  updated_at: string
  pushed_at: string
  open_issues_count: number
  topics: string[]
}

export interface GitHubLanguageData {
  [language: string]: number // language -> bytes of code
}

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  stats?: {
    total: number
    additions: number
    deletions: number
  }
}

export interface GitHubContributor {
  author: {
    login: string
    id: number
  }
  total: number
  weeks: Array<{
    w: number
    a: number
    d: number
    c: number
  }>
}

export interface GitHubIssue {
  number: number
  title: string
  state: 'open' | 'closed'
  created_at: string
  closed_at?: string
  user: {
    login: string
  }
}

export interface EnhancedProject {
  title: string
  description: string
  technologies: string[]
  githubUrl?: string
  liveUrl?: string
  complexity: string
  
  // Enhanced GitHub data
  actualTechnologies?: string[]
  languageDistribution?: GitHubLanguageData
  commitCount?: number
  totalCommits?: number
  repositorySize?: number
  stars?: number
  forks?: number
  openIssues?: number
  lastActivity?: string
  repositoryAge?: number // months
  codeQuality?: number // 0-100
  projectComplexity?: string
  isActive?: boolean
  hasRecentActivity?: boolean
}

export class GitHubEnhancementService {
  private baseUrl = 'https://api.github.com'
  private token?: string

  constructor(token?: string) {
    this.token = token
  }

  /**
   * Enhance a project with GitHub data
   */
  async enhanceProjectWithGitHub(project: any): Promise<EnhancedProject> {
    if (!project.githubUrl) {
      return {
        ...project,
        isActive: false,
        hasRecentActivity: false
      }
    }

    try {
      const { owner, repo } = this.parseGitHubUrl(project.githubUrl)
      
      // Fetch all data in parallel for better performance
      const [repoData, languages, commits, stats, issues] = await Promise.all([
        this.fetchRepository(owner, repo),
        this.fetchLanguages(owner, repo),
        this.fetchCommits(owner, repo),
        this.fetchStats(owner, repo),
        this.fetchIssues(owner, repo)
      ])

      const enhancedProject: EnhancedProject = {
        ...project,
        // Enhanced with real GitHub data
        actualTechnologies: Object.keys(languages),
        languageDistribution: languages,
        commitCount: commits.length,
        totalCommits: stats.reduce((sum, contributor) => sum + contributor.total, 0),
        repositorySize: repoData.size,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        lastActivity: repoData.pushed_at,
        repositoryAge: this.calculateRepositoryAge(repoData.created_at),
        codeQuality: this.calculateCodeQuality(repoData, commits, issues),
        projectComplexity: this.calculateComplexity(repoData, languages, commits),
        isActive: this.isRepositoryActive(repoData, commits),
        hasRecentActivity: this.hasRecentActivity(commits)
      }

      return enhancedProject
    } catch (error) {
      console.error('GitHub enhancement failed:', error)
      return {
        ...project,
        isActive: false,
        hasRecentActivity: false
      }
    }
  }

  /**
   * Enhance multiple projects
   */
  async enhanceProjectsWithGitHub(projects: any[]): Promise<EnhancedProject[]> {
    const enhancedProjects = await Promise.all(
      projects.map(project => this.enhanceProjectWithGitHub(project))
    )
    return enhancedProjects
  }

  /**
   * Test GitHub API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: this.getHeaders()
      })
      return response.ok
    } catch (error) {
      console.error('GitHub API test failed:', error)
      return false
    }
  }

  private async fetchRepository(owner: string, repo: string): Promise<GitHubRepositoryData> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
      headers: this.getHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  private async fetchLanguages(owner: string, repo: string): Promise<GitHubLanguageData> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/languages`, {
      headers: this.getHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  private async fetchCommits(owner: string, repo: string): Promise<GitHubCommit[]> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/commits?per_page=100`, {
      headers: this.getHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  private async fetchStats(owner: string, repo: string): Promise<GitHubContributor[]> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/stats/contributors`, {
      headers: this.getHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  private async fetchIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues?state=all&per_page=100`, {
      headers: this.getHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SkillHire-Platform'
    }
    
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`
    }
    
    return headers
  }

  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      throw new Error('Invalid GitHub URL format')
    }
    return { owner: match[1], repo: match[2] }
  }

  private calculateCodeQuality(repoData: GitHubRepositoryData, commits: GitHubCommit[], issues: GitHubIssue[]): number {
    let score = 0
    
    // Activity score (40%)
    const recentCommits = commits.filter(c => {
      const commitDate = new Date(c.commit.author.date)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return commitDate > thirtyDaysAgo
    }).length
    score += Math.min(recentCommits * 2, 40)
    
    // Repository health (30%)
    score += Math.min(repoData.stargazers_count * 2, 15)
    score += Math.min(repoData.forks_count * 3, 15)
    
    // Issue management (30%)
    const closedIssues = issues.filter(i => i.state === 'closed').length
    const totalIssues = issues.length
    if (totalIssues > 0) {
      score += (closedIssues / totalIssues) * 30
    } else {
      score += 15 // Bonus for no issues (clean project)
    }
    
    return Math.min(Math.round(score), 100)
  }

  private calculateComplexity(repoData: GitHubRepositoryData, languages: GitHubLanguageData, commits: GitHubCommit[]): string {
    const totalSize = repoData.size
    const languageCount = Object.keys(languages).length
    const commitCount = commits.length
    const repositoryAge = this.calculateRepositoryAge(repoData.created_at)
    
    if (totalSize > 10000 || languageCount > 5 || commitCount > 100 || repositoryAge > 12) {
      return 'complex'
    } else if (totalSize > 1000 || languageCount > 2 || commitCount > 20 || repositoryAge > 3) {
      return 'medium'
    } else {
      return 'simple'
    }
  }

  private calculateRepositoryAge(createdAt: string): number {
    const created = new Date(createdAt)
    const now = new Date()
    return Math.round((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30)) // Age in months
  }

  private isRepositoryActive(repoData: GitHubRepositoryData, commits: GitHubCommit[]): boolean {
    const lastPush = new Date(repoData.pushed_at)
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
    return lastPush > sixMonthsAgo
  }

  private hasRecentActivity(commits: GitHubCommit[]): boolean {
    if (commits.length === 0) return false
    
    const lastCommit = new Date(commits[0].commit.author.date)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return lastCommit > thirtyDaysAgo
  }
}
