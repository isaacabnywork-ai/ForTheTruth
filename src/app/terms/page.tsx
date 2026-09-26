import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | For The Truth",
  description: "Terms and conditions for browsing, purchasing, and placing church bulk orders on For The Truth.",
};

export default function TermsPage() {
  return (
    <div className="bg-offwhite min-h-screen py-12 md:py-20">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <div className="mb-10">
          <p className="overline-label">Legal</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-charcoal md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-charcoal/60">
            Last updated: July 2026
          </p>
        </div>

        <div className="space-y-8 rounded-3xl border border-sand bg-white p-8 shadow-card md:p-10 text-sm text-charcoal/75 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-charcoal mb-3">1. Store Terms</h2>
            <p>
              By accessing For The Truth storefront or placing an order, you agree to these Terms of Service. All products are subject to availability and prices listed in Indian Rupees (INR).
            </p>
          </section>

          <section className="border-t border-sand/60 pt-6">
            <h2 className="font-display text-xl font-bold text-charcoal mb-3">2. Order Acceptance</h2>
            <p>
              We reserve the right to cancel or limit any order in cases of pricing errors, stock unavailability, or fraudulent activity. If an order is canceled after payment, a full refund will be issued immediately.
            </p>
          </section>

          <section className="border-t border-sand/60 pt-6">
            <h2 className="font-display text-xl font-bold text-charcoal mb-3">3. Intellectual Property</h2>
            <p>
              Book covers, titles, descriptions, and logos belong to their respective publishers and For The Truth. Content on this site may not be reproduced without prior permission.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
