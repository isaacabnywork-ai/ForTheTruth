import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | For The Truth",
  description: "Learn about shipping rates, dispatch times, free delivery terms, and tracking options across India.",
};

export default function ShippingPage() {
  return (
    <div className="bg-offwhite min-h-screen py-12 md:py-20">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <div className="mb-10">
          <p className="overline-label">Store Policy</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-charcoal md:text-4xl">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="mt-2 text-sm text-charcoal/60">
            Everything you need to know about how we package, dispatch, and deliver your books.
          </p>
        </div>

        <div className="space-y-8 rounded-3xl border border-sand bg-white p-8 shadow-card md:p-10 text-sm text-charcoal/75 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-charcoal mb-3">1. Free Shipping Threshold</h2>
            <p>
              We offer <strong>FREE Express Shipping</strong> on all orders of ₹499 or more delivered anywhere in India. For orders below ₹499, a flat shipping fee of <strong>₹49</strong> is automatically calculated at checkout.
            </p>
          </section>

          <section className="border-t border-sand/60 pt-6">
            <h2 className="font-display text-xl font-bold text-charcoal mb-3">2. Dispatch &amp; Delivery Timelines</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Dispatch:</strong> All in-stock orders are carefully packed and dispatched within 24 hours (excluding Sundays and national holidays).</li>
              <li><strong>Transit Time:</strong> Standard delivery takes <strong>5 to 7 business days</strong> depending on your pincode and location.</li>
              <li><strong>Pre-orders:</strong> Books marked &quot;Pre-order&quot; will be dispatched as soon as stock arrives at our warehouse. Estimated timelines are displayed on the product page.</li>
            </ul>
          </section>

          <section className="border-t border-sand/60 pt-6">
            <h2 className="font-display text-xl font-bold text-charcoal mb-3">3. Tracking Your Order</h2>
            <p>
              Once your package is shipped, you will receive an email and SMS with a tracking number and courier link. You can also view real-time status under your <Link href="/account/orders" className="text-gold-dark font-semibold hover:underline">Account Orders</Link>.
            </p>
          </section>

          <section className="border-t border-sand/60 pt-6">
            <h2 className="font-display text-xl font-bold text-charcoal mb-3">4. Packaging Quality</h2>
            <p>
              We take great pride in our packaging. Every book is wrapped securely to prevent bent corners or water damage during transit so your books arrive in pristine condition.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
