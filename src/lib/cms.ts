export type SiteSettings = {
  homeEyebrow?: string;
  homeHeadlineFirst?: string;
  homeHeadlineSecond?: string;
  homeDescription?: string;
  introHeading?: string;
  introBody?: string;
  footerNote?: string;
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (!projectId || !dataset) return null;
  const query = '*[_type == "siteSettings"][0]{homeEyebrow,homeHeadlineFirst,homeHeadlineSecond,homeDescription,introHeading,introBody,footerNote}';
  try {
    const url = `https://${projectId}.api.sanity.io/v2025-05-01/data/query/${encodeURIComponent(dataset)}?query=${encodeURIComponent(query)}`;
    const response = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(2500) });
    if (!response.ok) return null;
    const payload = await response.json() as { result?: SiteSettings | null };
    return payload.result || null;
  } catch { return null; }
}
