import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The public Vercel build uses only the Next.js app. Cloudflare-specific
  // helper files remain in the repository for the local vinext preview.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
