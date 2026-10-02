import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InsightContent } from "@/components/insight-content";
import { getInsight, getInsights } from "@/lib/cms";

type Props = { params: Promise<{ slug: string }> };

function publishedDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getInsight(slug);
  if (!post) return { title: "Insight not found", robots: { index: false, follow: false } };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/insights/${post.slug}` },
    openGraph: { type: "article", title, description, publishedTime: post.publishedAt, modifiedTime: post.updatedAt, images: post.imageUrl ? [{ url: post.imageUrl, alt: post.imageAlt || post.title }] : [] },
    twitter: { card: "summary_large_image", title, description, images: post.imageUrl ? [{ url: post.imageUrl, alt: post.imageAlt || post.title }] : [] }
  };
}

export default async function InsightPage({ params }: Props) {
  const { slug } = await params;
  const post = await getInsight(slug);
  if (!post) notFound();
  const related = post.category ? (await getInsights(8)).filter(item => item.slug !== post.slug && item.category === post.category).slice(0, 3) : [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.stableandnoble.com";
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: `${siteUrl}/insights/${post.slug}`,
    image: post.imageUrl ? [post.imageUrl] : undefined,
    author: post.author?.name ? { "@type": "Person", name: post.author.name } : { "@type": "Organization", name: "Stable & Noble Properties" },
    publisher: { "@type": "Organization", name: "Stable & Noble Properties", url: siteUrl }
  };
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData).replace(/</g, "\\u003c") }}/>
    <section className="insight-hero"><div className="page-wrap insight-hero-copy"><Link className="insight-back" href="/insights">← All insights</Link><p className="eyebrow">{post.category || "STABLE & NOBLE / INSIGHTS"}</p><h1>{post.title}</h1>{post.excerpt && <p className="inner-intro">{post.excerpt}</p>}<div className="insight-byline"><time dateTime={post.publishedAt}>{publishedDate(post.publishedAt)}</time>{post.author?.name && <span>{post.author.name}{post.author.role ? ` · ${post.author.role}` : ""}</span>}</div></div></section>
    {post.imageUrl && <div className="page-wrap insight-feature-image"><Image src={post.imageUrl} alt={post.imageAlt || post.title} width={1800} height={1050} priority sizes="(max-width: 1100px) 100vw, 1200px"/></div>}
    <article className="section-pad insight-article"><div className="page-wrap insight-article-wrap"><InsightContent blocks={post.content}/></div></article>
    {related.length > 0 && <section className="section-pad insight-related"><div className="page-wrap"><div className="section-heading"><div><p className="eyebrow">CONTINUE READING</p><h2>More on <em>{post.category}.</em></h2></div><Link href="/insights" className="text-link">All insights <span>↗</span></Link></div><div className="insight-grid">{related.map(item => <article className="insight-card insight-card-compact" key={item.slug}><Link className="insight-card-image" href={`/insights/${item.slug}`} aria-label={`Read ${item.title}`}>{item.imageUrl ? <Image src={item.imageUrl} alt={item.imageAlt || ""} fill sizes="(max-width: 700px) 100vw, 33vw"/> : <span className="insight-image-placeholder">S&N <i>FIELD NOTES</i></span>}</Link><div className="insight-card-meta"><span>{item.category || "Perspective"}</span><time dateTime={item.publishedAt}>{publishedDate(item.publishedAt)}</time></div><h2><Link href={`/insights/${item.slug}`}>{item.title}</Link></h2>{item.excerpt && <p>{item.excerpt}</p>}</article>)}</div></div></section>}
    <section className="small-cta"><div className="page-wrap"><p>Would you like to discuss a property opportunity?</p><Link className="text-link" href="/contact">Contact Stable & Noble <span>↗</span></Link></div></section>
  </main>;
}
