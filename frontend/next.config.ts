import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Firebase hosting
  output: 'export',
  
  // Add trailing slashes for better routing
  trailingSlash: true,
  
  // Optimize images for static export
  images: {
    unoptimized: true
  },
  
  // Disable ESLint during builds for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript checking during builds (optional)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optional: Configure base path if deploying to subdirectory
  // basePath: '',
  
  // Optional: Asset prefix for CDN
  // assetPrefix: '',
};

export default nextConfig;