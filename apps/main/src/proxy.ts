import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication.
// Note: `/api/analytics(.*)` was previously listed here but removed — those routes
// already enforce Clerk auth + super_admin role at the handler level (see
// `src/app/api/analytics/overview/route.ts`). The public-matcher entry was
// redundant + confusing. See docs/security-audit-2026-05-16.md.
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/icon(.*)',
  '/apple-icon(.*)',
  // Analytics tracking endpoint for sendBeacon (can't set auth headers)
  '/api/tracking/session/end',
  // Allow cross-origin tracking from sub-apps
  '/api/tracking/pageview',
  '/api/tracking/navigation',
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|pdf)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
