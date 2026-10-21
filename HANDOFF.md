# For The Truth — Project Handoff

Everything needed to continue this project. Written so a developer (or another AI) can pick it up cold.

**Project folder:** `/Users/abny/Desktop/FOR THE TRUTH/abny-books`
**Live backend:** WooCommerce at `https://forthetruth.in`
**Status:** Frontend complete through Phase 5. Not yet deployed. Some config and content pages outstanding.

---

## 1. What this project is

A headless e-commerce storefront for a Christian bookstore. WordPress/WooCommerce stays as the backend (products, orders, customers, reviews); this Next.js app replaces the slow WordPress frontend entirely.

**Two audiences:**
- Individual readers — browse, wishlist, buy single copies
- Churches/pastors — bulk orders, curriculum kits, invoicing/POs

**Design direction:** off-white and white base, gold `#d4a574` as the brand/styling color, navy `#1C3A70` for church/institutional sections and the footer, green `#1f7a5a` for primary CTAs only. Books are presented as physical objects — standing on shelves with ledges, spine creases, drop shadows.

---

## 2. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15.5 (App Router) | Server Components by default |
| Language | TypeScript (strict) | Path alias `@/*` → `src/*` |
| Styling | Tailwind CSS 3.4 | Custom theme in `tailwind.config.ts` |
| State | Zustand 5 | Cart + wishlist persisted to localStorage |
| Data fetching | Native `fetch` + Next ISR | TanStack Query installed but barely used |
| Forms | React Hook Form + Zod | Zod also validates all API route inputs |
| Auth | WordPress JWT plugin | Token in an httpOnly cookie |
| Payments | Razorpay | REST API directly, no SDK |
| Fonts | Fraunces (headings), Inter (body) | via `next/font/google` |

Node 22, npm. No database of its own — WooCommerce is the single source of truth.

---

## 3. Critical architecture rules

**These are non-negotiable. Breaking them creates security holes.**

1. **WooCommerce API keys are server-side only.** They live in `.env.local` as `WOOCOMMERCE_API_KEY` / `WOOCOMMERCE_API_SECRET` with no `NEXT_PUBLIC_` prefix. `src/services/woocommerce.ts` must never be imported into a `"use client"` component. Client components get data through `/api/*` routes instead.

2. **Never trust client-sent prices.** `/api/checkout` refetches every product from WooCommerce and recalculates the total server-side. The cart in the browser is for display only.

3. **Razorpay signatures are always verified.** Both the checkout callback (`/api/checkout/verify`) and the webhook (`/api/webhooks/razorpay`) verify HMAC signatures before marking an order paid.

4. **Session tokens never touch client JS.** The WP JWT is stored in an httpOnly cookie named `ftt_token`. `src/store/authStore.ts` holds only display fields (name, email) for the UI.

---

## 4. File map

```
abny-books/
├── .env.local                    # secrets — gitignored, NOT in the repo
├── .env.example                  # template with placeholders
├── tailwind.config.ts            # colors, shadows, gradients, type scale
├── next.config.ts                # image domains + security headers
└── src/
    ├── app/
    │   ├── layout.tsx            # fonts, Header, MobileNav, Footer
    │   ├── page.tsx              # homepage — orchestrates all sections
    │   ├── providers.tsx         # React Query provider
    │   ├── not-found.tsx / error.tsx / loading.tsx
    │   ├── products/
    │   │   ├── page.tsx          # catalog: pills, filters, pagination
    │   │   ├── [slug]/page.tsx   # product detail (+ Book JSON-LD)
    │   │   └── search/page.tsx
    │   ├── categories/page.tsx + [slug]/page.tsx
    │   ├── cart/page.tsx
    │   ├── checkout/page.tsx + confirmation/page.tsx
    │   ├── church-resources/page.tsx
    │   ├── (auth)/login/page.tsx + register/page.tsx
    │   ├── account/dashboard | orders | orders/[id] | profile | wishlist
    │   └── api/
    │       ├── auth/login | register | logout | me | profile
    │       ├── checkout/route.ts + checkout/verify/route.ts
    │       ├── webhooks/razorpay/route.ts
    │       ├── orders/route.ts + orders/[id]/route.ts
    │       ├── products/route.ts     # by-ID proxy for wishlist
    │       ├── search/route.ts       # autocomplete
    │       ├── reviews/route.ts
    │       └── quote/route.ts        # church quote — CURRENTLY ONLY LOGS
    ├── components/
    │   ├── common/    Header, MegaMenu, ChurchMegaMenu, MobileNav,
    │   │              SearchBar, Footer, NewsletterForm
    │   ├── home/      HeroShelf, TopicGrid, FeaturedPick,
    │   │              ChurchBanner, SpineSlider, Testimonials
    │   ├── products/  Bookshelf, ProductCard, ProductDetail,
    │   │              ProductFilters, Pagination, RatingStars, ReviewForm
    │   ├── account/   AccountShell, OrderStatusBadge
    │   ├── church/    QuoteForm
    │   └── ui/        Button, Field, Spinner
    ├── services/      woocommerce.ts, razorpay.ts
    ├── lib/           session.ts (WP JWT), productQuery.ts (URL → WC query)
    ├── hooks/         useAuth.ts
    ├── store/         cartStore, wishlistStore, authStore
    ├── config/        env.ts (Zod validation of server env)
    ├── types/         product.ts, cart.ts
    └── utils/         constants.ts (nav, trust copy), currency.ts
```

---

## 5. Key files explained

**`src/services/woocommerce.ts`** — the only place that talks to WooCommerce. Basic Auth, 2 retries with backoff, no retry on 4xx. Exports `getProducts`, `getProductsPaged` (returns pagination headers), `getProductBySlug`, `getCategories`, `getProductReviews`, `createOrder`, `updateOrder`, `getOrdersByCustomer`, `createCustomer`, etc. Every GET sets an ISR `revalidate` window (default 1h; 10min for products; 24h for categories; 0 for orders).

**`src/lib/session.ts`** — `wpLogin()` exchanges email/password for a JWT at `/wp-json/jwt-auth/v1/token`. `getSessionUser()` reads the cookie, validates against `/wp/v2/users/me`, then looks up the matching WooCommerce customer record. Returns `null` when logged out or expired.

**`src/lib/productQuery.ts`** — translates URL search params (`?price=300-499&orderby=price-asc&availability=instock`) into a WooCommerce query object. Used by the catalog, search, and category pages so all three filter identically.

**`src/app/api/checkout/route.ts`** — the most security-sensitive file. Validates input with Zod → refetches products → checks stock → recomputes subtotal → creates a pending WooCommerce order (WooCommerce applies the coupon) → creates a Razorpay order for the amount WooCommerce calculated → returns the order IDs to the browser.

**`src/utils/constants.ts`** — all nav structures and marketing copy: `NAV_LINKS`, `TOPICS`, `COLLECTIONS`, `CHURCH_LINKS`, `CHURCH_NEEDS`, `CHURCH_SUPPORT`, `READER_TRUST`, `CHURCH_TRUST`, `ANNOUNCEMENT`. Edit copy here, not in components.

---

## 6. Design system reference

```
Gold      #d4a574   brand, badges, logo accent, active states
  dark    #b8894f   text on light backgrounds
  deep    #8a6335   darkest gold text
Navy      #1C3A70   church sections, footer
CTA green #1f7a5a   primary buttons ONLY
Off-white #faf7f1   page background
Cream     #f5f0e6   subtle fills
Sand      #efe7d8   borders
Charcoal  #2c2c2c   body text
```

Utility classes defined in `src/styles/globals.css`: `.btn-cta`, `.btn-gold` (animated sheen), `.btn-outline`, `.btn-navy`, `.nav-link`, `.overline-label`, `.section-title`, `.badge`, `.skeleton`, `.scrollbar-hide`, `.text-gradient-gold`.

Custom shadows: `shadow-book`, `shadow-book-lg`, `shadow-card`, `shadow-card-hover`, `shadow-gold`, `shadow-cta`, `shadow-panel`, `shadow-ledge`.
Gradients: `bg-gold-gradient`, `bg-navy-gradient`, `bg-cream-mesh`, `bg-paper-texture`.

**Shelf pattern** (used in `Bookshelf.tsx`, hero, `SpineSlider`): a flex row of book covers with `items-end`, plus an absolutely positioned ledge div at `bottom-0` with a white-to-tan gradient and `shadow-ledge`. Books lift on hover with `-translate-y-4` and a slight rotate. **All shelves must use identical book dimensions** (`h-44 w-[118px]`, `md:h-56 md:w-[150px]`) — mismatched sizes were a bug that got fixed. Maximum 6 books per shelf.

---

## 7. What is built and working

- **Homepage:** hero (3-column: headline+search+CTA / floating 3D book / book details), topic grid with overlapping covers, New Arrivals and Bestsellers shelves, Featured Pick, navy church banner, spine slider (click a spine → book slides out), testimonials
- **Navigation:** sticky header, two mega menus (Books: topics/browse/new/church panel; Church Resources: needs/bulk/support/CTA), search with live autocomplete and recent searches, docked bottom bar + slide-in drawer on mobile
- **Catalog:** category pills, price/availability/on-sale filters, 5 sort options, pagination, all filter state in the URL
- **Product detail:** image gallery with thumbnails, tabs (description/reviews), review submission, related shelf, breadcrumbs, Book JSON-LD
- **Cart & checkout:** persistent cart, quantity controls, free-shipping progress, address forms, Razorpay modal, signature verification, confirmation page
- **Auth & account:** login, register, dashboard with stats, order history, order detail, profile editing, wishlist
- **Church:** `/church-resources` with pricing tiers, kits, how-it-works, quote form, FAQ
- **Error handling:** 404, error boundary, loading states

Verified: `npx tsc --noEmit` passes; `npx next build` compiles and generates 30 routes.

---

## 8. WHAT'S LEFT — the actual to-do list

### 8.1 Configuration you must do (blocks features)

**A. Install the WordPress JWT plugin** — without this, login/register/account pages fail.
1. WP Admin → Plugins → Add New → install **"JWT Authentication for WP REST API"** → Activate
2. Edit `wp-config.php`, above the "That's all" line:
   ```php
   define('JWT_AUTH_SECRET_KEY', 'paste-a-long-random-string-here');
   define('JWT_AUTH_CORS_ENABLE', true);
   ```
3. If using Apache, add to `.htaccess`:
   ```
   RewriteCond %{HTTP:Authorization} ^(.*)
   RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
   ```
4. Test: `curl -X POST https://forthetruth.in/wp-json/jwt-auth/v1/token -d "username=you@email.com&password=yourpass"` — should return a token.

**B. Razorpay**
1. Get test keys from the Razorpay dashboard → add to `.env.local`:
   `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...`, `RAZORPAY_KEY_SECRET=...`
2. Dashboard → Settings → Webhooks → add `https://your-domain/api/webhooks/razorpay`, events **payment.captured** and **payment.failed**, set a secret → put that secret in `RAZORPAY_WEBHOOK_SECRET`
3. Webhooks only fire on a public URL — use ngrok for local testing

**C. WooCommerce data**
1. Create a product attribute named exactly **Author**, assign it to products — otherwise author names are blank everywhere
2. Mark ~9 products as **Featured** — the hero and spine slider use these
3. Create ministry categories (Small Groups, Youth Ministry, Leadership, Sunday School, Bible Study, Devotionals) so the church menu links point somewhere real
4. Check WooCommerce → Settings → Shipping zones match the ₹49 / free-over-₹499 logic hardcoded in the app

### 8.2 Missing pages (every one of these is a 404 right now)

Linked from the nav/footer but never built:
`/about`, `/contact`, `/faq`, `/privacy`, `/terms`, `/shipping`, `/returns`

Also missing: **forgot-password / reset-password flow** (`/(auth)/forgot-password`, `/(auth)/reset-password` + an API route hitting WooCommerce's password reset), `sitemap.xml`, `robots.txt`, favicon, OG share image.

### 8.3 Stubs that need real implementations

| What | Where | Currently | Needs |
|---|---|---|---|
| Quote requests | `src/app/api/quote/route.ts` | `console.info()` only | Send email via Resend/SendGrid, or write to a CRM |
| Newsletter | `src/components/common/NewsletterForm.tsx` | Sets local state | POST to Mailchimp/Brevo with the reader/church segment |
| Bulk discounts | `/church-resources` page + `ChurchMegaMenu` | Hardcoded 10/20/30% display | Confirm real tiers; add discount logic to `/api/checkout` |
| Shipping cost | `src/app/api/checkout/route.ts` | Hardcoded ₹49 / free over ₹499 | Pull from WooCommerce shipping zones |
| Testimonials | `src/components/home/Testimonials.tsx` | Three invented quotes | Replace with real customer quotes |
| Church "Shop by Need" links | `src/utils/constants.ts` → `CHURCH_NEEDS` | Point to generic catalog filters | Point to real category slugs once created |

### 8.4 Features from the redesign spec, not yet built

- Product page: bulk pricing tab, author bio tab, sample-chapter preview, "often bought together"
- Author hub (`/authors`) with profiles and follow
- Blog / resources hub
- Church account type: organization registration, PO / Net-30 checkout path, saved order templates, bulk dashboard
- Curriculum kit builder
- Exit-intent popup, abandoned-cart emails, segmented email sequences
- "Did you mean?" typo suggestions in search

### 8.5 Pre-launch

- Analytics (GA4), error logging (Sentry)
- Lighthouse pass — targets: Performance >90, Accessibility >95, SEO >95
- Real-device mobile testing
- Deployment: build → PM2 → Nginx reverse proxy → Let's Encrypt SSL → DNS. Correct certbot command: `sudo certbot --nginx -d forthetruth.in -d www.forthetruth.in`

---

## 9. Working on this project

```bash
cd "/Users/abny/Desktop/FOR THE TRUTH/abny-books"
npm install
npm run dev          # http://localhost:3000
npx tsc --noEmit     # typecheck
npm run build        # production build
```

**Gotcha:** after editing `tailwind.config.ts` or `globals.css`, stop the dev server, delete `.next/`, and restart — otherwise you get phantom "class does not exist" errors from the stale cache.

**Conventions to follow:**
- Server Components by default; add `"use client"` only for interactivity
- Client components fetch through `/api/*`, never from `services/woocommerce.ts`
- Validate every API route input with Zod
- Copy lives in `src/utils/constants.ts`
- Use the existing utility classes rather than inventing new color values
- `params` and `searchParams` are Promises in Next 15 — always `await` them

---

## 10. Prompts to hand another AI

Give it this file first, then one of these:

> Read HANDOFF.md. Build the missing static pages listed in 8.2: /about, /contact, /faq, /privacy, /terms, /shipping, /returns. Match the existing design system exactly — study src/app/church-resources/page.tsx for section patterns and use the utility classes in globals.css. Content should suit an Indian Christian bookstore serving both individual readers and churches. Then run npx tsc --noEmit and npm run build to verify.

> Read HANDOFF.md. Build the forgot-password and reset-password flow described in 8.2, following the auth patterns in src/app/(auth)/login/page.tsx and src/app/api/auth/login/route.ts. Use WooCommerce's password reset endpoints. Validate inputs with Zod.

> Read HANDOFF.md. Implement real bulk pricing (8.3): add a tier calculation to /api/checkout so orders of 6+/11+/26+ copies get 10/20/30% off, show a bulk pricing tab on the product detail page, and surface the applied discount in the cart summary. Never trust client-sent prices — recompute server-side.

> Read HANDOFF.md. Connect the quote form and newsletter (8.3) to [your provider]. The quote route is src/app/api/quote/route.ts and currently only logs.

---

## 11. Admin area (added later by another AI, then secured)

A `/admin` area exists: POS terminal, orders ledger, product/inventory manager, shelf curator, quote inbox. **Security model (do not weaken):**

- Admin = logged-in WP user whose email is in the `ADMIN_EMAILS` env var (comma-separated). Guard: `src/lib/adminGuard.ts`.
- Every mutating `/api/admin/*` route calls `requireAdmin()` and returns 401 otherwise. Any NEW admin route must do the same.
- `/api/admin/session` (GET) tells the UI whether the session is admin; `AdminShell` gates on it and `StaffLockScreen` does a real WP login. There are NO hardcoded PINs or passwords — an earlier version had client-side PIN checks (`1234` etc.), which was a critical hole and was removed. Never reintroduce client-side credential checks.
- Client admin components may import **types** from `services/woocommerce` (`import type` is erased at build), but never runtime functions.

## 12. Known issues / decisions made

- **ISR staleness:** product pages cache for 10 minutes, so price/stock edits in WordPress take up to 10 min to appear. Reduce `revalidate` in `getProductBySlug` if that's too slow.
- **Wishlist is local-only:** stored in localStorage, not synced to the user account. Syncing needs WP user meta or a custom table.
- **No pre-order table:** out-of-stock items are labeled "Pre-order" but flow through the normal cart. The roadmap's custom `pre_orders` table was intentionally skipped — writing directly to the WP database from Next.js is fragile; use WooCommerce's backorder settings or a pre-order plugin instead.
- **`npm audit` shows high-severity warnings** — these come from dev-tool dependency chains and don't ship in the production bundle. `npm audit fix` (without `--force`) is safe; don't use `--force`, it downgrades Next.js.
- **Roadmap corrections:** the original plan specified Next 14 / React 18, `getStaticProps` (doesn't exist in App Router), FID (replaced by INP), and `NEXT_PUBLIC_` WooCommerce keys (a serious security hole). All were corrected during the build. See ROADMAP.md v1.1.
