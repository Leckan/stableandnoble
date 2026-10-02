import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.stableandnoble.com";
  const paths = ["", "/about", "/what-we-do", "/what-we-do/acquisitions", "/what-we-do/renovation", "/what-we-do/operations", "/what-we-do/property-sales", "/what-we-do/partnerships", "/portfolio", "/sell-your-property", "/invest", "/property-analyzer", "/insights", "/contact", "/privacy", "/terms", "/disclosures"];
  return paths.map(path => ({ url: `${base}${path}`, lastModified: new Date() }));
}
