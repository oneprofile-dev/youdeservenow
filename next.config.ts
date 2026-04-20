import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static optimization
  staticOptimization: true,

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    // Modern image formats
    formats: ["image/avif", "image/webp"],
    // Responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance optimizations
  swcMinify: true,
  productionBrowserSourceMaps: false,

  // Enable React strict mode for development checks
  reactStrictMode: true,

  // Compress responses
  compress: true,

  // Optimize fonts
  optimizeFonts: true,

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ["@vercel/analytics", "@vercel/blob", "@vercel/kv"],
  },
};

export default nextConfig;
