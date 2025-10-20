"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Settings, Github, Target, Brain } from "lucide-react"

interface EvaluationSettings {
  _id?: string
  projectWeight: number
  experienceWeight: number
  skillsWeight: number
  minimumProjectScore: number
  enableAIAnalysis: boolean
  githubIntegration: {
    enabled: boolean
    token?: string
    minimumStars: number
    minimumCommits: number
    minimumRepositoryAge: number
    requireActiveMaintenance: boolean
  }
  status: 'active' | 'inactive'
}

export function EvaluationSettings() {
  const [settings, setSettings] = useState<EvaluationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [githubTestResult, setGithubTestResult] = useState<boolean | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings')
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      const data = await response.json()
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }

      setSuccess('Settings saved successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const testGitHubConnection = async () => {
    if (!settings?.githubIntegration?.token) {
      setError('Please enter a GitHub token first')
      return
    }

    try {
      setTesting(true)
      setError(null)

      const response = await fetch('/api/settings/test-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: settings.githubIntegration.token })
      })

      const data = await response.json()
      
      if (response.ok) {
        setGithubTestResult(true)
        setSuccess('GitHub connection successful!')
      } else {
        setGithubTestResult(false)
        setError(data.error || 'GitHub connection failed')
      }
    } catch (err) {
      setGithubTestResult(false)
      setError(err instanceof Error ? err.message : 'Failed to test GitHub connection')
    } finally {
      setTesting(false)
    }
  }

  const updateWeight = (type: 'project' | 'experience' | 'skills', value: number) => {
    if (!settings) return

    const newSettings = { ...settings }
    newSettings[`${type}Weight`] = value / 100

    // Ensure weights sum to 1.0
    const remainingWeight = 1.0 - (value / 100)
    const otherTypes = ['project', 'experience', 'skills'].filter(t => t !== type)
    const otherWeight = remainingWeight / 2

    otherTypes.forEach(otherType => {
      newSettings[`${otherType}Weight`] = otherWeight
    })

    setSettings(newSettings)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    )
  }

  if (!settings) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>Failed to load settings</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Evaluation Settings</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evaluation Weights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Evaluation Weights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  Project Evaluation: {Math.round(settings.projectWeight * 100)}%
                </Label>
                <Slider
                  value={[settings.projectWeight * 100]}
                  onValueChange={([value]) => updateWeight('project', value)}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Experience: {Math.round(settings.experienceWeight * 100)}%
                </Label>
                <Slider
                  value={[settings.experienceWeight * 100]}
                  onValueChange={([value]) => updateWeight('experience', value)}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Skills: {Math.round(settings.skillsWeight * 100)}%
                </Label>
                <Slider
                  value={[settings.skillsWeight * 100]}
                  onValueChange={([value]) => updateWeight('skills', value)}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Total:</strong> {Math.round((settings.projectWeight + settings.experienceWeight + settings.skillsWeight) * 100)}%
                {Math.round((settings.projectWeight + settings.experienceWeight + settings.skillsWeight) * 100) !== 100 && (
                  <span className="text-destructive ml-2">(Must equal 100%)</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Evaluation Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium">
                Minimum Project Score: {settings.minimumProjectScore}/100
              </Label>
              <Slider
                value={[settings.minimumProjectScore]}
                onValueChange={([value]) => setSettings(prev => prev ? { ...prev, minimumProjectScore: value } : null)}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="ai-analysis" className="text-sm font-medium">
                Enable AI Analysis
              </Label>
              <Switch
                id="ai-analysis"
                checked={settings.enableAIAnalysis}
                onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, enableAIAnalysis: checked } : null)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GitHub Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="github-enabled" className="text-sm font-medium">
                Enable GitHub Project Analysis
              </Label>
              <p className="text-xs text-muted-foreground">
                Analyze actual GitHub repositories for better evaluation
              </p>
            </div>
            <Switch
              id="github-enabled"
              checked={settings.githubIntegration.enabled}
              onCheckedChange={(checked) => setSettings(prev => prev ? {
                ...prev,
                githubIntegration: { ...prev.githubIntegration, enabled: checked }
              } : null)}
            />
          </div>

          {settings.githubIntegration.enabled && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="github-token" className="text-sm font-medium">
                  GitHub Personal Access Token
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="github-token"
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={settings.githubIntegration.token || ''}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      githubIntegration: { ...prev.githubIntegration, token: e.target.value }
                    } : null)}
                  />
                  <Button
                    onClick={testGitHubConnection}
                    disabled={testing || !settings.githubIntegration.token}
                    variant="outline"
                  >
                    {testing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : githubTestResult === true ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : githubTestResult === false ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      "Test"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Required for GitHub API access. Get your token from GitHub Settings → Developer settings → Personal access tokens
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">
                    Minimum Stars: {settings.githubIntegration.minimumStars}
                  </Label>
                  <Slider
                    value={[settings.githubIntegration.minimumStars]}
                    onValueChange={([value]) => setSettings(prev => prev ? {
                      ...prev,
                      githubIntegration: { ...prev.githubIntegration, minimumStars: value }
                    } : null)}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Minimum Commits: {settings.githubIntegration.minimumCommits}
                  </Label>
                  <Slider
                    value={[settings.githubIntegration.minimumCommits]}
                    onValueChange={([value]) => setSettings(prev => prev ? {
                      ...prev,
                      githubIntegration: { ...prev.githubIntegration, minimumCommits: value }
                    } : null)}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Minimum Repository Age: {settings.githubIntegration.minimumRepositoryAge} months
                  </Label>
                  <Slider
                    value={[settings.githubIntegration.minimumRepositoryAge]}
                    onValueChange={([value]) => setSettings(prev => prev ? {
                      ...prev,
                      githubIntegration: { ...prev.githubIntegration, minimumRepositoryAge: value }
                    } : null)}
                    max={24}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="active-maintenance" className="text-sm font-medium">
                    Require Active Maintenance
                  </Label>
                  <Switch
                    id="active-maintenance"
                    checked={settings.githubIntegration.requireActiveMaintenance}
                    onCheckedChange={(checked) => setSettings(prev => prev ? {
                      ...prev,
                      githubIntegration: { ...prev.githubIntegration, requireActiveMaintenance: checked }
                    } : null)}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  )
}
