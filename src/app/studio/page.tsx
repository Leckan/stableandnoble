import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Content Studio", robots: { index: false, follow: false } };

export default function StudioPage() {
  const configuredStudioUrl = process.env.SANITY_STUDIO_URL;
  if (configuredStudioUrl) redirect(configuredStudioUrl);
  if (process.env.NODE_ENV === "development") redirect(`http://localhost:${process.env.SANITY_STUDIO_PORT || "3334"}`);

  return <main className="studio-handoff"><p className="eyebrow">CONTENT MANAGEMENT</p><h1>Sanity Studio is hosted separately.</h1><p>Set <code>SANITY_STUDIO_URL</code> to your deployed Studio URL to connect it here. For local editing, run <code>npm run studio</code> and open its development address.</p></main>;
}
