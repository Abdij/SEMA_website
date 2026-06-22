import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SEMA | Somalia Explosive Management Authority",
    template: "%s | SEMA",
  },
  description:
    "Official website of the Somalia Explosive Management Authority, coordinating national efforts on explosive hazard management, risk education, clearance, and mine action information management.",
  openGraph: {
    title: "SEMA | Somalia Explosive Management Authority",
    description:
      "Official website of the Somalia Explosive Management Authority, coordinating national efforts on explosive hazard management, risk education, clearance, and mine action information management.",
    siteName: "Somalia Explosive Management Authority",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
