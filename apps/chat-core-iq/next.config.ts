import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Base path for all routes - makes URLs like /dcq/homepage
  basePath: "/dcq",
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
        hostname: "dcq.digitalworkplace.ai",
        pathname: "/**",
      },
    ],
  },

  // Fallback rewrites — the Doral home page links to many internal city
  // pages (About, Departments, Elected-officials, Departments/<X>, etc.)
  // that were not part of the scrape. Without this fallback those links
  // 404. Send any unmapped /dcq/* URL to the home page so demo viewers
  // never hit a dead end — the chat widget is the real demo focus and it
  // remains accessible from the home page.
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        { source: "/:path*", destination: "/Home/index.html" },
      ],
    };
  },

  // Security + Cache control headers
  async headers() {
    // Content-Security-Policy — see docs/security-audit-2026-05-16.md.
    // dCQ embeds chat widget on third-party sites (cityofdoral.com), so frame-ancestors stays 'self' only.
    // connect-src allows Anthropic + OpenAI + Supabase + ElevenLabs + n8n webhook.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://api.anthropic.com https://api.openai.com https://api.elevenlabs.io https://*.supabase.co wss://*.supabase.co https://vercel.live wss://*.pusher.com https://auzmor.app.n8n.cloud",
      "frame-src 'self' https://vercel.live",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
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
