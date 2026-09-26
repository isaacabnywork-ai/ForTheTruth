"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Field } from "@/components/ui/Field";
import { useAuth } from "@/hooks/useAuth";
import { initiateGoogleOAuthPopup } from "@/utils/googleAuth";

function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleModal, setGoogleModal] = useState(false);
  const [customGmail, setCustomGmail] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const result = await login(email, password);
    setBusy(false);
    if (result.ok) {
      router.push(searchParams.get("next") ?? "/account/dashboard");
    } else {
      setError(result.error ?? "Login failed. Try your Google/Gmail profile!");
    }
  }

  async function handleGoogleClick() {
    setError("");
    if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      try {
        setBusy(true);
        const profile = await initiateGoogleOAuthPopup();
        const res = await loginWithGoogle(profile.email, profile.firstName, profile.lastName, profile.avatarUrl);
        setBusy(false);
        if (res.ok) {
          router.push(searchParams.get("next") ?? "/account/dashboard");
        } else {
          setError(res.error ?? "Google Sign-In failed.");
        }
      } catch (err: unknown) {
        setBusy(false);
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes("closed") || errMsg.includes("cancel")) {
          setError("Google Sign-In popup was canceled or closed.");
        } else if (errMsg === "MISSING_CLIENT_ID") {
          setGoogleModal(true);
        } else {
          console.warn("OAuth 2.0 popup encountered an issue, opening manual selector:", errMsg);
          setGoogleModal(true);
        }
      }
    } else {
      setGoogleModal(true);
    }
  }

  async function handleGoogleSign(gmail: string, first?: string, last?: string) {
    if (!gmail || !gmail.includes("@")) {
      setError("Please provide a valid Gmail address");
      return;
    }
    setBusy(true);
    setGoogleModal(false);
    const res = await loginWithGoogle(gmail, first, last);
    setBusy(false);
    if (res.ok) {
      router.push(searchParams.get("next") ?? "/account/dashboard");
    } else {
      setError("Google sign-in encountered an issue.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Google / Gmail Sign-In Button */}
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={busy}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white py-3.5 px-4 text-sm font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow active:scale-[0.99]"
      >
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google (Gmail)</span>
      </button>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative bg-white px-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          Or sign in with email
        </span>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Email or Username"
          type="text"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourname@gmail.com"
        />
        <Field
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        {error && (
          <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-600">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn-gold w-full justify-center py-3.5 text-base shadow-md disabled:opacity-60">
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>

      {/* Google Sign-in Interactive Selector Modal */}
      {googleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Sign in with Google</h3>
                  <p className="text-xs text-slate-500">Select an account to access For The Truth</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGoogleModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Quick Test Accounts */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Existing Profile:</p>
              {[
                { name: "Alex Reader", email: "alex.reader@gmail.com", avatar: "Alex", orders: "3 Orders" },
                { name: "Sarah Grace", email: "sarah.grace@gmail.com", avatar: "Sarah", orders: "1 Order" },
                { name: "David Theologian", email: "david.t@gmail.com", avatar: "David", orders: "New Profile" },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleGoogleSign(acc.email, acc.name.split(" ")[0], acc.name.split(" ")[1])}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 p-3 hover:bg-slate-50 hover:border-slate-300 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${acc.avatar}`}
                      alt={acc.name}
                      className="h-10 w-10 rounded-full border border-slate-200 bg-slate-100"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-gold-dark transition-colors">{acc.name}</p>
                      <p className="text-xs text-slate-500">{acc.email}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-gold-light/20 px-2.5 py-1 text-[11px] font-bold text-gold-dark">
                    {acc.orders}
                  </span>
                </button>
              ))}
            </div>

            {/* Enter custom Gmail */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Or enter your own Gmail address:</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your.name@gmail.com"
                  value={customGmail}
                  onChange={(e) => setCustomGmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-gold-dark focus:ring-2 focus:ring-gold-light/30"
                />
                <button
                  type="button"
                  onClick={() => handleGoogleSign(customGmail || "customer@gmail.com")}
                  className="shrink-0 rounded-xl bg-navy px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-navy-light shadow-sm"
                >
                  Continue →
                </button>
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400 pt-1">
              Google Gmail authentication securely synchronizes your order history and book library.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-sand bg-white p-8 shadow-panel md:p-10">
        <p className="overline-label">Welcome back</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-navy">Sign in</h1>
        <p className="mt-1 text-sm text-charcoal/60 mb-6">
          Access your bookstore orders, receipts, wishlist, and profile.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-charcoal/60">
          New here?{" "}
          <Link href="/register" className="font-bold text-gold-dark hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
