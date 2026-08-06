"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset link");
      setMessage("If an account exists with this email, a password reset link has been sent.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-offwhite flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-sand bg-white p-8 shadow-card md:p-10">
        <div className="text-center">
          <p className="overline-label mb-1">Account Recovery</p>
          <h1 className="font-display text-2xl font-bold text-charcoal">Forgot your password?</h1>
          <p className="mt-2 text-xs text-charcoal/60">
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        {message && (
          <div className="mt-6 rounded-xl bg-emerald/10 p-4 text-xs font-semibold text-emerald">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-charcoal/70">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-xl border border-sand bg-cream/30 px-4 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full !py-3">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          <Link href="/login" className="font-semibold text-gold-dark hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
