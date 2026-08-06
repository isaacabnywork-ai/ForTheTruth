"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface StaffLockScreenProps {
  onUnlock: () => void;
}

/**
 * Admin sign-in. Security lives server-side: credentials are verified by
 * WordPress (JWT), and admin rights by /api/admin/session (ADMIN_EMAILS).
 * This screen contains no credentials and no client-side bypasses.
 */
export function StaffLockScreen({ onUnlock }: StaffLockScreenProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setBusy(true);

    try {
      // 1. Real WordPress login (sets the httpOnly session cookie)
      const result = await login(email, password);
      if (!result.ok) {
        setErrorMessage(result.error ?? "Invalid credentials.");
        return;
      }

      // 2. Server-side admin check against ADMIN_EMAILS
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      const data = await res.json();
      if (data.isAdmin) {
        onUnlock();
      } else {
        setErrorMessage(
          "This account is not authorized for admin access. Add its email to ADMIN_EMAILS in .env.local."
        );
      }
    } catch {
      setErrorMessage("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-navy px-4 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-25">
        <div className="h-[600px] w-[600px] rounded-full bg-gold/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-gold-dark to-gold-light shadow-lg">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16324F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 className="text-center font-display text-2xl font-black tracking-tight text-white">
          Admin Portal
        </h1>
        <p className="mt-2 text-center text-xs text-white/60">
          Sign in with your WordPress admin account. POS, orders, inventory,
          and shelf curation live behind this door.
        </p>

        {errorMessage && (
          <p className="mt-5 rounded-xl border border-rose-500/50 bg-rose-500/20 p-2.5 text-center text-xs font-bold text-rose-300">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/70">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white placeholder-white/40 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
              placeholder="you@forthetruth.in"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/70">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white placeholder-white/40 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-gold-dark to-gold py-3.5 font-display text-sm font-extrabold uppercase tracking-wider text-navy shadow-lg transition-transform hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Unlock Admin Portal →"}
          </button>
        </form>
      </div>
    </div>
  );
}
