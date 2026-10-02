import { cache } from "react";

const apiVersion = "2025-05-01";

export type SiteSettings = {
  homeEyebrow?: string;
  homeHeadlineFirst?: string;
  homeHeadlineSecond?: string;
  homeDescription?: string;
  introHeading?: string;
  introBody?: string;
  footerNote?: string;
};

export type NavigationItem = { label: string; href: string };
export type GlobalSeoSettings = { seoTitle?: string; seoDescription?: string };
export type Faq = { question: string; answer: string; category?: string; sortOrder?: number };
export type PortableBlock = {
  _key?: string;
  _type: string;
  style?: string;
  listItem?: string;
  children?: { _key?: string; _type: string; text?: string; marks?: string[] }[];
  markDefs?: { _key: string; _type: string; href?: string }[];
  imageUrl?: string;
  alt?: string;
};
export type InsightPost = {
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  publishedAt: string;
  updatedAt?: string;
  author?: { name?: string; role?: string };
  imageUrl?: string;
  imageAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  content?: PortableBlock[];
};

const querySanity = cache(async (query: string, params: Record<string, string> = {}): Promise<unknown | null> => {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (!projectId || !dataset) return null;

  try {
    const url = new URL(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${encodeURIComponent(dataset)}`);
    url.searchParams.set("query", query);
    for (const [name, value] of Object.entries(params)) url.searchParams.set(`$${name}`, JSON.stringify(value));
    const response = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(2500)
    });
    if (!response.ok) return null;
    const payload = await response.json() as { result?: unknown };
    return payload.result ?? null;
  } catch {
    return null;
  }
});

export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  return await querySanity('*[_type == "siteSettings"][0]{homeEyebrow,homeHeadlineFirst,homeHeadlineSecond,homeDescription,introHeading,introBody,footerNote}') as SiteSettings | null;
});

const defaultNavigation: NavigationItem[] = [
  { label: "About", href: "/about" },
  { label: "What We Do", href: "/what-we-do" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Sell Your Property", href: "/sell-your-property" },
  { label: "Insights", href: "/insights" },
  { label: "Invest", href: "/invest" }
];

const defaultFaqs: Faq[] = [
  {
    question: "How does Stable & Noble evaluate a property?",
    answer: "We start with the property itself: its condition, location, current use, and potential after thoughtful improvements. We then review relevant market information, likely costs, timing, and operating assumptions. Each opportunity is considered on its own facts; submitting information does not guarantee an offer or investment outcome.",
    category: "Property evaluation",
    sortOrder: 1
  },
  {
    question: "What information should I include when I submit a property?",
    answer: "A property address or general location, property type and current condition, your expected price or terms, and any timing considerations are useful starting points. Photos or basic operating details can also help. Please share only information you are authorized to provide.",
    category: "Seller resources",
    sortOrder: 2
  },
  {
    question: "Does submitting a property guarantee an offer?",
    answer: "No. Sharing property information allows the opportunity to be reviewed, but it does not guarantee follow-up, an offer, a purchase, or an investment outcome. Any transaction would require separate review and written agreements.",
    category: "Seller resources",
    sortOrder: 3
  }
];

export const getNavigation = cache(async (): Promise<NavigationItem[]> => {
  const result = await querySanity('*[_type == "navigation"][0]{items[]{label,href}}') as { items?: NavigationItem[] } | null;
  const items = Array.isArray(result?.items) ? result.items.filter(item => item && typeof item.label === "string" && typeof item.href === "string" && /^\/(?!\/)/.test(item.href)) : null;
  if (!items?.length) return defaultNavigation;
  if (items.some(item => item.href === "/sell-your-property")) return items;
  return [...items.slice(0, 3), { label: "Sell Your Property", href: "/sell-your-property" }, ...items.slice(3)];
});

export const getGlobalSeoSettings = cache(async (): Promise<GlobalSeoSettings | null> => {
  return await querySanity('*[_type == "seoSettings"][0]{seoTitle,seoDescription}') as GlobalSeoSettings | null;
});

export const getFaqs = cache(async (): Promise<Faq[]> => {
  const result = await querySanity('*[_type == "faq"]|order(sortOrder asc){question,"answer":pt::text(answer),category,sortOrder}') as Faq[] | null;
  if (!Array.isArray(result)) return defaultFaqs;
  return result.filter(faq => typeof faq.question === "string" && typeof faq.answer === "string");
});

const insightProjection = `_id,title,"slug":slug.current,excerpt,category,publishedAt,updatedAt,"author":author->{name,role},"imageUrl":featuredImage.asset->url,"imageAlt":coalesce(featuredImage.alt,title),seoTitle,seoDescription`;

export const getInsights = cache(async (limit = 12): Promise<InsightPost[]> => {
  const safeLimit = Math.max(1, Math.min(Math.trunc(limit), 48));
  const result = await querySanity(`*[_type == "blogPost" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()] | order(publishedAt desc)[0...${safeLimit}]{${insightProjection}}`) as InsightPost[] | null;
  if (!Array.isArray(result)) return [];
  return result.filter(post => typeof post.title === "string" && typeof post.slug === "string" && typeof post.publishedAt === "string");
});

export const getInsight = cache(async (slug: string): Promise<InsightPost | null> => {
  const result = await querySanity(`*[_type == "blogPost" && slug.current == $slug && defined(publishedAt) && publishedAt <= now()][0]{${insightProjection},content[]{...,"imageUrl":asset->url}}`, { slug }) as InsightPost | null;
  return result && typeof result.title === "string" && typeof result.slug === "string" ? result : null;
});
