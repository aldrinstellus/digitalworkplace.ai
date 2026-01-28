/**
 * API Authentication Helper
 * Provides authentication checks for admin API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';

// Allowed origins for admin API requests
const ALLOWED_ORIGINS = [
  'https://dcq.digitalworkplace.ai',
  'https://www.digitalworkplace.ai',
  'https://digitalworkplace-ai.vercel.app',
  'http://localhost:3000',
  'http://localhost:3002',
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
    return url.pathname.includes('/admin') || url.pathname.includes('/dcq/admin');
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
    // Additional check: ensure it's from admin pages for sensitive operations
    if (isAdminReferer(referer)) {
      return null; // Authorized
    }
    // Allow if from allowed origin even without admin referer (for some operations)
    return null;
  }

  // Unauthorized
  return NextResponse.json(
    { error: 'Unauthorized: Admin access required' },
    { status: 401 }
  );
}

/**
 * Validate admin request with strict admin page check
 * Use this for sensitive operations like batch embedding generation
 */
export function validateStrictAdminRequest(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const apiKey = request.headers.get('x-api-key');

  // Check for internal API key
  const internalApiKey = process.env.INTERNAL_API_KEY;
  if (internalApiKey && apiKey === internalApiKey) {
    return null;
  }

  // Must be from allowed origin AND admin page
  if ((isAllowedOrigin(origin) || isAllowedOrigin(referer)) && isAdminReferer(referer)) {
    return null;
  }

  return NextResponse.json(
    { error: 'Unauthorized: Admin access required' },
    { status: 401 }
  );
}
