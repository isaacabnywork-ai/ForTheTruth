import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQs) | For The Truth",
  description:
    "Find answers to frequently asked questions about orders, payments, shipping, bulk purchases, Statement of Faith, and more at For The Truth.",
};

interface FAQItem {
  q: string;
  a: string | React.ReactNode;
}

const FAQS: FAQItem[] = [
  {
    q: "What is For The Truth?",
    a: "For The Truth Press Pvt. Ltd. is a publishing ministry which exists to print, publish & distribute resources for the church.",
  },
  {
    q: "How do I place an order?",
    a: "Placing an order on For The Truth is simple. Just browse through our collection, select the books you wish to purchase, and add them to your cart. Once you’re ready, proceed to checkout, where you’ll provide your shipping and payment details to complete the purchase.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept various payment methods, including credit/debit cards, UPI, and other secure online payment options. We prioritize the security of your transactions to ensure a smooth and safe shopping experience.",
  },
  {
    q: "How is shipping handled?",
    a: "We strive to deliver your order promptly and efficiently. After placing your order, our team processes it swiftly, and we partner with reliable shipping carriers to ensure timely delivery to your doorstep. Shipping costs and delivery times may vary depending on your location.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship internationally to selected countries (India, UAE, Nepal, ). However, shipping options and delivery times may vary based on your location. During the checkout process, you’ll be able to see the available shipping methods and associated costs for your specific region.",
  },
  {
    q: "What if I receive a damaged or incorrect item?",
    a: "While we take utmost care in packaging and shipping your orders, if you receive a damaged or incorrect item, please contact our customer support team immediately. We’ll work swiftly to resolve the issue and ensure you receive the correct item or a refund, as per our return and exchange policy.",
  },
  {
    q: "Can I cancel or modify my order after it’s been placed?",
    a: "We understand that circumstances may change, and you may need to modify or cancel your order. If you need to make any changes, please contact us as soon as possible. While we’ll do our best to accommodate your request, please note that orders are processed quickly, and modifications may not always be possible once the order is confirmed.",
  },
  {
    q: "Do you offer gift wrapping or special packaging options?",
    a: (
      <span>
        We do offer gift wrapping or special packaging options.{" "}
        <Link href="/contact" className="font-semibold text-gold-dark hover:underline">
          Contact us
        </Link>{" "}
        for more details.
      </span>
    ),
  },
  {
    q: "How can I contact customer support?",
    a: (
      <span>
        If you have any questions, concerns, or feedback, our dedicated customer support team is here to assist you. You can reach out to us via email at{" "}
        <a href="mailto:support@forthetruth.in" className="font-semibold text-gold-dark hover:underline">
          support@forthetruth.in
        </a>{" "}
        or direct call{" "}
        <a href="tel:+918604685533" className="font-semibold text-gold-dark hover:underline">
          8604685533
        </a>{" "}
        or through the{" "}
        <Link href="/contact" className="font-semibold text-gold-dark hover:underline">
          contact form
        </Link>{" "}
        on our website. We strive to respond to all inquiries promptly and provide the best possible assistance.
      </span>
    ),
  },
  {
    q: "Do you offer discounts or promotions?",
    a: "We occasionally run special promotions and offer discounts on selected items. To stay updated on our latest offers, promotions, and new arrivals, be sure to subscribe to our newsletter and follow us on social media platforms. Don’t miss out on exciting deals and exclusive offers!",
  },
  {
    q: "Do you offer digital or e-book versions of your books?",
    a: (
      <span>
        At For The Truth, we primarily focus on providing physical copies of books. However, we understand the growing demand for digital formats. We provide one free eBook every month to our subscriber. You can also find free eBooks on our{" "}
        <Link href="/free-ebooks" className="font-semibold text-gold-dark hover:underline">
          eBooks collection
        </Link>
        .
      </span>
    ),
  },
  {
    q: "Are there any membership or loyalty programs available?",
    a: "Currently, we do not have a formal membership or loyalty program. However, we value our customers and may introduce such programs in the future to reward your continued support. Be sure to sign up for our newsletter to stay informed about any upcoming loyalty initiatives.",
  },
  {
    q: "What if the book I want is out of stock?",
    a: (
      <span>
        If a particular book is out of stock, you can sign up for notifications to be alerted when it becomes available again. Additionally, you can explore similar titles in our collection that may align with your interests. We regularly update our inventory, so check back often for new arrivals and restocks. You can also view all currently{" "}
        <Link href="/products?availability=outofstock" className="font-semibold text-gold-dark hover:underline">
          Out of Stock titles
        </Link>
        .
      </span>
    ),
  },
  {
    q: "Can I request a specific book that is not currently listed on your website?",
    a: (
      <span>
        Absolutely! We welcome suggestions and feedback from our customers. If there’s a specific book you’re interested in that is not currently available on our website, please{" "}
        <Link href="/contact" className="font-semibold text-gold-dark hover:underline">
          contact us
        </Link>
        .
      </span>
    ),
  },
  {
    q: "Are the books on your website authentic and original editions?",
    a: "Yes, all the books offered on our website are authentic and mostly self-published or sourced directly from publishers. We take pride in providing our customers with high-quality, genuine books that meet our standards of excellence.",
  },
  {
    q: "Do you offer wholesale or bulk purchasing options?",
    a: (
      <span>
        Yes, we offer wholesale and bulk purchasing options for individuals, organizations, and businesses looking to buy in larger quantities. Whether you’re stocking a library, bookstore, or educational institution, we can accommodate your needs. Please{" "}
        <Link href="/church-resources#quote" className="font-semibold text-gold-dark hover:underline">
          contact us for more information and pricing
        </Link>
        .
      </span>
    ),
  },
  {
    q: "How do you handle returns and exchanges?",
    a: (
      <span>
        We want you to be completely satisfied with your purchase. If for any reason you’re not happy with your order, please refer to our{" "}
        <Link href="/privacy#return-and-refund" className="font-semibold text-gold-dark hover:underline">
          returns and exchange policy
        </Link>{" "}
        outlined on our website. You can initiate a return or exchange within 7 days of receiving your order, provided the item is in its original condition.
      </span>
    ),
  },
  {
    q: "Do you offer any resources for book recommendations or reading lists?",
    a: "Yes, we regularly curate reading lists and recommend books across various genres and topics. You can explore these recommendations on our website’s blog section or follow us on social media for curated book suggestions, author spotlights, and reading challenges.",
  },
  {
    q: "How can I stay updated on For The Truth’s latest news and offerings?",
    a: "To stay informed about our latest news, book releases, promotions, and events, we encourage you to subscribe to our newsletter and follow us on social media platforms such as Facebook, Twitter, and Instagram. Join our community of readers and stay connected with For The Truth!",
  },
  {
    q: "What is your Statement of Faith?",
    a: (
      <Link
        href="/statement-of-faith"
        className="inline-flex items-center gap-1.5 font-bold text-gold-dark hover:underline"
      >
        Read our Statement of Faith <span>→</span>
      </Link>
    ),
  },
  {
    q: "What is your Shipping Policy?",
    a: (
      <Link
        href="/privacy#shipping"
        className="inline-flex items-center gap-1.5 font-bold text-gold-dark hover:underline"
      >
        Read our Shipping Policy <span>→</span>
      </Link>
    ),
  },
  {
    q: "What is your Privacy Policy?",
    a: (
      <Link
        href="/privacy#privacy"
        className="inline-flex items-center gap-1.5 font-bold text-gold-dark hover:underline"
      >
        Read our Privacy Policy <span>→</span>
      </Link>
    ),
  },
  {
    q: "What are the Terms & Conditions?",
    a: (
      <Link
        href="/terms"
        className="inline-flex items-center gap-1.5 font-bold text-gold-dark hover:underline"
      >
        Read our Terms &amp; Conditions <span>→</span>
      </Link>
    ),
  },
  {
    q: "Where can I find Hindi books?",
    a: (
      <a
        href="https://margsatyajeevan.com/shop/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-bold text-gold-dark hover:underline"
      >
        Know More <span>↗</span>
      </a>
    ),
  },
];

export default function FAQPage() {
  return (
    <div className="bg-offwhite min-h-screen py-12 md:py-20">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <p className="overline-label text-gold-dark">Help Center</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-charcoal sm:text-4xl md:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-charcoal/65">
            Everything you need to know about purchasing, shipping, doctrine, and ministry with For The Truth.
          </p>
        </div>

        <div className="space-y-3.5">
          {FAQS.map((item, idx) => (
            <details
              key={idx}
              className="group rounded-2xl border border-sand bg-white p-5 sm:p-6 shadow-card transition-colors open:border-gold/50"
            >
              <summary className="cursor-pointer list-none font-display text-base sm:text-lg font-bold text-charcoal marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  <span>{item.q}</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream text-lg font-black text-gold-dark transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <div className="mt-3.5 border-t border-sand/50 pt-3 text-sm sm:text-base leading-relaxed text-charcoal/75">
                {item.a}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-cream p-8 text-center border border-sand/80 shadow-sm md:p-10">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-charcoal">
            Still have questions?
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-charcoal/65 max-w-md mx-auto">
            Our support team is happy to help with orders, bulk ministry discounts, or recommendations.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn-cta text-sm px-6 py-2.5">
              Contact Us →
            </Link>
            <a
              href="mailto:contact@forthetruth.in"
              className="btn-outline text-sm px-6 py-2.5"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
