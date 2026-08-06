import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | For The Truth",
  description: "Understand how For The Truth collects, uses, and safeguards your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-offwhite min-h-screen py-12 md:py-20">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <div className="mb-10">
          <p className="overline-label">Legal</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-charcoal md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-charcoal/60">
            Last updated: July 2026
          </p>
        </div>

        <div className="space-y-8 rounded-3xl border border-sand bg-white p-8 shadow-card md:p-10 text-sm text-charcoal/75 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-charcoal mb-3">1. Information We Collect</h2>
            <p>
              We collect information you provide when placing an order, registering an account, or subscribing to updates. This includes your name, email address, shipping address, and phone number.
            </p>
          </section>

          <section className="border-t border-sand/60 pt-6">
            <h2 className="font-display text-xl font-bold text-charcoal mb-3">2. Payment Security</h2>
            <p>
              All online payments are processed securely through Razorpay. We do not store credit card, debit card, or netbanking credentials on our servers.
            </p>
          </section>

          <section className="border-t border-sand/60 pt-6">
            <h2 className="font-display text-xl font-bold text-charcoal mb-3">3. How We Use Your Data</h2>
            <p>
              Your personal information is used solely to process orders, deliver books, communicate order updates, and provide customer support. We never sell or rent your personal information to third parties.
            </p>
          </section>

          <section className="border-t border-sand/60 pt-6">
            <h2 className="font-display text-xl font-bold text-charcoal mb-3">4. Cookies &amp; Local Storage</h2>
            <p>
              We use local browser storage and cookies to remember your shopping cart items, wishlist preferences, and logged-in session state.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
