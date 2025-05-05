import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
       // Add Firebase Storage hostname(s)
       // The default format is firebasestorage.googleapis.com
       // You might have a different one if using custom domains
       {
         protocol: 'https',
         hostname: 'firebasestorage.googleapis.com',
         port: '',
         // You might need to adjust the pathname pattern based on your bucket structure
         // Example: /v0/b/your-project-id.appspot.com/o/**
         pathname: '/v0/b/**',
       },
    ],
  },
};

export default nextConfig;

        