// Shared CORS allowlist + helper for dCQ API routes.
// Previously several routes hardcoded `Access-Control-Allow-Origin: *`,
// which let any site read responses cross-origin. Now we reflect the
// request origin only when it's in the allowlist. See
// docs/security-audit-2026-05-16.md for the rationale.

export const ALLOWED_ORIGINS = [
  'https://dcq.digitalworkplace.ai',
  'https://www.digitalworkplace.ai',
  'https://diq.digitalworkplace.ai',
  'https://dsq.digitalworkplace.ai',
  'https://digitalworkplace-ai.vercel.app',
  'https://www.cityofdoral.com',
  'https://cityofdoral.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
] as const;

export type CorsMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

/**
 * Build CORS headers for a response. If the request's Origin header matches
 * the allowlist, that origin is echoed back; otherwise the first allowed
 * origin is returned (which means non-allowlisted cross-origin callers will
 * fail the browser's same-origin check). Never returns '*'.
 */
export function buildCorsHeaders(
  request: Request,
  options?: { methods?: CorsMethod[]; allowHeaders?: string; allowCredentials?: boolean },
): Record<string, string> {
  const origin = request.headers.get('origin');
  const isAllowed = origin && ALLOWED_ORIGINS.some((allowed) => origin === allowed);
  const allowedOrigin = isAllowed && origin ? origin : ALLOWED_ORIGINS[0];
  const methods = options?.methods ?? ['GET', 'POST', 'OPTIONS'];

  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': methods.join(', '),
    'Access-Control-Allow-Headers': options?.allowHeaders ?? 'Content-Type, Authorization',
    Vary: 'Origin',
  };
  if (options?.allowCredentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  return headers;
}
