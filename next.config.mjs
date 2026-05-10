/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true, // Enable gzip/brotli compression
  images: {
    formats: ['image/avif', 'image/webp'], // Serve avif/webp instead of png
    deviceSizes: [375, 640, 750, 828, 1080, 1200], // Match real device breakpoints
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache images for 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wlwyvbrpatzecobyppgn.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', '@supabase/ssr', '@vercel/analytics'],
  },
};

export default nextConfig;
