import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experimental features
  experimental: {
    // Optimize package imports for better tree-shaking
    optimizePackageImports: ['lucide-react'],
  },
  serverExternalPackages: ['fs'],

  // Compiler options to reduce bundle size
  compiler: {
    // Remove console.log in production (keep errors)
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // Production source maps for debugging
  productionBrowserSourceMaps: false,

  // Image optimization
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },

  // Headers for static asset caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      {
        // Cache static JS/CSS for 1 year (hashed filenames)
        source: '/(.*)\\.(js|css)$',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
