import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Image optimization for Vercel */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp", "image/avif"],
  },
  /* Optimize for production */
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  /* React strict mode */
  reactStrictMode: true,
  /* Security headers to block access to sensitive files */
  async headers() {
    return [
      {
        source: "/:path(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
  /* Rewrites to prevent access to sensitive files */
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:path*",
          destination: "/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
