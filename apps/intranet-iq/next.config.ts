import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Base path for all routes - makes URLs like /diq/dashboard
  basePath: "/diq",
  // Disable Next.js dev tools icon
  devIndicators: false,

  // Force cache busting on each build - prevents stale JavaScript
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },

  // Allow images from trusted sources only
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fhtempgkltrazrgbedrh.supabase.co",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "intranet-iq.vercel.app",
        pathname: "/**",
      },
    ],
  },

  // Redirect the auto-generated *.vercel.app alias to the canonical domain.
  // Clerk production keys are domain-scoped to digitalworkplace.ai — any other
  // origin trips "Production Keys are only allowed for domain ..." and bricks auth.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'intranet-iq.vercel.app' }],
        destination: 'https://diq.digitalworkplace.ai/:path*',
        permanent: true,
        basePath: false,
      },
    ];
  },

  // Security + Cache control headers
  async headers() {
    // Content-Security-Policy — see docs/security-audit-2026-05-16.md.
    // Allows Anthropic + Supabase + Clerk + Vercel-live origins for connect-src.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://clerk.digitalworkplace.ai https://*.clerk.accounts.dev https://*.clerk.com https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://api.anthropic.com https://clerk.digitalworkplace.ai https://*.clerk.accounts.dev https://*.clerk.com https://*.supabase.co wss://*.supabase.co https://vercel.live wss://*.pusher.com",
      "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.com https://vercel.live",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      // Security headers for all routes
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      // Prevent caching of HTML pages - users always get fresh content
      {
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
