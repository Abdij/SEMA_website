export function contentSecurityPolicy(nonce: string, development: boolean) {
  return [
    "default-src 'self'", "base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'", "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'", "img-src 'self' data: https:", "font-src 'self' data:",
    `connect-src 'self'${development ? " ws: wss:" : ""}`,
    // Embeds remain isolated documents; parent scripts cannot load from these origins.
    // 'self' covers the Survey Coverage Dashboard (public/dashboards/*.html,
    // same-origin static page embedded via DashboardAccessGate).
    "frame-src 'self' https://*.arcgis.com https://*.arcgisonline.com https://app.powerbi.com https://*.powerbi.com",
    ...(development ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}
export const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];
