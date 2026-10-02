import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "./admin-shell";
import { requireStaff } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Operations dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const { supabase, profile } = await requireStaff();
  const [properties, deals, sellers, buyers, investors, published] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }).neq("status", "archived"),
    supabase.from("deals").select("id", { count: "exact", head: true }).not("stage", "in", "(sold,held)"),
    supabase.from("seller_leads").select("id", { count: "exact", head: true }).eq("lead_status", "new"),
    supabase.from("buyer_leads").select("id", { count: "exact", head: true }).eq("lead_status", "new"),
    supabase.from("investor_leads").select("id", { count: "exact", head: true }).eq("lead_status", "new"),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("is_public", true)
  ]);
  const cards = [["Properties",properties.count,"/admin/properties"],["Active deals",deals.count,"/admin/deals"],["New seller leads",sellers.count,"/admin/leads"],["New buyer leads",buyers.count,"/admin/leads"],["New investor leads",investors.count,"/admin/leads"],["Published properties",published.count,"/admin/properties"]] as const;
  return <AdminShell name={profile.full_name}><div className="admin-heading"><div><p className="eyebrow">OVERVIEW</p><h1>Good work <em>starts here.</em></h1></div><span className="admin-date">PRIVATE WORKSPACE</span></div><div className="admin-stats">{cards.map(([label,value,href])=><Link href={href} key={label} className="admin-stat"><span>{label}</span><strong>{value ?? "—"}</strong><i>View ↗</i></Link>)}</div><section className="admin-panel"><div className="admin-panel-head"><div><p className="eyebrow">NEXT STEP</p><h2>Keep the operation moving.</h2></div></div><div className="admin-quicklinks"><Link href="/admin/properties">Add a property <span>↗</span></Link><Link href="/admin/leads">Review new inquiries <span>↗</span></Link><Link href="/admin/deals">Update deal pipeline <span>↗</span></Link></div></section></AdminShell>;
}
