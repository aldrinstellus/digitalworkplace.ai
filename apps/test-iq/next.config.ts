import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/dtq",

  // Hide the build activity/error indicator in bottom left
  devIndicators: false,

  // Force unique build ID on each deployment
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },

  // TypeScript errors will fail the build
  typescript: {
    ignoreBuildErrors: false,
  },

  // Security headers + Cache control
  async headers() {
    return [
      // Security headers (matching dSQ/dIQ/dCQ standard)
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
