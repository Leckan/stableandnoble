"use client";

import Link from "next/link";
import { useState } from "react";

const nav = [["About", "/about"], ["What We Do", "/what-we-do"], ["Portfolio", "/portfolio"], ["Insights", "/insights"], ["Invest", "/invest"]];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="header-inner">
    <Link href="/" className="brand" aria-label="Stable & Noble Properties home"><span className="brand-mark">S<span>&</span>N</span><span className="brand-copy">STABLE & NOBLE<small>PROPERTIES</small></span></Link>
    <button className="menu-toggle" aria-expanded={open} aria-label="Toggle navigation" onClick={() => setOpen(!open)}><i/><i/></button>
    <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">{nav.map(([name, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{name}</Link>)}<Link className="mobile-sell" href="/sell-your-property">Sell Your Property</Link></nav>
    <Link className="button button-small header-cta" href="/property-analyzer">Analyze a Property <span>↗</span></Link>
  </div></header>;
}

export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-top"><div className="footer-brand"><Link href="/" className="brand brand-light"><span className="brand-mark">S<span>&</span>N</span><span className="brand-copy">STABLE & NOBLE<small>PROPERTIES</small></span></Link><p>Disciplined real estate investing.<br/>Thoughtful value creation.</p></div><div className="footer-col"><span className="eyebrow">Explore</span><Link href="/what-we-do">What We Do</Link><Link href="/portfolio">Portfolio</Link><Link href="/insights">Insights</Link><Link href="/about">About</Link></div><div className="footer-col"><span className="eyebrow">Connect</span><Link href="/sell-your-property">Sell a Property</Link><Link href="/invest">Invest & Partner</Link><Link href="/contact">Contact</Link><Link href="/property-analyzer">Property Analyzer</Link></div><div className="footer-note"><span className="eyebrow">Our point of view</span><p>Real estate decisions deserve a clear process, grounded in the details of each property and market.</p></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Stable & Noble Properties LLC</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/disclosures">Disclosures</Link></div><span>Built for long-term value.</span></div></footer>;
}
