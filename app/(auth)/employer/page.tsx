"use client"

import React, { useState, useEffect } from "react"
import { useSignIn, useSignUp, useClerk, useUser } from "@clerk/nextjs"
import { Building2, Users, Target, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { isCompanyEmail } from "@/lib/utils/email-validation"

export default function EmployerAuthPage() {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState<"email" | "code">("email")
  const [isLoading, setIsLoading] = useState(false)
  
  const { signOut } = useClerk()
  const { isSignedIn, user } = useUser()
  const { signIn, setActive: setActiveSignIn } = useSignIn()
  const { signUp, setActive: setActiveSignUp } = useSignUp()
  const router = useRouter()

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const emailValue = email.trim().toLowerCase()

    // Validate company email
    if (!isCompanyEmail(emailValue)) {
      setError('Personal email addresses (Gmail, Yahoo, Hotmail, etc.) are not accepted. Please use your company email address.')
      setIsLoading(false)
      return
    }

    try {
      // Try to sign in first
      if (signIn) {
        try {
          const signInResult = await signIn.create({
            identifier: emailValue,
          })

          // Send email code for sign-in
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: signInResult.supportedFirstFactors.find(
              (factor) => factor.strategy === 'email_code'
            )?.emailAddressId || signInResult.supportedFirstFactors[0]?.emailAddressId,
          })

          console.log('✅ Sign-in OTP sent')
          setStep('code')
          setIsLoading(false)
          return
        } catch (signInError: any) {
          console.log('Sign-in failed, trying sign-up:', signInError.errors?.[0]?.code)
          
          // If user doesn't exist, try sign up
          if (signInError.errors?.[0]?.code === 'form_identifier_not_found') {
            if (signUp) {
              try {
                await signUp.create({
                  emailAddress: emailValue,
                })

                // Send email code for sign-up
                await signUp.prepareEmailAddressVerification({
                  strategy: 'email_code',
                })

                console.log('✅ Sign-up OTP sent')
                setStep('code')
                setIsLoading(false)
                return
              } catch (signUpError: any) {
                console.error('Sign-up error:', signUpError)
                setError(signUpError.errors?.[0]?.message || 'Failed to send verification code')
                setIsLoading(false)
                return
              }
            }
          } else {
            setError(signInError.errors?.[0]?.message || 'An error occurred')
            setIsLoading(false)
            return
          }
        }
      }
    } catch (error: any) {
      console.error('Error:', error)
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  // Handle code verification
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Try sign-in verification first
      if (signIn && signIn.status === 'needs_first_factor') {
        try {
          const result = await signIn.attemptFirstFactor({
            strategy: 'email_code',
            code: code,
          })

          if (result.status === 'complete') {
            await setActiveSignIn({ session: result.createdSessionId })
            console.log('✅ Signed in successfully')
            // The useEffect will handle creating employer account
            return
          }
        } catch (signInError: any) {
          console.log('Sign-in verification failed, trying sign-up:', signInError)
        }
      }

      // Try sign-up verification
      if (signUp && signUp.status === 'missing_requirements') {
        try {
          const result = await signUp.attemptEmailAddressVerification({
            code: code,
          })

          if (result.status === 'complete') {
            await setActiveSignUp({ session: result.createdSessionId })
            console.log('✅ Signed up successfully')
            // The useEffect will handle creating employer account
            return
          }
        } catch (signUpError: any) {
          console.error('Sign-up verification error:', signUpError)
          setError(signUpError.errors?.[0]?.message || 'Invalid verification code')
          setIsLoading(false)
          return
        }
      }

      setError('Invalid verification code')
      setIsLoading(false)
    } catch (error: any) {
      console.error('Verification error:', error)
      setError(error.errors?.[0]?.message || 'Invalid verification code')
      setIsLoading(false)
    }
  }

  // After Clerk authentication, validate email and create employer account
  useEffect(() => {
    const createEmployerAccount = async () => {
      if (isSignedIn && user && email) {
        const userEmail = user.emailAddresses[0]?.emailAddress || email
        console.log('🔵 Clerk authenticated, validating email:', userEmail)
        console.log('🔵 User ID:', user.id)

        try {
          const response = await fetch('/api/auth/create-employer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail })
          })

          const data = await response.json()
          console.log('🔵 Create employer response:', data)

          if (response.ok && data.role === 'employer') {
            console.log('✅ Employer account created, checking onboarding status')
            if (data.onboardingCompleted) {
              console.log('✅ Onboarding completed, redirecting to dashboard')
              router.push('/employer/dashboard')
            } else {
              console.log('🔄 Onboarding needed, redirecting to onboarding')
              router.push('/onboarding/employer')
            }
          } else if (data.role === 'candidate') {
            console.log('❌ Email is registered as candidate, signing out')
            await signOut()
            setError('This email is already registered as a candidate account. Please use a different company email for employer access.')
            setStep('email')
            setCode('')
          } else {
            console.error('❌ Unexpected response:', data)
            await signOut()
            setError(data.error || 'Unable to create employer account')
            setStep('email')
            setCode('')
          }
        } catch (error) {
          console.error('❌ Error creating employer account:', error)
          await signOut()
          setError('An error occurred. Please try again.')
          setStep('email')
          setCode('')
        }
      }
    }

    createEmployerAccount()
  }, [isSignedIn, user, email, router, signOut])

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left side - Benefits and Pricing */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Welcome to SkillHire
            </h1>
            <p className="text-lg text-muted-foreground">
              Hire the best talent through project-based evaluation and find candidates that truly match your needs.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Project-Based Evaluation</h3>
                <p className="text-sm text-muted-foreground">
                  See candidates' actual skills in action, not just resumes. Create custom projects that mirror your real work.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Quality Candidates</h3>
                <p className="text-sm text-muted-foreground">
                  Attract motivated candidates who are serious about your role. Reduce time-to-hire by 70%.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Enterprise Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Scale your hiring process with team collaboration, analytics, and integration tools.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-foreground text-center">Choose Your Plan</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Basic Plan */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center">
                  <h5 className="text-lg font-semibold text-foreground mb-2">Basic</h5>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">$99</span>
                    <span className="text-muted-foreground">/job</span>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      Job posting & management
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      Project-based evaluation
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      Candidate analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      Email support
                    </li>
                  </ul>
                  <div className="text-xs text-muted-foreground">
                    Perfect for single job postings
                  </div>
                </div>
              </div>

              {/* Premium Plan */}
              <div className="rounded-xl border border-primary bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                </div>
                <div className="text-center">
                  <h5 className="text-lg font-semibold text-foreground mb-2">Premium</h5>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">$128</span>
                    <span className="text-muted-foreground">/job</span>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      Everything in Basic
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      Company logo display
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      Priority candidate matching
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      Advanced analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      Priority support
                    </li>
                  </ul>
                  <div className="text-xs text-muted-foreground">
                    Best for professional hiring
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              No monthly fees • Pay only for what you use • Cancel anytime
            </div>
          </div>
        </div>

        {/* Right side - Custom Auth Form */}
        <div className="flex items-start justify-center pt-8">
          <div className="w-full max-w-md">
            <div className="mb-6 space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-foreground">Employer Access</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {step === 'email' 
                    ? 'Enter your company email to continue'
                    : 'Enter the verification code sent to your email'
                  }
                </p>
              </div>

              {step === 'email' && (
                <Alert>
                  <Building2 className="h-4 w-4" />
                  <AlertTitle>Company Email Required</AlertTitle>
                  <AlertDescription className="space-y-2 mt-2">
                    <p className="text-sm">
                      You must use your <strong>company email address</strong>:
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-green-700 font-medium">you@yourcompany.com</span>
                    </div>
                    <div className="pt-1 border-t border-border/50">
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <XCircle className="h-3 w-3 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-red-600">Not accepted:</strong> Personal emails 
                          (Gmail, Yahoo, Hotmail, Outlook, etc.)
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              {step === 'email' ? (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@yourcompany.com"
                      required
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending code...' : 'Continue'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="code" className="block text-sm font-medium text-foreground">
                        Verification code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('email')
                          setCode('')
                          setError('')
                        }}
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        Change email
                      </button>
                    </div>
                    <Input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      required
                      disabled={isLoading}
                      maxLength={6}
                      className="w-full text-center text-lg tracking-widest"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Check your email: <strong>{email}</strong>
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                  </Button>
                  <button
                    type="button"
                    onClick={handleEmailSubmit}
                    className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
                    disabled={isLoading}
                  >
                    Didn't receive a code? Resend
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Looking for a job?{" "}
                <Link href="/candidate" className="text-primary hover:text-primary/80 font-medium">
                  Sign in as candidate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

