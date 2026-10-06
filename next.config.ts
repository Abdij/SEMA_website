import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { securityHeaders } from "./lib/security-headers";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/api/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
      { source: "/api/catalogue/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
      { source: "/api/:path*", headers: [{ key: "Content-Security-Policy", value: "default-src 'none'; frame-ancestors 'none'; base-uri 'none'" }] },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.unmas.org" },
      { protocol: "https", hostname: "unmas.org" },
      { protocol: "https", hostname: "unsom.unmissions.org" },
      { protocol: "https", hostname: "unsos.unmissions.org" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "media.githubusercontent.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
