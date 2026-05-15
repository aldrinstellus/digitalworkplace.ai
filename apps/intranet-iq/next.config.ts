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
