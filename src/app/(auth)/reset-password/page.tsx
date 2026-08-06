"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      setSuccess(true);
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
          <p className="overline-label mb-1">Security</p>
          <h1 className="font-display text-2xl font-bold text-charcoal">Set New Password</h1>
        </div>

        {success ? (
          <div className="mt-6 text-center space-y-4">
            <div className="rounded-xl bg-emerald/10 p-4 text-xs font-semibold text-emerald">
              Your password has been successfully reset!
            </div>
            <Link href="/login" className="btn-gold inline-block w-full !py-3">
              Proceed to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-charcoal/70">
                New Password
              </label>
              <input
                type="password"
                id="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="mt-1.5 w-full rounded-xl border border-sand bg-cream/30 px-4 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-charcoal/70">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="mt-1.5 w-full rounded-xl border border-sand bg-cream/30 px-4 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full !py-3">
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
