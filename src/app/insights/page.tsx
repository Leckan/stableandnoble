import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getInsights } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Real Estate Insights",
  description: "Practical perspectives on property analysis, real estate investing, renovation, seller resources, and technology.",
  alternates: { canonical: "/insights" }
};

function publishedDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));
}

export default async function InsightsPage() {
  const posts = await getInsights(24);
  return <main>
    <section className="inner-hero"><div className="page-wrap inner-hero-content"><p className="eyebrow">EDITORIAL NOTEBOOK</p><h1>Ideas for a more<br/><em>informed market.</em></h1><p className="inner-intro">Practical perspectives on property analysis, investing, market context, and the work of creating long-term value.</p></div><div className="inner-hero-bottom"><span>STABLE & NOBLE PROPERTIES</span><span>INSIGHTS / FIELD NOTES</span></div></section>
    <section className="section-pad"><div className="page-wrap">
      {posts.length ? <div className="insight-grid">{posts.map(post => <article className="insight-card" key={post.slug}>
        <Link href={`/insights/${post.slug}`} className="insight-card-image" aria-label={`Read ${post.title}`}>
          {post.imageUrl ? <Image src={post.imageUrl} alt={post.imageAlt || ""} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"/> : <span className="insight-image-placeholder">S&N <i>FIELD NOTES</i></span>}
        </Link>
        <div className="insight-card-meta"><span>{post.category || "Perspective"}</span><time dateTime={post.publishedAt}>{publishedDate(post.publishedAt)}</time></div>
        <h2><Link href={`/insights/${post.slug}`}>{post.title}</Link></h2>
        {post.excerpt && <p>{post.excerpt}</p>}
        <Link className="text-link" href={`/insights/${post.slug}`}>Read insight <span>↗</span></Link>
      </article>)}</div> : <div className="insights-empty insight-list-empty"><p className="eyebrow">EDITORIAL NOTEBOOK</p><h2>Thoughtful perspectives.<br/><em>Grounded in practice.</em></h2><p>New insights are in development. Our editorial focus includes property analysis, seller resources, market context, renovation, and real estate technology.</p><div className="topic-row">{["Property analysis", "Seller resources", "Market insights", "Renovation", "Real estate technology"].map(topic => <span key={topic}>{topic}</span>)}</div></div>}
    </div></section>
    <section className="small-cta"><div className="page-wrap"><p>Have a property question or opportunity?</p><Link className="text-link" href="/contact">Start a conversation <span>↗</span></Link></div></section>
  </main>;
}
