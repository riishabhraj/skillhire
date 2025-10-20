import { GitHubEnhancementService } from './github-enhancement'

export interface HFEvaluationResult {
  projectScore: number
  skillsScore: number
  experienceScore: number
  overallScore: number
  feedback?: string
}

export class HFEvaluatorService {
  private endpoint: string
  private token: string | undefined
  private model: string

  constructor(model?: string, token?: string) {
    this.model = model || process.env.HF_MODEL || 'meta-llama/Meta-Llama-3-70B-Instruct'
    this.endpoint = `https://api-inference.huggingface.co/models/${this.model}`
    this.token = token || process.env.HF_TOKEN
  }

  isConfigured() {
    return !!this.token
  }

  async scoreApplication(params: {
    job: any
    candidate: any
    projects: any[]
  }): Promise<HFEvaluationResult | null> {
    if (!this.isConfigured()) return null

    const prompt = this.buildPrompt(params)

    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 400,
            temperature: 0.2,
            return_full_text: false
          }
        })
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HF API error ${res.status}: ${text}`)
      }
      const data = await res.json()
      const text: string = Array.isArray(data) ? data[0]?.generated_text ?? '' : data?.generated_text ?? ''
      const json = this.extractJson(text)
      if (!json) return null

      return {
        projectScore: this.clamp(json.projectScore),
        skillsScore: this.clamp(json.skillsScore),
        experienceScore: this.clamp(json.experienceScore),
        overallScore: this.clamp(json.overallScore),
        feedback: typeof json.feedback === 'string' ? json.feedback : undefined
      }
    } catch (err) {
      console.error('HF evaluation failed:', err)
      return null
    }
  }

  private clamp(v: any) {
    const n = Number(v)
    if (Number.isNaN(n)) return 0
    return Math.max(0, Math.min(100, Math.round(n)))
  }

  private extractJson(text: string): any | null {
    if (!text) return null
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start === -1 || end === -1 || end <= start) return null
    try {
      return JSON.parse(text.slice(start, end + 1))
    } catch {
      return null
    }
  }

  private buildPrompt({ job, candidate, projects }: { job: any; candidate: any; projects: any[] }) {
    const jobReq = `Title: ${job?.title}\nDescription: ${job?.description}\nRequired skills: ${(job?.requiredSkills || []).join(', ')}\nPreferred skills: ${(job?.preferredSkills || []).join(', ')}`
    const projLines = projects.map((p, i) => `#${i + 1} ${p.title || p.githubUrl || 'Project'}\nTech: ${(p.actualTechnologies || p.technologies || []).join(', ')}\nCommits: ${p.commitCount ?? p.totalCommits ?? 'n/a'}\nStars: ${p.stars ?? 'n/a'}\nLast Activity: ${p.lastActivity ?? 'n/a'}\nComplexity: ${p.projectComplexity ?? p.complexity ?? 'n/a'}\nSummary: ${p.description || ''}`).join('\n\n')
    const skills = `Technical: ${(candidate?.skills?.technical || []).map((s: any) => s.name || s).join(', ')}\nSoft: ${(candidate?.skills?.soft || []).map((s: any) => s.name || s).join(', ')}`
    const exp = `Total years: ${candidate?.experience?.totalYears ?? 'n/a'}\nRelevant years: ${candidate?.experience?.relevantYears ?? 'n/a'}`

    return `You are a technical recruiter. Score a candidate for the job using this strict rubric. Return ONLY valid JSON object with fields: {"projectScore":0-100, "skillsScore":0-100, "experienceScore":0-100, "overallScore":0-100, "feedback":"short note"}.

JOB REQUIREMENTS:\n${jobReq}

CANDIDATE SKILLS:\n${skills}

CANDIDATE EXPERIENCE:\n${exp}

PROJECTS:\n${projLines}

SCORING NOTES:\n- ProjectScore weighs repo activity, relevance to required tech, quality signals (stars/commits/recency).\n- SkillsScore compares required skills to candidate skills.\n- ExperienceScore considers total and relevant years vs. job level.\n- OverallScore is a balanced summary (not average) reflecting hire-worthiness for THIS job.`
  }
}


