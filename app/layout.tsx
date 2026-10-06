import "./globals.css";
import type { ReactNode } from "react";
import { headers } from "next/headers";

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Render each request with the nonce supplied by middleware.
  await headers();
  return children;
}
