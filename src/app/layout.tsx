import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
import { AnalyticsListener } from "@/components/analytics";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.stableandnoble.com";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Stable & Noble Properties | Building Value Through Real Estate", template: "%s | Stable & Noble Properties" },
  description: "Stable & Noble Properties acquires, improves, and operates real estate through disciplined investing, market intelligence, and technology.",
  openGraph: { type: "website", siteName: "Stable & Noble Properties", title: "Building Value Through Real Estate", description: "Disciplined investing, market intelligence, and technology." },
  twitter: { card: "summary_large_image" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AnalyticsListener/><SiteHeader />{children}<SiteFooter /></body></html>;
}
