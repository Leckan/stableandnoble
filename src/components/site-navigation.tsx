"use client";

import Link from "next/link";
import { useState } from "react";
import type { NavigationItem } from "@/lib/cms";

export function SiteNavigation({ items }: { items: NavigationItem[] }) {
  const [open, setOpen] = useState(false);

  return <>
    <button className="menu-toggle" aria-expanded={open} aria-label="Toggle navigation" onClick={() => setOpen(value => !value)}><i/><i/></button>
    <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
      {items.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}
      <Link className="mobile-sell" href="/sell-your-property" onClick={() => setOpen(false)}>Sell Your Property</Link>
    </nav>
  </>;
}
