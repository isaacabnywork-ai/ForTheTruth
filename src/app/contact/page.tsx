import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us | For The Truth",
  description: "Get in touch with For The Truth bookstore team. Questions about orders, bulk discounts, recommendations, or support.",
};

export default function ContactPage() {
  return (
    <div className="bg-offwhite min-h-screen py-12 md:py-20">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="overline-label">Customer Support &amp; Enquiries</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-charcoal md:text-4xl">
            We&apos;re here to help
          </h1>
          <p className="mt-2 text-sm text-charcoal/60">
            Have a question about an order, book availability, or church bulk pricing? Contact us below.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
          {/* Info Card */}
          <div className="space-y-6 rounded-3xl border border-sand bg-white p-7 shadow-card">
            <div>
              <h2 className="font-display text-lg font-bold text-charcoal">Direct Email</h2>
              <p className="mt-1 text-xs text-charcoal/60">Fastest response for order support &amp; queries.</p>
              <a
                href="mailto:abnyserver@gmail.com"
                className="mt-2 inline-block font-semibold text-sm text-gold-dark hover:underline"
              >
                abnyserver@gmail.com
              </a>
            </div>

            <div className="border-t border-sand/60 pt-5">
              <h2 className="font-display text-lg font-bold text-charcoal">Dispatch Hours</h2>
              <p className="mt-1 text-xs text-charcoal/60">Monday – Saturday: 9:00 AM – 6:00 PM IST</p>
              <p className="mt-0.5 text-xs text-charcoal/50">Orders dispatch within 24 hours.</p>
            </div>

            <div className="border-t border-sand/60 pt-5">
              <h2 className="font-display text-lg font-bold text-charcoal">Church &amp; Bulk Orders</h2>
              <p className="mt-1 text-xs text-charcoal/60">Need custom quotes or invoice payments?</p>
              <Link href="/church-resources#quote" className="mt-2 inline-block text-xs font-bold uppercase tracking-wider text-gold-dark hover:underline">
                Request a Church Quote →
              </Link>
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
                  rows={4}
                  required
                  placeholder="How can we help you?"
                  className="mt-1.5 w-full rounded-xl border border-sand bg-cream/30 px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-gold focus:outline-none"
                />
              </div>

              <button type="submit" className="btn-gold w-full !py-3">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
