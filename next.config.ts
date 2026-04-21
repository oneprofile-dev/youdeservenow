import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization - modern formats with responsive sizes
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance optimizations
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  compress: true,

  // Experimental optimizations
  experimental: {
    optimizePackageImports: [
      "@vercel/analytics",
      "@vercel/blob",
      "@vercel/kv",
    ],
  },
};

export default nextConfig;
