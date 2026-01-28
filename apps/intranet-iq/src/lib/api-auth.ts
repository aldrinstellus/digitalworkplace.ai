/**
 * API Authentication Helper for Intranet IQ
 * Provides authentication checks for admin API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';

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
