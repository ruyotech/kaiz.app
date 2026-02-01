import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Block all search engines and robots
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://kaiz-api-213334506754.us-central1.run.app',
  },
  // Disable source maps in production
  productionBrowserSourceMaps: false,
};

export default nextConfig;
