import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/plaid/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
  experimental: {
    // @ts-expect-error - Turbopack type missing in NextConfig
    turbopack: {
      root: path.resolve(__dirname, '..'),
    },
  },
};

export default nextConfig;
