import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Team sign in", robots: { index: false, follow: false } };
export default function AdminLoginPage() {
  return <main className="admin-login"><div className="admin-login-card"><Link href="/" className="brand"><span className="brand-mark">S<span>&</span>N</span><span className="brand-copy">STABLE & NOBLE<small>PROPERTIES</small></span></Link><p className="eyebrow">TEAM ACCESS</p><h1>Welcome <em>back.</em></h1><p className="muted">Sign in with your Stable & Noble team account.</p><Suspense><LoginForm/></Suspense><p className="login-footnote">Team access is managed by your administrator.</p></div></main>;
}
