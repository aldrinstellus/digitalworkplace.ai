import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/dtq",

  // Hide the build activity/error indicator in bottom left
  devIndicators: false,

  // Force unique build ID on each deployment
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },

  // Prevent browser caching of HTML pages
  async headers() {
    return [
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
