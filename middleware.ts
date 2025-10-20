import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/jobs',
  '/jobs/(.*)', // Allow individual job detail pages
  '/remote-jobs',
  '/sso-callback(.*)', // Add SSO callback route for external authentication
  '/api/webhooks(.*)', // Add webhook routes for Clerk
  '/api/auth(.*)', // Add auth API routes
])

// Define routes that require authentication but no specific role
const isProtectedRoute = createRouteMatcher([
  '/dashboard',
  '/profile',
  '/settings',
  '/messages',
  '/onboarding',
  '/onboarding/employer',
  '/onboarding/candidate',
  '/jobs',
])

// Define employer-only routes
const isEmployerRoute = createRouteMatcher([
  '/employer(.*)',
])

// Define candidate-only routes
const isCandidateRoute = createRouteMatcher([
  '/candidate(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl

  // Handle API routes - they need auth but not role-based redirects
  if (pathname.startsWith('/api/')) {
    // For API routes, just ensure they're authenticated if needed
    // Most API routes will handle their own auth logic
    return NextResponse.next()
  }

  // Allow public routes - these don't need authentication or role checking
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to sign-in
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Get user role from Clerk metadata or database
  const userRole = await getUserRoleFromRequest(req, userId)
  

  // If user is trying to access onboarding but already has a role, redirect to their dashboard
  if ((pathname === '/onboarding' || pathname.startsWith('/onboarding/')) && userRole) {
    const dashboardPath = userRole === 'employer' ? '/employer/dashboard' : '/candidate/dashboard'
    return NextResponse.redirect(new URL(dashboardPath, req.url))
  }

  // If user doesn't have a role and is not on onboarding, redirect to general onboarding
  if (!userRole && !pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  // Allow access to role-specific onboarding routes for users without roles
  if (!userRole && (pathname === '/onboarding/employer' || pathname === '/onboarding/candidate')) {
    return NextResponse.next()
  }

  // Handle role-based access control for specific routes
  if (isEmployerRoute(req)) {
    if (userRole !== 'employer') {
      // Redirect to appropriate dashboard based on role
      const redirectPath = userRole === 'candidate' ? '/candidate/dashboard' : '/onboarding'
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }
  }

  if (isCandidateRoute(req)) {
    if (userRole !== 'candidate') {
      // Redirect to appropriate dashboard based on role
      const redirectPath = userRole === 'employer' ? '/employer/dashboard' : '/onboarding'
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }
  }

  // If user is on general dashboard route, redirect to their role-specific dashboard
  if (pathname === '/dashboard' && userRole) {
    const dashboardPath = userRole === 'employer' ? '/employer/dashboard' : '/candidate/dashboard'
    return NextResponse.redirect(new URL(dashboardPath, req.url))
  }

  return NextResponse.next()
})

// Helper function to get user role from database
async function getUserRoleFromRequest(req: Request, userId: string): Promise<'employer' | 'candidate' | null> {
  try {
    if (!userId) {
      return null
    }

    // Check if we're already on a role-specific route
    const pathname = new URL(req.url).pathname
    if (pathname.startsWith('/employer/')) {
      return 'employer'
    } else if (pathname.startsWith('/candidate/')) {
      return 'candidate'
    }

    // Check referrer to determine role intent
    const referrer = req.headers.get('referer')
    if (referrer) {
      const referrerUrl = new URL(referrer)
      if (referrerUrl.pathname.includes('/sign-in/employer') || referrerUrl.pathname.includes('/sign-up/employer')) {
        return 'employer'
      } else if (referrerUrl.pathname.includes('/sign-in/candidate') || referrerUrl.pathname.includes('/sign-up/candidate')) {
        return 'candidate'
      }
    }

    // For now, return null to force proper role detection on client side
    // The client-side useRoleDetection hook will handle fetching from database
    return null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, but include API routes for Clerk auth
    // Also skip Clerk's internal routes
    '/((?!_next|trpc|sso-callback|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
