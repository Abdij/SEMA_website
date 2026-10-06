import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { contentSecurityPolicy } from "./lib/security-headers";

const internationalize = createMiddleware(routing);
export default function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const policy = contentSecurityPolicy(nonce, process.env.NODE_ENV !== "production");
  request.headers.set("x-nonce", nonce);
  request.headers.set("content-security-policy", policy);
  const response = request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/admin/")
    ? NextResponse.next({ request: { headers: request.headers } })
    : internationalize(request);
  response.headers.set("Content-Security-Policy", policy);
  // Nonces must not be reused from a shared HTML cache.
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|images|.*\\..*).*)"],
};
