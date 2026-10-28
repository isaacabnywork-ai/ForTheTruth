import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us | For The Truth",
  description:
    "Write to us at For The Truth. Phone: +918604685533, Email: contact@forthetruth.in. Questions about books, orders, church partnerships, or recommendations.",
};

export default function ContactPage() {
  return (
    <div className="bg-offwhite min-h-screen py-12 md:py-20">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="overline-label text-gold-dark">Customer Support &amp; Ministry Inquiries</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-charcoal md:text-4xl">
            Contact Us
          </h1>
          <p className="mt-2 text-base text-charcoal/70 font-medium">
            Write to us
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
          {/* Info Card */}
          <div className="space-y-6 rounded-3xl border border-sand bg-white p-7 shadow-card">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal/50">
                Write to us
              </p>
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="rounded-full bg-gold/15 p-2 text-gold-dark shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <div>
                    <span className="block text-xs font-semibold text-charcoal/50">Phone</span>
                    <a
                      href="tel:+918604685533"
                      className="text-base font-bold text-charcoal transition-smooth hover:text-gold-dark"
                    >
                      +918604685533
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="rounded-full bg-gold/15 p-2 text-gold-dark shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <div>
                    <span className="block text-xs font-semibold text-charcoal/50">Email</span>
                    <a
                      href="mailto:contact@forthetruth.in"
                      className="text-base font-bold text-charcoal transition-smooth hover:text-gold-dark"
                    >
                      contact@forthetruth.in
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-sand/60 pt-5">
              <h2 className="font-display text-sm font-bold text-charcoal uppercase tracking-wider">
                Support Hours
              </h2>
              <p className="mt-1.5 text-xs text-charcoal/70">
                Monday – Saturday: 09:00 AM – 05:00 PM IST
              </p>
              <p className="mt-1 text-xs text-charcoal/50">
                All communications and order updates are processed promptly.
              </p>
            </div>

            <div className="border-t border-sand/60 pt-5">
              <h2 className="font-display text-sm font-bold text-charcoal uppercase tracking-wider">
                Address for Returns
              </h2>
              <p className="mt-1.5 text-xs text-charcoal/70 leading-relaxed">
                <strong>FOR THE TRUTH PRESS</strong><br />
                Shop 1G/A &amp; 1G/B Kahlon Emporium III,<br />
                Sector 18, Vrindavan Colony, Lucknow,<br />
                Uttar Pradesh 226029<br />
                Phone: 8604685533
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-3xl border border-sand bg-white p-7 shadow-card">
            <h2 className="font-display text-xl font-bold text-charcoal">Send us a message</h2>
            <form className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-charcoal/70">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  placeholder="Your full name"
                  className="mt-1.5 w-full rounded-xl border border-sand bg-cream/30 px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-charcoal/70">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-xl border border-sand bg-cream/30 px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-charcoal/70">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  placeholder="Order enquiry, recommendation, etc."
                  className="mt-1.5 w-full rounded-xl border border-sand bg-cream/30 px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-charcoal/70">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  placeholder="How can we help you?"
                  className="mt-1.5 w-full rounded-xl border border-sand bg-cream/30 px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-gold focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="btn-cta w-full py-3 text-sm font-bold uppercase tracking-wider"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
