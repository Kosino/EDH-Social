import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  eslint: {
    // Flat eslint-config-next options conflict with the bundled ESLint runner in this Next version.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
