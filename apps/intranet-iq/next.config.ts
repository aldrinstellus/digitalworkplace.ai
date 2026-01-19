import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Base path for all routes - makes URLs like /diq/dashboard
  basePath: "/diq",
  // Disable Next.js dev tools icon
  devIndicators: false,
  // Allow images from external sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
