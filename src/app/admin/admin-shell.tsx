import Link from "next/link";
import { signOut } from "./actions";

const links = [["Overview","/admin"],["Properties","/admin/properties"],["Leads","/admin/leads"],["Deals","/admin/deals"],["Analytics","/admin/analytics"]];
export function AdminShell({ children, name }: { children: React.ReactNode; name?: string | null }) {
  return <main className="admin-area"><aside className="admin-sidebar"><Link href="/" className="brand"><span className="brand-mark">S<span>&</span>N</span><span className="brand-copy">STABLE & NOBLE<small>OPERATIONS</small></span></Link><nav aria-label="Admin navigation">{links.map(([label,href])=><Link key={href} href={href}>{label}<span>↗</span></Link>)}</nav><div className="admin-user"><span className="eyebrow">SIGNED IN</span><strong>{name || "Team member"}</strong><form action={signOut}><button type="submit">Sign out</button></form></div></aside><div className="admin-main"><div className="admin-topline"><span>STABLE & NOBLE / OPERATIONS</span><Link href="/">View website ↗</Link></div><div className="admin-content">{children}</div></div></main>;
}
