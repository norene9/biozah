"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, String(form.get("email")), String(form.get("password")));
      const response = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: await credential.user.getIdToken() }) });
      if (!response.ok) throw new Error("Not an administrator");
    } catch { setError("The email or password was not recognised, or this account is not an administrator."); setBusy(false); return; }
    router.push("/admin");
    router.refresh();
  }
  return <form className="checkout-form" onSubmit={submit}><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Password<input name="password" type="password" required autoComplete="current-password" /></label>{error && <p className="form-error">{error}</p>}<button className="button button-dark" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button></form>;
}
