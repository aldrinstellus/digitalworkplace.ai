import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Next.js dev tools icon
  devIndicators: false,

  // Force cache busting on each build - prevents stale JavaScript
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },

  // PERFORMANCE: Configure image optimization for external sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
    ],
    // Optimize image formats
    formats: ["image/avif", "image/webp"],
    // Reduce default device sizes for faster loading
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Cache control headers - prevent browser caching of HTML pages
  async headers() {
    return [
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
