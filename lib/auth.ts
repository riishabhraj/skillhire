import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export type UserRole = "employer" | "candidate"

export async function getCurrentUser() {
  const { userId } = auth()
  if (!userId) {
    return null
  }
  return { userId }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/sign-in")
  }
  return user
}

export async function getUserRole(): Promise<UserRole | null> {
  const { userId } = auth()
  if (!userId) {
    return null
  }

  // For now, we'll use Clerk's metadata to store the role
  // In a real app, you'd store this in a database
  // This is a simplified implementation
  try {
    // You can store role in Clerk metadata or use a database
    // For demo purposes, we'll check if user has completed onboarding
    // and default to candidate if no role is set
    return "candidate" // Default role for now
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}

export async function requireRole(requiredRole: UserRole) {
  const user = await requireAuth()
  const userRole = await getUserRole()
  
  if (userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    if (userRole === "employer") {
      redirect("/employer/dashboard")
    } else if (userRole === "candidate") {
      redirect("/candidate/dashboard")
    } else {
      // No role set, redirect to onboarding
      redirect("/onboarding")
    }
  }
  
  return { user, role: userRole }
}

export async function requireEmployer() {
  return requireRole("employer")
}

export async function requireCandidate() {
  return requireRole("candidate")
}
