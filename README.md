# For The Truth — Bookstore Frontend

Headless bookstore: Next.js 15 (App Router) + TypeScript + Tailwind, backed by WooCommerce at forthetruth.in. Payments via Razorpay.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev                  # http://localhost:3000
```

## What's built (Phases 1–5)

- **Home:** shelf-panel hero, "pull one out" spine slider, bookshelves (max 6/shelf)
- **Catalog:** /products with category pills, price/availability/sale filters, sorting, pagination; /products/search; /categories + per-category pages
- **Product detail:** gallery, tabs, reviews + review submission, related shelf, Book JSON-LD
- **Auth:** /login, /register (WP JWT), httpOnly cookie session; /api/auth/*
- **Account:** dashboard, orders list + detail, wishlist, profile editing
- **Cart & checkout:** persistent cart, checkout form, server-side total recomputation, Razorpay modal, signature verification, webhook reconciliation, order confirmation
- **Polish:** 404 / error / loading pages, mobile island nav + drawer, mega menu

## WordPress requirements

1. **WooCommerce REST keys** (Read/Write) — already in `.env.local`.
2. **JWT plugin for login:** install "JWT Authentication for WP REST API", then add to `wp-config.php`:
   ```php
   define('JWT_AUTH_SECRET_KEY', 'a-long-random-secret');
   define('JWT_AUTH_CORS_ENABLE', true);
   ```
   Without this plugin, browsing/cart/checkout still work — only login/registration/account pages need it.
3. **Author attribute:** create a product attribute named "Author" so authors show on cards.
4. **Featured products:** star products in WP Admin to control the hero + spine slider.

## Razorpay setup

- Test keys in `.env.local` (`rzp_test_…`) for development.
- Webhook (Razorpay dashboard → Webhooks): URL `https://your-domain/api/webhooks/razorpay`, events `payment.captured` + `payment.failed`, secret = `RAZORPAY_WEBHOOK_SECRET`.

## Notes

- WooCommerce API keys are server-side only. All prices/totals are recomputed server-side at checkout; coupons are validated by WooCommerce.
- Product data caches for 10–60 min (ISR). Restart dev server after changing `.env.local` or `tailwind.config.ts` (and delete `.next/` if styles look stale).
