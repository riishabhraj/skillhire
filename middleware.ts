import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/candidate', // Unified candidate auth page
  '/employer', // Unified employer auth page
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

  // Redirect unauthenticated users trying to access protected routes
  if (!userId) {
    // Only redirect if they're trying to access a protected route
    if (isEmployerRoute(req) || isCandidateRoute(req) || isProtectedRoute(req)) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  // For authenticated users, let the client-side RoleGuard handle role-based redirects
  // This avoids the complexity of role detection in middleware

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, but include API routes for Clerk auth
    // Also skip Clerk's internal routes
    '/((?!_next|trpc|sso-callback|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
