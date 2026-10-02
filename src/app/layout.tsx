import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
import { AnalyticsListener } from "@/components/analytics";
import { getGlobalSeoSettings } from "@/lib/cms";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.stableandnoble.com";
const metadataBase = new URL(siteUrl);

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getGlobalSeoSettings();
  const title = seo?.seoTitle || "Stable & Noble Properties | Building Value Through Real Estate";
  const description = seo?.seoDescription || "Stable & Noble Properties acquires, improves, and operates real estate through disciplined investing, market intelligence, and technology.";

  return {
    metadataBase,
    title: { default: title, template: "%s | Stable & Noble Properties" },
    description,
    openGraph: { type: "website", siteName: "Stable & Noble Properties", title, description },
    twitter: { card: "summary_large_image", title, description }
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AnalyticsListener/><SiteHeader />{children}<SiteFooter /></body></html>;
}
