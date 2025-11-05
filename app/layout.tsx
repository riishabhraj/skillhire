import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import RoleBasedNav from "@/components/role-based-nav"
import Footer from "@/components/footer"
import { Target } from "lucide-react"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "ProjectHire - Project-Based Hiring Platform",
  description: "Revolutionize your hiring process with project-based evaluation. Find better candidates faster through hands-on projects that mirror real work.",
  keywords: "hiring, recruitment, project-based hiring, talent evaluation, job platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <header className="border-b border-border">
            <div className="mx-auto max-w-6xl px-4 py-3">
              {/* Mobile layout */}
              <div className="flex md:hidden items-center justify-between">
                <a href="/" className="flex items-center gap-2 font-semibold text-foreground">
                  <Target className="h-5 w-5 text-primary" />
                  <span>ProjectHire</span>
                </a>
                <RoleBasedNav />
              </div>
              
              {/* Desktop layout */}
              <div className="hidden md:grid grid-cols-3 items-center">
                {/* Left side - Logo */}
                <div className="justify-self-start">
                  <a href="/" className="flex items-center gap-2 font-semibold text-foreground">
                    <Target className="h-5 w-5 text-primary" />
                    <span>ProjectHire</span>
                  </a>
                </div>
                
                {/* Center - Navigation links */}
                <div className="justify-self-center">
                  <nav className="flex items-center gap-6">
                    <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Features
                    </a>
                    <a href="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Projects
                    </a>
                    <a href="/remote-jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Remote Jobs
                    </a>
                    <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      About
                    </a>
                  </nav>
                </div>
                
                {/* Right side - Auth buttons */}
                <div className="justify-self-end">
                  <RoleBasedNav />
                </div>
              </div>
            </div>
          </header>
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  )
}
