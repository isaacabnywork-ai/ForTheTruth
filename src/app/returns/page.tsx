import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns & Refunds Policy | For The Truth",
  description: "Read our returns, replacements, and refund policy for damaged or incorrect book orders.",
};

export default function ReturnsPage() {
  return (
    <div className="bg-offwhite min-h-screen py-12 md:py-20">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <div className="mb-10">
          <p className="overline-label">Store Policy</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-charcoal md:text-4xl">
            Returns &amp; Refunds Policy
          </h1>
          <p className="mt-2 text-sm text-charcoal/60">
            Our commitment to customer satisfaction and honest service.
          </p>
        </div>

        <div className="space-y-8 rounded-3xl border border-sand bg-white p-8 shadow-card md:p-10 text-sm text-charcoal/75 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-charcoal mb-3">1. Damaged or Defective Items</h2>
            <p>
              If your book arrives damaged, with misprinted pages, or if you receive an incorrect item, we will happily replace it or issue a full refund at no extra cost to you.
            </p>
            <p className="mt-2">
              Please notify us within <strong>7 days of delivery</strong> by emailing <a href="mailto:abnyserver@gmail.com" className="text-gold-dark font-semibold hover:underline">abnyserver@gmail.com</a> with your order number and a photo of the damaged book.
            </p>
          </section>

          <section className="border-t border-sand/60 pt-6">
            <h2 className="font-display text-xl font-bold text-charcoal mb-3">2. Change of Mind Returns</h2>
            <p>
              If you ordered a book by mistake or changed your mind, you may return unopened, unread items in original condition within 7 days. Return shipping costs in change-of-mind cases are the responsibility of the customer.
            </p>
          </section>

          <section className="border-t border-sand/60 pt-6">
            <h2 className="font-display text-xl font-bold text-charcoal mb-3">3. Refund Processing</h2>
            <p>
              Once your returned item is received and inspected, we will notify you of the approval. Approved refunds are processed to your original payment method (via Razorpay) within <strong>5 to 7 business days</strong>.
            </p>
          </section>

          <section className="border-t border-sand/60 pt-6">
            <h2 className="font-display text-xl font-bold text-charcoal mb-3">4. Need Assistance?</h2>
            <p>
              Have a question about your order return? Contact us at <Link href="/contact" className="text-gold-dark font-semibold hover:underline">Contact Support</Link> or email abnyserver@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
