"use client";

import type { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Field({ label, error, id, ...props }: FieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label
        htmlFor={fieldId}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal/60"
      >
        {label}
      </label>
      <input
        id={fieldId}
        {...props}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 transition-smooth focus:outline-none focus:ring-2 focus:ring-gold/25 ${
          error ? "border-red-400" : "border-sand focus:border-gold"
        }`}
      />
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
