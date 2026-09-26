import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | For The Truth",
  description: "Find answers to common questions about ordering, shipping, bulk discounts, payments, and returns at For The Truth bookstore.",
};

const FAQ_SECTIONS = [
  {
    category: "Ordering & Stock",
    items: [
      {
        q: "Are all books on the site in stock?",
        a: "Most titles are in stock and ready to dispatch within 24 hours. Items marked 'Pre-order' can still be ordered and will be dispatched as soon as our stock arrives.",
      },
      {
        q: "How do I check the status of my order?",
        a: "You can track your order by logging into your account dashboard under 'My Orders', or by clicking 'Track Order' in your confirmation email.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    items: [
      {
        q: "What are the shipping charges?",
        a: "Shipping is FREE on all orders over ₹499 across India! For orders below ₹499, a flat rate of ₹49 applies.",
      },
      {
        q: "How long does delivery take?",
        a: "Orders dispatch within 24 hours. Delivery typically takes 5–7 business days depending on your location in India.",
      },
    ],
  },
  {
    category: "Payments & Invoicing",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept UPI, Credit/Debit Cards, Netbanking, and Wallets securely via Razorpay. We do not offer Cash on Delivery.",
      },
      {
        q: "Can I get an official GST invoice for my church or ministry?",
        a: "Yes! Provide your church details or GST number during checkout or request a quote on our Church Resources page.",
      },
    ],
  },
  {
    category: "Church Bulk Orders",
    items: [
      {
        q: "How do bulk discounts work?",
        a: "Discounts start at 10% off for 6–10 copies, 20% off for 11–25 copies, and 30% off for 26+ copies across any titles. Visit our Church Resources page for details.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="bg-offwhite min-h-screen py-12 md:py-20">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <p className="overline-label">Help Center</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-charcoal md:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-sm text-charcoal/60">
            Got questions? We&apos;ve got answers. If you can&apos;t find what you&apos;re looking for, feel free to contact us.
          </p>
        </div>

        <div className="space-y-10">
          {FAQ_SECTIONS.map((sec) => (
            <div key={sec.category}>
              <h2 className="font-display text-xl font-bold text-gold-dark mb-4">{sec.category}</h2>
              <div className="space-y-3">
                {sec.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-2xl border border-sand bg-white p-6 shadow-card"
                  >
                    <summary className="cursor-pointer list-none font-display font-bold text-charcoal marker:hidden">
                      <span className="flex items-center justify-between gap-4">
                        {item.q}
                        <span className="text-gold-dark transition-transform duration-300 group-open:rotate-45">
                          +
                        </span>
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl bg-white p-8 text-center border border-sand shadow-card">
          <h3 className="font-display text-xl font-bold text-charcoal">Still have questions?</h3>
          <p className="mt-2 text-xs text-charcoal/60">Our team is happy to help you find the right book or assist with your order.</p>
          <Link href="/contact" className="btn-gold mt-5 inline-block !py-3 !px-7">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
