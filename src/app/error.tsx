"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-offwhite px-4">
      <div className="mx-auto max-w-xl text-center">
        {/* Decorative icon */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border-4 border-gold/20 bg-white shadow-card">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gold-dark"
            aria-hidden="true"
          >
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>

        <p className="overline-label">Something Went Wrong</p>
        <h1 className="mt-3 font-display text-4xl font-black text-charcoal">
          A page fell off the shelf
        </h1>
        <p className="mt-4 text-base leading-relaxed text-charcoal/55">
          We hit an unexpected snag. Try refreshing — if it keeps happening,
          our team has been notified.
        </p>

        {/* Error digest for debugging */}
        {error?.digest && (
          <p className="mt-3 font-mono text-xs text-charcoal/30">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn-gold">
            Try Again
          </button>
          <Link href="/" className="btn-outline">
            Back Home
          </Link>
          <Link href="/contact" className="btn-outline">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
