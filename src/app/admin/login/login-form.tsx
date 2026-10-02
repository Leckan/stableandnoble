"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter(); const params = useSearchParams();
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget); const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: String(data.get("email")), password: String(data.get("password")) });
    if (signInError) { setError("Email or password was not recognized."); setBusy(false); return; }
    router.replace(params.get("next") || "/admin"); router.refresh();
  }
  return <form className="login-form" onSubmit={submit}><label>Email address<input name="email" type="email" autoComplete="username" required/></label><label>Password<input name="password" type="password" autoComplete="current-password" required/></label>{params.get("error") === "access" && <p className="form-error">This account does not have staff access.</p>}{error && <p className="form-error" role="alert">{error}</p>}<button className="button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}<span>↗</span></button></form>;
}
