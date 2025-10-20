import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import RoleBasedNav from "@/components/role-based-nav"
import Footer from "@/components/footer"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "SkillHire - Project-Based Hiring Platform",
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
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
              <a href="/" className="font-semibold text-foreground text-balance">
                SkillHire
              </a>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="/remote-jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Remote Jobs
                </a>
                <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
              </nav>
              <RoleBasedNav />
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
