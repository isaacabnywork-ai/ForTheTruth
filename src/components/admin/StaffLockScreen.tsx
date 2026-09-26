"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { initiateGoogleOAuthPopup } from "@/utils/googleAuth";

interface StaffLockScreenProps {
  onUnlock: () => void;
}

/**
 * Admin sign-in. Security lives server-side: credentials are verified by
 * WordPress (JWT), and admin rights by /api/admin/session (ADMIN_EMAILS).
 * This screen contains no credentials and no client-side bypasses.
 *
 * Supports two sign-in methods:
 *  1. Google OAuth — for admins who registered via Google on WordPress
 *  2. WordPress username/password — for admins with direct WP credentials
 */
export function StaffLockScreen({ onUnlock }: StaffLockScreenProps) {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  // ── WordPress username/password sign-in ────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setBusy(true);

    try {
      const result = await login(email, password);
      if (!result.ok) {
        setErrorMessage(result.error ?? "Invalid credentials.");
        return;
      }

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

  // ── Google OAuth sign-in ───────────────────────────────────────────────────
  async function handleGoogleSignIn() {
    setErrorMessage("");
    setGoogleBusy(true);

    try {
      // 1. Open Google OAuth popup → get verified Gmail profile
      const profile = await initiateGoogleOAuthPopup(
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      );

      // 2. Set session cookie via /api/auth/google
      const result = await loginWithGoogle(
        profile.email,
        profile.firstName,
        profile.lastName,
        profile.avatarUrl
      );
      if (!result.ok) {
        setErrorMessage(result.error ?? "Google sign-in failed.");
        return;
      }

      // 3. Server-side admin check — Gmail must be in ADMIN_EMAILS env var
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      const data = await res.json();
      if (data.isAdmin) {
        onUnlock();
      } else {
        setErrorMessage(
          `${profile.email} is not authorised for admin access. Ask your administrator to add this Gmail to ADMIN_EMAILS.`
        );
      }
    } catch (err: any) {
      if (err?.message === "MISSING_CLIENT_ID") {
        setErrorMessage("Google Client ID is not configured. Check NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
      } else if (
        err?.message?.includes("popup_closed") ||
        err?.message?.includes("access_denied")
      ) {
        setErrorMessage("Sign-in cancelled. Please try again.");
      } else {
        setErrorMessage(err?.message ?? "Google sign-in failed. Try again.");
      }
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-navy px-4 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-25">
        <div className="h-[600px] w-[600px] rounded-full bg-gold/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        {/* Lock icon */}
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

        {/* Error message */}
        {errorMessage && (
          <p className="mt-5 rounded-xl border border-rose-500/50 bg-rose-500/20 p-2.5 text-center text-xs font-bold text-rose-300">
            {errorMessage}
          </p>
        )}

        {/* ── Google Sign-In Button ── */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleBusy || busy}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.99] disabled:opacity-60"
        >
          {googleBusy ? (
            <svg className="h-5 w-5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.2 33.1 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l6-6C34.3 6.5 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z"/>
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3 0 5.7 1.1 7.8 2.9l6-6C34.3 6.5 29.4 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
              <path fill="#FBBC05" d="M24 44c5.2 0 9.9-1.7 13.6-4.7l-6.3-5.2C29.5 35.6 26.9 36.5 24 36.5c-5.7 0-10.5-3.8-12.2-9H5.6C9 38.8 16 44 24 44z"/>
              <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.8 2.3-2.3 4.3-4.3 5.7l6.3 5.2C41.3 36.3 44.5 30.6 44.5 24c0-1.3-.1-2.7-.2-4z"/>
            </svg>
          )}
          {googleBusy ? "Signing in with Google…" : "Continue with Google"}
        </button>

        {/* ── Divider ── */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs font-semibold text-white/40">or use WordPress credentials</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* ── WordPress credentials form ── */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/70">
              Email or Username
            </label>
            <input
              id="admin-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white placeholder-white/40 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
              placeholder="you@forthetruth.in or username"
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
            disabled={busy || googleBusy}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-gold-dark to-gold py-3.5 font-display text-sm font-extrabold uppercase tracking-wider text-navy shadow-lg transition-transform hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Unlock Admin Portal →"}
          </button>
        </form>
      </div>
    </div>
  );
}
