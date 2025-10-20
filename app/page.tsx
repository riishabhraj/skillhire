import Link from "next/link"
import { ArrowRight, CheckCircle, Users, Zap, Target, Shield, Star, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Hire the{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                right talent
              </span>
              <br />
              with real projects
        </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Skip the resume screening. Evaluate candidates through hands-on projects that mirror real work. 
              Faster interviews, better hires, evidence-based decisions.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up/unified?role=employer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
              >
                Hire Talent
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sign-up/unified?role=candidate"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-base font-semibold text-foreground transition-all hover:bg-muted"
              >
                Find Jobs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Setup in 5 minutes
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Free forever plan
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">10,000+</div>
              <div className="text-sm text-muted-foreground">Candidates Evaluated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">500+</div>
              <div className="text-sm text-muted-foreground">Companies Trust Us</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">85%</div>
              <div className="text-sm text-muted-foreground">Faster Hiring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">4.9/5</div>
              <div className="text-sm text-muted-foreground">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why choose SkillHire?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Traditional hiring is broken. We fix it with project-based evaluation.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Project-Based Evaluation</h3>
              <p className="text-muted-foreground">
                Candidates work on real projects that mirror your actual work. See their skills in action, not just on paper.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Faster Interviews</h3>
              <p className="text-muted-foreground">
                Reduce interview time by 70%. Focus on the best candidates who've already proven their skills.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Evidence-Based Hiring</h3>
              <p className="text-muted-foreground">
                Make data-driven decisions with detailed performance analytics and skill assessments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Get started in minutes, not weeks
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                1
              </div>
              <h3 className="mb-3 text-xl font-semibold">Create Your Project</h3>
              <p className="text-muted-foreground">
                Design a project that reflects the actual work. Choose from our templates or create custom challenges.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                2
              </div>
              <h3 className="mb-3 text-xl font-semibold">Candidates Apply</h3>
              <p className="text-muted-foreground">
                Share your project link. Candidates complete the challenge and submit their work for review.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                3
              </div>
              <h3 className="mb-3 text-xl font-semibold">Review & Hire</h3>
              <p className="text-muted-foreground">
                Evaluate submissions with our built-in tools. Interview only the best candidates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Loved by hiring teams
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-4 text-muted-foreground">
                "SkillHire transformed our hiring process. We now hire 3x faster with 90% better candidate quality."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Sarah Chen</div>
                  <div className="text-sm text-muted-foreground">Head of Engineering, TechCorp</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-4 text-muted-foreground">
                "Finally, a way to see actual skills instead of just resumes. Our team productivity increased by 40%."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Mike Rodriguez</div>
                  <div className="text-sm text-muted-foreground">CTO, StartupXYZ</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-4 text-muted-foreground">
                "The project templates are amazing. We can now evaluate candidates for any role in minutes."
        </p>
        <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Emily Watson</div>
                  <div className="text-sm text-muted-foreground">HR Director, InnovateLab</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold">Free</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Perfect for getting started</p>
                <ul className="mt-6 space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Up to 3 job postings
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Basic project templates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Email support
                  </li>
                </ul>
                <Link
                  href="/sign-up/unified?role=employer"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
                >
                  Get Started
                </Link>
              </div>
            </div>
            <div className="rounded-xl border border-primary bg-card p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold">Professional</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">For growing teams</p>
                <ul className="mt-6 space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Unlimited job postings
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Custom project templates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Priority support
                  </li>
                </ul>
                <Link
                  href="/sign-up/unified?role=employer"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold">Enterprise</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">For large organizations</p>
                <ul className="mt-6 space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Everything in Professional
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    SSO integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Custom branding
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Dedicated support
                  </li>
                </ul>
                <Link
                  href="#contact"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              About SkillHire
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We're on a mission to make hiring more effective and fair.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold mb-4">Our Story</h3>
              <p className="text-muted-foreground mb-4">
                Founded in 2024, SkillHire was born from a simple observation: traditional hiring processes 
                are broken. Too many great candidates get overlooked because of resume gaps, while 
                unqualified candidates slip through with polished CVs.
              </p>
              <p className="text-muted-foreground">
                We believe that skills matter more than credentials. That's why we built a platform 
                that evaluates candidates through real projects that mirror actual work, giving 
                everyone a fair chance to showcase their abilities.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
              <p className="text-muted-foreground mb-4">
                To revolutionize hiring by focusing on what really matters: the ability to do the job. 
                We're creating a world where talent is recognized regardless of background, where 
                skills speak louder than resumes.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">10,000+ candidates evaluated</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">500+ companies trust us</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">85% faster hiring process</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to revolutionize your hiring?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Join 500+ companies already using SkillHire to find better talent faster.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up/unified?role=employer"
              className="inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 text-base font-semibold text-foreground shadow-lg transition-all hover:bg-background/90"
            >
              Start Hiring
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-up/unified?role=candidate"
              className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/20 bg-transparent px-6 py-3 text-base font-semibold text-primary-foreground transition-all hover:bg-primary-foreground/10"
            >
              Find Opportunities
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="mb-4 text-2xl font-bold text-foreground">SkillHire</div>
              <p className="mb-4 max-w-md text-muted-foreground">
                The future of hiring is project-based. Evaluate real skills, not just resumes.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-foreground">Twitter</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">LinkedIn</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">GitHub</Link>
              </div>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground">Templates</Link></li>
                <li><Link href="#" className="hover:text-foreground">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SkillHire. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
