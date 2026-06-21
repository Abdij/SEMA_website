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
    ],
  },
};

export default nextConfig;
