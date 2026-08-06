"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { useAuth } from "@/hooks/useAuth";

function passwordIssue(pw: string): string | null {
  if (pw.length < 8) return "At least 8 characters";
  if (!/[A-Z]/.test(pw)) return "Add an uppercase letter";
  if (!/[0-9]/.test(pw)) return "Add a number";
  return null;
}

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleModal, setGoogleModal] = useState(false);
  const [customGmail, setCustomGmail] = useState("");

  const pwIssue = form.password ? passwordIssue(form.password) : null;
  const mismatch = form.confirm.length > 0 && form.confirm !== form.password;

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pwIssue || mismatch) return;
    setError("");
    setBusy(true);
    const result = await register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
    });
    setBusy(false);
    if (result.ok) router.push("/account/dashboard");
    else setError(result.error ?? "Registration failed");
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
      router.push("/account/dashboard");
    } else {
      setError("Google profile creation failed.");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-sand bg-white p-8 shadow-panel md:p-10">
        <p className="overline-label">Join the readers</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-navy">Create account</h1>
        <p className="mt-1 text-sm text-charcoal/60 mb-6">
          Sign up to synchronize orders and save favorite books.
        </p>

        {/* Google / Gmail Instant Registration Button */}
        <button
          type="button"
          onClick={() => setGoogleModal(true)}
          disabled={busy}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white py-3.5 px-4 text-sm font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow active:scale-[0.99] mb-6"
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
          <span>Instant Register with Google (Gmail)</span>
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            Or register with email
          </span>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="First name"
              required
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
            />
            <Field
              label="Last name"
              required
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
            />
          </div>
          <Field
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@gmail.com"
          />
          <Field
            label="Password"
            type="password"
            required
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            error={pwIssue ?? undefined}
            placeholder="••••••••"
          />
          <Field
            label="Confirm password"
            type="password"
            required
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => set("confirm", e.target.value)}
            error={mismatch ? "Passwords don't match" : undefined}
            placeholder="••••••••"
          />
          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || !!pwIssue || mismatch}
            className="btn-gold w-full justify-center py-3.5 text-base shadow-md disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create Account"}
          </button>
          <p className="text-center text-xs text-charcoal/45 pt-1">
            By creating an account you agree to our Bookstore Terms &amp; Privacy Policy.
          </p>
        </form>
        <p className="mt-6 text-center text-sm text-charcoal/60 border-t border-sand pt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-gold-dark hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {/* Google Sign-in Interactive Modal */}
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
                  <h3 className="font-display text-base font-bold text-slate-900">Google Profile Creator</h3>
                  <p className="text-xs text-slate-500">Instant Gmail Bookstore Setup</p>
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

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Enter your Gmail address to start:</p>
              <div className="space-y-2.5">
                <input
                  type="email"
                  placeholder="your.name@gmail.com"
                  value={customGmail}
                  onChange={(e) => setCustomGmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm text-slate-800 outline-none focus:border-gold-dark focus:ring-2 focus:ring-gold-light/30 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => handleGoogleSign(customGmail || "new.reader@gmail.com")}
                  className="w-full rounded-xl bg-navy py-3 font-display text-sm font-bold uppercase tracking-wider text-white hover:bg-navy-light shadow-md active:scale-[0.99]"
                >
                  Create Profile & Continue →
                </button>
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              Your Google (Gmail) profile enables real-time order history tracking and one-click receipt downloads.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
