import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.unmas.org",
      },
      {
        protocol: "https",
        hostname: "unmas.org",
      },
      {
        protocol: "https",
        hostname: "unsom.unmissions.org",
      },
      {
        protocol: "https",
        hostname: "unsos.unmissions.org",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "media.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
