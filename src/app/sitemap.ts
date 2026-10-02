import type { MetadataRoute } from "next";
import { getInsights } from "@/lib/cms";
import { getPublicProperties } from "@/lib/properties";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.stableandnoble.com";
  const [insights, properties] = await Promise.all([getInsights(48), getPublicProperties(500)]);
  const paths = ["", "/about", "/what-we-do", "/what-we-do/acquisitions", "/what-we-do/renovation", "/what-we-do/operations", "/what-we-do/property-sales", "/what-we-do/partnerships", "/portfolio", "/sell-your-property", "/invest", "/property-analyzer", "/insights", "/faq", "/contact", "/privacy", "/terms", "/disclosures"];
  return [
    ...paths.map(path => ({ url: `${base}${path}` })),
    ...properties.map(property => ({ url: `${base}/portfolio/${property.slug}`, lastModified: property.updated_at ? new Date(property.updated_at) : undefined })),
    ...insights.map(post => ({ url: `${base}/insights/${post.slug}`, lastModified: new Date(post.publishedAt) }))
  ];
}
