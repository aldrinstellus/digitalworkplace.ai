/**
 * API Authentication Helper for Intranet IQ
 * Provides authentication checks for admin API endpoints
 *
 * Also exports `requireAuthOrDemo()` — a demo-mode-aware Clerk gate for
 * dIQ POC API routes that are currently public for the live demo but should
 * require auth in federal production. Flip NEXT_PUBLIC_DEMO_MODE=false to enforce.
 * See docs/security-audit-2026-05-16.md (deferred Medium #3).
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Allowed origins for admin API requests
const ALLOWED_ORIGINS = [
  'https://intranet-iq.vercel.app',
  'https://www.digitalworkplace.ai',
  'https://digitalworkplace-ai.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

// Check if origin is allowed
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
}

// Check if referer is from admin pages
function isAdminReferer(referer: string | null): boolean {
  if (!referer) return false;
  try {
    const url = new URL(referer);
    return url.pathname.includes('/admin') || url.pathname.includes('/diq/admin');
  } catch {
    return false;
  }
}

/**
 * Validate admin API request
 * Returns null if authorized, or an error response if not
 */
export function validateAdminRequest(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const apiKey = request.headers.get('x-api-key');

  // Check for internal API key (for server-to-server calls)
  const internalApiKey = process.env.INTERNAL_API_KEY;
  if (internalApiKey && apiKey === internalApiKey) {
    return null; // Authorized
  }

  // Check origin/referer for browser requests from allowed domains
  if (isAllowedOrigin(origin) || isAllowedOrigin(referer)) {
    // For admin endpoints, additionally check if request is from admin pages
    if (isAdminReferer(referer)) {
      return null; // Authorized - from admin page
    }
    // Allow if from allowed origin with valid referer (could be dashboard)
    if (referer && (referer.includes('/diq/') || referer.includes('/dashboard'))) {
      return null;
    }
  }

  // Unauthorized
  return NextResponse.json(
    { error: 'Unauthorized: Admin access required' },
    { status: 401 }
  );
}

/**
 * Demo-mode-aware Clerk auth gate for dIQ POC API routes.
 *
 * - When NEXT_PUBLIC_DEMO_MODE is "true" (current state), unauthenticated
 *   requests are allowed so the public demo at diq.digitalworkplace.ai keeps working.
 * - When set to any other value (production), requires a valid Clerk session
 *   and returns 401 otherwise.
 *
 * dIQ has no Clerk middleware, so `auth()` throws on unauth requests — wrap with
 * try/catch and treat either branch (null userId OR throw) as not authenticated.
 *
 * Usage:
 *   export async function GET() {
 *     const denied = await requireAuthOrDemo();
 *     if (denied) return denied;
 *     // …handler body…
 *   }
 */
const isDemoMode = (): boolean =>
  (process.env.NEXT_PUBLIC_DEMO_MODE ?? 'true').toLowerCase() === 'true';

export async function requireAuthOrDemo(): Promise<NextResponse | null> {
  if (isDemoMode()) return null;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
