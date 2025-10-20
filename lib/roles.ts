import { UserRole } from "./auth"

export const ROLE_CONFIG = {
  employer: {
    name: "Employer",
    description: "Hire talent through project-based evaluation",
    dashboardPath: "/employer/dashboard",
    allowedRoutes: [
      "/employer",
      "/employer/dashboard",
      "/employer/applicants",
      "/employer/jobs",
      "/employer/analytics",
      "/jobs", // Can view jobs
      "/messages",
      "/profile",
      "/settings",
    ],
    restrictedRoutes: [
      "/candidate",
    ],
  },
  candidate: {
    name: "Candidate",
    description: "Find opportunities through hands-on projects",
    dashboardPath: "/candidate/dashboard",
    allowedRoutes: [
      "/candidate",
      "/candidate/dashboard",
      "/candidate/applications",
      "/candidate/projects",
      "/candidate/interviews",
      "/jobs", // Can view jobs
      "/messages",
      "/profile",
      "/settings",
    ],
    restrictedRoutes: [
      "/employer",
    ],
  },
} as const

export function isRouteAllowed(role: UserRole, pathname: string): boolean {
  const config = ROLE_CONFIG[role]
  
  // Check if route is explicitly allowed
  const isAllowed = config.allowedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  )
  
  // Check if route is explicitly restricted
  const isRestricted = config.restrictedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  )
  
  return isAllowed && !isRestricted
}

export function getRoleDashboardPath(role: UserRole): string {
  return ROLE_CONFIG[role].dashboardPath
}

export function getRoleDisplayName(role: UserRole): string {
  return ROLE_CONFIG[role].name
}

export function getRoleDescription(role: UserRole): string {
  return ROLE_CONFIG[role].description
}
