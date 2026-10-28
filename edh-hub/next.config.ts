import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dbkaununwsckijzgdvjy.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "cards.scryfall.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.scryfall.com",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    // Flat eslint-config-next options conflict with the bundled ESLint runner in this Next version.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
