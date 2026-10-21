# ABNY Books - Next.js E-commerce Bookstore
## Complete Development Roadmap & Technical Specifications
**Project:** Headless e-commerce bookstore powered by WooCommerce backend
**Timeline:** August - September 2026
**Total Books:** 600
**Tech Stack:** Next.js 14+ | React 18+ | TypeScript | Tailwind CSS
**Backend:** WooCommerce REST API (existing)
**Hosting:** AWS/VPS (custom server)
**Payment:** Razorpay

---

## 🎯 PROJECT OBJECTIVES

1. ✅ Create fast, modern bookstore (0.5-1s page load time)
2. ✅ Replace slow WordPress e-commerce site
3. ✅ Integrate with existing WooCommerce backend
4. ✅ Support 600 books with advanced filtering
5. ✅ Handle user accounts, reviews, wishlists, pre-orders
6. ✅ Razorpay payment integration
7. ✅ SEO optimized for book discovery
8. ✅ Mobile-first responsive design

---

## 🎨 DESIGN SYSTEM & BRANDING

### Color Palette (Modern & Premium)
```
Primary:        #1a3a52 (Deep Navy Blue)
Secondary:      #d4a574 (Warm Gold)
Accent:         #2d6a4f (Emerald Green)
Neutral Light:  #f8f6f1 (Cream)
Neutral Dark:   #2c2c2c (Charcoal)
Success:        #10b981 (Emerald)
Error:          #ef4444 (Red)
Warning:        #f59e0b (Amber)
```

### Typography
- **Headings:** Merriweather (serif) - premium, bookish feel
- **Body:** Inter (sans-serif) - modern, readable
- **Accents:** Playfair Display (serif) - elegant callouts

### Design Principles
- Clean, minimal layouts
- Large, high-contrast typography
- Beautiful book cover imagery
- Smooth, performant animations
- Mobile-first responsive (320px → 1920px)
- Accessibility-first (WCAG 2.1 AA standard)

---

## 🏗️ TECHNICAL ARCHITECTURE

### Tech Stack Details
```
Frontend Framework:     Next.js 14.x (App Router)
React Version:          18.x
Language:               TypeScript
Styling:                Tailwind CSS 3.x
State Management:       Zustand (lightweight)
HTTP Client:            TanStack Query (React Query)
Authentication:         NextAuth.js (JWT + WordPress JWT)
Form Handling:          React Hook Form + Zod validation
Image Optimization:     Next.js Image component
Caching:                Redis (optional, for API responses)
Package Manager:        npm or pnpm
Linting:                ESLint + Prettier
Testing:                Jest + React Testing Library
Build Tool:             Webpack (built-in to Next.js)
```

### Project Structure
```
abny-books/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Homepage
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx            # Product listing (SSG)
│   │   │   ├── [slug]/page.tsx     # Product detail (SSG)
│   │   │   └── search/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── account/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── wishlist/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── orders/[id]/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── checkout/route.ts
│   │       └── webhooks/razorpay/route.ts
│   ├── components/
│   │   ├── common/ (Header, Footer, Navigation, SearchBar)
│   │   ├── products/ (ProductCard, ProductGrid, ProductDetail, ProductFilters, RatingStars)
│   │   ├── cart/ (CartItem, CartSummary, MiniCart)
│   │   ├── auth/ (LoginForm, RegisterForm, ProtectedRoute)
│   │   └── ui/ (Button, Modal, Spinner, Toast, Badge)
│   ├── hooks/ (useCart, useAuth, useFetch, useWishlist, useFilters)
│   ├── services/ (woocommerce, razorpay, auth, checkout)
│   ├── store/ (cartStore, authStore, filtersStore, wishlistStore)
│   ├── types/ (product, order, user, cart, api)
│   ├── utils/ (currency, validation, formatters, constants)
│   ├── config/ (env, woocommerce.config)
│   └── styles/globals.css
├── public/ (images, icons, fonts)
├── .env.local / .env.example
├── next.config.js, tsconfig.json, tailwind.config.js, postcss.config.js
└── package.json
```

### Environment Variables
```env
# WooCommerce API (server-side only — never expose keys with NEXT_PUBLIC_)
NEXT_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com
WOOCOMMERCE_API_KEY=your_api_key
WOOCOMMERCE_API_SECRET=your_api_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here
JWT_SECRET=your_jwt_secret

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Optional
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

---

# ⚙️ PHASE 1: FOUNDATION & SETUP (Week 1-2)
## Objective: Project setup, API integration, basic UI components

### 1.1 Project Initialization
- [x] Initialize Next.js project with TypeScript
- [x] Install & configure Tailwind CSS
- [x] Setup ESLint + Prettier
- [x] Configure TypeScript paths
- [x] Setup Git repository
- [x] Create .env.local and .env.example
- [x] Install core dependencies

### 1.2 Core Dependencies
```bash
npm install zustand axios @tanstack/react-query next-auth jsonwebtoken
npm install react-hook-form zod @hookform/resolvers date-fns classnames
npm install -D tailwindcss postcss autoprefixer
```

### 1.3 WooCommerce API Integration Service
**File:** `src/services/woocommerce.ts`
- WooCommerce client with Basic Auth (server-side only)
- Methods: getProducts, getProduct, getCategories, getProductsByCategory, searchProducts, getProductReviews, createOrder, getOrders, updateProduct
- Error handling, retry logic, request logging
- Cache responses with React Query / Next fetch cache

Key endpoints:
```
GET  /wp-json/wc/v3/products
GET  /wp-json/wc/v3/products/:id
GET  /wp-json/wc/v3/products/categories
GET  /wp-json/wc/v3/products/reviews
POST /wp-json/wc/v3/orders
GET  /wp-json/wc/v3/orders/:id
```

### 1.4 Layout & Navigation Components
- **Header:** logo, search bar, nav menu, mobile hamburger, user dropdown, mini-cart icon
- **Navigation:** mega menu with categories, active state highlighting
- **Footer:** links, newsletter signup, social links, copyright
- **SearchBar:** debounced input, suggestions dropdown, clear button

### 1.5 Global Styles & Theme
CSS variables for colors, typography scales, spacing system, smooth transitions.

### 1.6 Zustand Stores
- **cartStore:** addToCart, removeFromCart, updateQuantity, clearCart, getTotal
- **authStore:** setUser, logout, isAuthenticated
- **wishlistStore:** addToWishlist, removeFromWishlist, isInWishlist

### 1.7 Homepage (Basic)
Hero banner, featured books carousel, category preview cards, newsletter signup.

### 1.8 Deliverables
✅ Next.js project running locally · WooCommerce API integration · Header/Footer/Nav · Zustand stores · Homepage · Global styles · TypeScript types

### 1.9 Testing Checklist
- [ ] `npm run dev` — no errors
- [ ] Homepage loads in <1 second
- [ ] API calls to WooCommerce work
- [ ] Stores persist/clear correctly
- [ ] Mobile responsive on 320px+
- [ ] Search bar functional

---

# 📦 PHASE 2: PRODUCTS & BROWSING (Week 3-4)
## Objective: Product listing, filtering, search, detail pages

### 2.1 Product Listing Page (SSG/ISR)
- All 600 books in grid, 20 per page, pagination
- Sort: Newest, Price ↑↓, Bestselling, Rating
- Cards: cover, title, author, price, rating, Add to Cart
- ISR revalidation (hourly), lazy loaded images, dynamic SEO metadata

### 2.2 Product Filtering
Filters: category, price range slider (₹0–₹5000), rating, availability (in stock/pre-order), format, author, language. Filters stored in URL query params, debounced, clear-all button.

### 2.3 Product Detail Page (SSG)
Cover gallery, title/author/ISBN, price + discount, rating, description, Add to Cart / Wishlist, pre-order option, related products, reviews, quantity selector, stock status, shipping info. All 600 pages generated via `generateStaticParams()`.

### 2.4 Search
Full-text search across names/descriptions/authors, suggestions, debounce 300ms, filters on results, no-results handling.

### 2.5 Reviews & Ratings Display
Average rating, individual reviews, sort/filter, pagination (5/page), verified purchase badge.

### 2.6 Category Pages
Category-specific listing, breadcrumbs, description/image, filters, SEO metadata.

### 2.7 Responsive Grid
Desktop 4 cols / tablet 3 / mobile 2 / small 1 — Tailwind responsive classes.

### 2.8 Image Optimization
Next Image, blur placeholders, WebP/AVIF, responsive srcset.

### 2.9 SEO
Dynamic titles/descriptions, Open Graph, canonical URLs, Schema.org JSON-LD, sitemap.

### Performance Targets
Product listing <0.8s FCP · Product detail <0.6s FCP · TTI <1.2s · Lighthouse >90

---

# 👤 PHASE 3: USER AUTHENTICATION & ACCOUNTS (Week 5)

### 3.1 NextAuth.js Setup
WordPress JWT provider (WP JWT Authentication plugin required), JWT session strategy, refresh token logic.

### 3.2–3.4 Auth Pages
Register (validation, password strength), Login (remember me, error handling), Forgot/Reset password flow (24h token expiry).

### 3.5–3.8 Account Pages
Dashboard (profile overview, recent orders, stats), Profile edit (avatar upload, change password), Orders history table, Order details page (addresses, items, tracking, cancel).

### 3.9 Protected Routes
Auth check wrapper, redirect to login, loading state.

### 3.11 Email Notifications
Configure in WooCommerce: registration, password reset, order confirmation, status updates.

---

# 🛒 PHASE 4: SHOPPING CART & CHECKOUT (Week 6-7)

### 4.1 Cart System
Zustand + localStorage persistence, add/remove/update/clear, totals recomputed server-side at checkout.

### 4.2–4.3 Cart UI
MiniCart in header (count badge, hover dropdown), full cart page (items table 70% / summary 30%, coupon input, stock validation, empty state).

### 4.4–4.6 Checkout Flow
Shipping address → billing → order review. React Hook Form + Zod, auto-populate for logged-in users.

### 4.7 Razorpay Integration
```
1. POST /api/checkout → validate cart server-side, recompute totals
2. Create WooCommerce order (pending) + Razorpay order
3. Open Razorpay modal on frontend
4. Payment → callback → verify signature on backend
5. Update order status → clear cart → confirmation page
```

### 4.8–4.9 Confirmation & Webhooks
Order confirmation page. Webhook handler for `payment.captured` (verify webhook signature, update order, send email).

### 4.10–4.12 Extras
Coupon codes (validate via WooCommerce), shipping cost calculation with method selection, pre-order handling for out-of-stock books.

---

# ⭐ PHASE 5: WISHLIST, REVIEWS & POLISH (Week 8)

### 5.1–5.2 Wishlist
Heart toggle on cards, wishlist page with move-to-cart, synced to user account.

### 5.3–5.4 Review Submission
Interactive star rating, title + text (min 20 chars), logged-in + verified-purchase only, moderation queue, sorting/filtering.

### 5.5–5.6 Performance
Progressive/AVIF images, code splitting, ISR caching strategy, bundle analysis. Lighthouse targets: Performance >90, Accessibility >95, SEO >95. Core Web Vitals: LCP <2.5s, INP <200ms, CLS <0.1.

### 5.7–5.9 Polish
Mobile testing (real devices, slow 4G), accessibility audit (WCAG 2.1 AA, keyboard nav, screen readers), error boundaries + 404/500 pages.

### 5.10–5.12 Launch
Analytics, deployment (PM2 + Nginx + Let's Encrypt: `sudo certbot --nginx -d domain.com -d www.domain.com`), Sentry error logging, uptime monitoring.

---

## 🔒 SECURITY CHECKLIST
- [ ] HTTPS enabled, CORS configured
- [ ] WooCommerce API keys server-side ONLY (never NEXT_PUBLIC_)
- [ ] JWT auth, password hashing handled by WordPress
- [ ] Server-side total recalculation at checkout (never trust client prices)
- [ ] Razorpay signature verification (payment + webhook)
- [ ] XSS protection (CSP), CSRF tokens, rate limiting
- [ ] Input validation & sanitization (Zod on both ends)
- [ ] Secrets in env vars, not code; sensitive data not logged
- [ ] Security headers (X-Frame-Options, etc.)

---

## ✅ FINAL LAUNCH CHECKLIST
All phases complete · Lighthouse >90 · mobile verified · 600 books indexed · payment tested · registration works · emails working · wishlist + reviews functional · security audit passed · backups + monitoring configured · DNS + SSL active · sitemap submitted · analytics + error logging live

---

**Document Version:** 1.1 (revised after technical review)
**Created:** July 27, 2026
